package com.hackathon.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudRequest {
    private Long claimId;
    private String policyNumber;
    private Double claimAmount;
    private String lossType;
    private String description;
    private String username;
}
