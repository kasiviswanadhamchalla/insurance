package com.hackathon.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private Long claimId;
    private String assignedRole;
    private String assignedUserId;
    private String status; // PENDING, COMPLETED
    private String description;
    private Instant createdAt;
    private Instant completedAt;
    private String actionDecision;
    private String comment;
}
