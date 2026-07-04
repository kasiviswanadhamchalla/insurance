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
public class AuditLogDto {
    private Long id;
    private Long claimId;
    private String actionType;
    private String performedBy;
    private String statusBefore;
    private String statusAfter;
    private Instant timestamp;
    private String details;
}
