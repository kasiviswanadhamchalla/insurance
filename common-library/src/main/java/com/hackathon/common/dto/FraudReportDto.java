package com.hackathon.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudReportDto {
    private Long id;
    private Long claimId;
    private Integer riskScore;
    private String status; // PASSED, FLAGGED
    private List<String> flags;
    private Instant checkedAt;
}
