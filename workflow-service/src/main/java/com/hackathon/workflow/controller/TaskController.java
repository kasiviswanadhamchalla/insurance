package com.hackathon.workflow.controller;

import com.hackathon.common.annotation.RequiresRole;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.TaskDto;
import com.hackathon.workflow.dto.TaskActionRequest;
import com.hackathon.workflow.entity.Task;
import com.hackathon.workflow.mapper.TaskMapper;
import com.hackathon.workflow.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TaskMapper taskMapper;

    public TaskController(TaskService taskService, TaskMapper taskMapper) {
        this.taskService = taskService;
        this.taskMapper = taskMapper;
    }

    @GetMapping("/pending")
    @RequiresRole({"ROLE_PROCESSOR", "ROLE_MANAGER"})
    public ResponseEntity<ApiResponse<Page<TaskDto>>> getPendingQueueTasks(
            @RequestHeader(value = "X-User-Roles", defaultValue = "ROLE_PROCESSOR") String rolesHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        String assignedRole = "ROLE_PROCESSOR";
        if (rolesHeader.contains("ROLE_MANAGER")) {
            assignedRole = "ROLE_MANAGER";
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Task> tasks = taskService.getPendingQueueTasks(assignedRole, pageable);
        return ResponseEntity.ok(ApiResponse.success(taskMapper.toDtoPage(tasks), "Pending tasks queue retrieved successfully"));
    }

    @PostMapping("/{taskId}/claim")
    @RequiresRole({"ROLE_PROCESSOR", "ROLE_MANAGER"})
    public ResponseEntity<ApiResponse<TaskDto>> claimTask(
            @PathVariable("taskId") Long taskId,
            @RequestHeader("X-User-Name") String username) {
        Task claimed = taskService.claimTask(taskId, username);
        return ResponseEntity.ok(ApiResponse.success(taskMapper.toDto(claimed), "Task claimed successfully"));
    }

    @PostMapping("/{taskId}/action")
    @RequiresRole({"ROLE_PROCESSOR", "ROLE_MANAGER"})
    public ResponseEntity<ApiResponse<TaskDto>> completeTaskAction(
            @PathVariable("taskId") Long taskId,
            @RequestHeader("X-User-Name") String username,
            @RequestBody TaskActionRequest request) {
        Task completed = taskService.completeTaskAction(taskId, username, request.getActionDecision(), request.getComment());
        return ResponseEntity.ok(ApiResponse.success(taskMapper.toDto(completed), "Task action completed successfully"));
    }
}
