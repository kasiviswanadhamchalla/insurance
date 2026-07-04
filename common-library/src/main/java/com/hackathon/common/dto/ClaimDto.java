package com.hackathon.common.dto;

import com.hackathon.common.constant.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDto {
    private Long id;
    private String policyNumber;
    private Double claimAmount;
    private String lossType;
    private Instant dateOfOccurrence;
    private String description;
    private ClaimStatus status;
    private String username;
    private Instant createdAt;
    private Instant updatedAt;
}
