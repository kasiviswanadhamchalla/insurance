package com.hackathon.workflow.service;

import com.hackathon.common.dto.ClaimEvent;
import com.hackathon.workflow.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    Task claimTask(Long taskId, String username);
    Task completeTaskAction(Long taskId, String username, String actionDecision, String comment);
    Page<Task> getPendingQueueTasks(String role, Pageable pageable);
    void processClaimSubmission(ClaimEvent event);
}
