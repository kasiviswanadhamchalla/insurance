package com.hackathon.fraud.service;

import com.hackathon.common.dto.FraudRequest;
import com.hackathon.common.dto.FraudResponse;
import com.hackathon.common.exception.ResourceNotFoundException;
import com.hackathon.fraud.entity.FraudReport;
import com.hackathon.fraud.repository.FraudReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class FraudServiceImpl implements FraudService {

    private final FraudReportRepository reportRepository;

    public FraudServiceImpl(FraudReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    public FraudResponse validateClaim(FraudRequest request) {
        int score = 0;
        List<String> flags = new ArrayList<>();

        // Rule 1: High Value Claim
        if (request.getClaimAmount() != null && request.getClaimAmount() >= 5000.0) {
            score += 30;
            flags.add("HIGH_VALUE_CLAIM");
        }

        // Rule 2: Invalid Policy Format
        if (request.getPolicyNumber() == null || !request.getPolicyNumber().matches("^POL-\\d{6}$")) {
            score += 50;
            flags.add("INVALID_POLICY_FORMAT");
        }

        // Rule 3: Suspicious Keywords
        if (request.getDescription() != null) {
            String descLower = request.getDescription().toLowerCase();
            if (descLower.contains("crash") || descLower.contains("stolen") || descLower.contains("fire") || descLower.contains("accident")) {
                score += 15;
                flags.add("SUSPICIOUS_KEYWORDS");
            }
        }

        // Determine Status
        String status = score >= 50 ? "FLAGGED" : "PASSED";

        // Save report
        FraudReport report = FraudReport.builder()
                .claimId(request.getClaimId())
                .riskScore(score)
                .status(status)
                .flags(String.join(",", flags))
                .build();
        reportRepository.save(report);

        return FraudResponse.builder()
                .claimId(request.getClaimId())
                .riskScore(score)
                .status(status)
                .flags(flags)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FraudReport getReport(Long claimId) {
        return reportRepository.findByClaimId(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Fraud report not found for claim: " + claimId));
    }
}
