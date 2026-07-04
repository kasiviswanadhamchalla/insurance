package com.hackathon.workflow.kafka;

import com.hackathon.common.dto.ClaimEvent;
import com.hackathon.workflow.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class ClaimSubmissionConsumer {

    private static final Logger log = LoggerFactory.getLogger(ClaimSubmissionConsumer.class);
    private final TaskService taskService;

    public ClaimSubmissionConsumer(TaskService taskService) {
        this.taskService = taskService;
    }

    @KafkaListener(topics = "claim-submissions", groupId = "${spring.kafka.consumer.group-id:workflow-group}")
    public void listen(ClaimEvent event) {
        log.info("Received claim submission event from Kafka: {}", event);
        try {
            taskService.processClaimSubmission(event);
        } catch (Exception e) {
            log.error("Error processing claim submission event: {}", e.getMessage(), e);
        }
    }
}
