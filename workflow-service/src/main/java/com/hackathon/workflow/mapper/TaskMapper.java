package com.hackathon.workflow.mapper;

import com.hackathon.common.dto.TaskDto;
import com.hackathon.workflow.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskDto toDto(Task entity) {
        if (entity == null) {
            return null;
        }
        return TaskDto.builder()
                .id(entity.getId())
                .claimId(entity.getClaimId())
                .assignedRole(entity.getAssignedRole())
                .assignedUserId(entity.getAssignedUserId())
                .status(entity.getStatus())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt())
                .actionDecision(entity.getActionDecision())
                .comment(entity.getComment())
                .build();
    }

    public Page<TaskDto> toDtoPage(Page<Task> page) {
        if (page == null) {
            return null;
        }
        return page.map(this::toDto);
    }
}
