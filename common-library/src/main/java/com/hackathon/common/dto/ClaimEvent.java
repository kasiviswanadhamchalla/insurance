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
public class ClaimEvent {
    private Long claimId;
    private String policyNumber;
    private Double claimAmount;
    private String lossType;
    private String description;
    private ClaimStatus status;
    private String username;
    private Instant timestamp;
    private String comment;
}
