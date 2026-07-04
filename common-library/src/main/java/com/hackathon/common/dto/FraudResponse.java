package com.hackathon.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudResponse {
    private Long claimId;
    private Integer riskScore;
    private String status; // PASSED, FLAGGED
    private List<String> flags;
}
