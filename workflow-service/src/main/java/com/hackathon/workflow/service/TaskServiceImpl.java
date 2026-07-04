package com.hackathon.workflow.service;

import com.hackathon.common.constant.ClaimStatus;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.ClaimEvent;
import com.hackathon.common.dto.FraudRequest;
import com.hackathon.common.dto.FraudResponse;
import com.hackathon.common.exception.BadRequestException;
import com.hackathon.common.exception.ResourceNotFoundException;
import com.hackathon.workflow.client.ClaimClient;
import com.hackathon.workflow.client.FraudClient;
import com.hackathon.workflow.entity.Task;
import com.hackathon.workflow.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskServiceImpl.class);

    private final TaskRepository taskRepository;
    private final ClaimClient claimClient;
    private final FraudClient fraudClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public TaskServiceImpl(TaskRepository taskRepository,
                           ClaimClient claimClient,
                           FraudClient fraudClient,
                           KafkaTemplate<String, Object> kafkaTemplate) {
        this.taskRepository = taskRepository;
        this.claimClient = claimClient;
        this.fraudClient = fraudClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public Task claimTask(Long taskId, String username) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        if (!"PENDING".equals(task.getStatus())) {
            throw new BadRequestException("Task is not in PENDING status");
        }

        if (task.getAssignedUserId() != null) {
            throw new BadRequestException("Task is already claimed by " + task.getAssignedUserId());
        }

        task.setAssignedUserId(username);
        return taskRepository.save(task);
    }

    @Override
    public Task completeTaskAction(Long taskId, String username, String actionDecision, String comment) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        if (!"PENDING".equals(task.getStatus())) {
            throw new BadRequestException("Task is not in PENDING status");
        }

        if (!username.equals(task.getAssignedUserId())) {
            throw new BadRequestException("Task must be claimed by you before taking action");
        }

        task.setStatus("COMPLETED");
        task.setActionDecision(actionDecision);
        task.setComment(comment);
        task.setCompletedAt(Instant.now());
        Task savedTask = taskRepository.save(task);

        // Map decision to claim status
        ClaimStatus newClaimStatus;
        if ("APPROVE".equalsIgnoreCase(actionDecision)) {
            newClaimStatus = ClaimStatus.APPROVED;
        } else if ("REJECT".equalsIgnoreCase(actionDecision)) {
            newClaimStatus = ClaimStatus.REJECTED;
        } else if ("REQUEST_DOCS".equalsIgnoreCase(actionDecision)) {
            newClaimStatus = ClaimStatus.PENDING_REVIEW;
        } else {
            throw new BadRequestException("Invalid action decision: " + actionDecision);
        }

        // Call Claim Service via Feign
        try {
            claimClient.updateClaimStatus(task.getClaimId(), newClaimStatus);
            log.info("Claim status successfully updated to {} via Feign for claim ID: {}", newClaimStatus, task.getClaimId());
        } catch (Exception e) {
            log.error("Failed to update claim status via Feign for claim ID: {}", task.getClaimId(), e);
        }

        // Publish event to Kafka
        ClaimEvent event = ClaimEvent.builder()
                .claimId(task.getClaimId())
                .status(newClaimStatus)
                .username(username)
                .comment(comment)
                .timestamp(Instant.now())
                .build();

        try {
            kafkaTemplate.send("claim-status-updates", event);
            log.info("Claim status update event published to Kafka for claim ID: {}", task.getClaimId());
        } catch (Exception e) {
            log.error("Failed to publish claim status update event to Kafka for claim ID: {}", task.getClaimId(), e);
        }

        return savedTask;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Task> getPendingQueueTasks(String role, Pageable pageable) {
        return taskRepository.findByAssignedRoleAndStatus(role, "PENDING", pageable);
    }

    @Override
    public void processClaimSubmission(ClaimEvent event) {
        log.info("Processing claim submission in Workflow state machine. Claim ID: {}", event.getClaimId());

        // Call Fraud Service via Feign
        FraudResponse fraudResponse = null;
        try {
            FraudRequest fraudRequest = FraudRequest.builder()
                    .claimId(event.getClaimId())
                    .policyNumber(event.getPolicyNumber())
                    .claimAmount(event.getClaimAmount())
                    .lossType(event.getLossType())
                    .description(event.getDescription())
                    .username(event.getUsername())
                    .build();
            ApiResponse<FraudResponse> apiResponse = fraudClient.validateClaim(fraudRequest);
            if (apiResponse != null && apiResponse.isSuccess()) {
                fraudResponse = apiResponse.getData();
            }
        } catch (Exception e) {
            log.error("Failed to contact Fraud Service via Feign. Falling back to default risk rules.", e);
        }

        boolean isFlagged = false;
        int riskScore = 0;
        
        if (fraudResponse != null) {
            riskScore = fraudResponse.getRiskScore();
            isFlagged = "FLAGGED".equals(fraudResponse.getStatus());
        } else {
            // In-memory fallback rules
            if (event.getClaimAmount() >= 5000.0) {
                isFlagged = true;
                riskScore = 30;
            }
            if (event.getPolicyNumber() == null || !event.getPolicyNumber().startsWith("POL-")) {
                isFlagged = true;
                riskScore = 50;
            }
        }

        String assignedRole = "ROLE_PROCESSOR";
        ClaimStatus nextStatus = ClaimStatus.PENDING_REVIEW;

        // Escalate high-value claims or flagged fraud scores to Managers
        if (isFlagged || event.getClaimAmount() >= 5000.0) {
            assignedRole = "ROLE_MANAGER";
            nextStatus = ClaimStatus.FLAGGED_FOR_REVIEW;
        }

        // Call Claim Service via Feign to update status
        try {
            claimClient.updateClaimStatus(event.getClaimId(), nextStatus);
            log.info("Claim status transitioned to {} for claim ID: {}", nextStatus, event.getClaimId());
        } catch (Exception e) {
            log.error("Failed to update claim status for claim ID: {}", event.getClaimId(), e);
        }

        // Save a human workflow Task
        Task task = Task.builder()
                .claimId(event.getClaimId())
                .assignedRole(assignedRole)
                .status("PENDING")
                .description("Manual review required. Risk Score: " + riskScore)
                .build();
        taskRepository.save(task);
        log.info("Workflow task created for role: {}", assignedRole);
    }
}
