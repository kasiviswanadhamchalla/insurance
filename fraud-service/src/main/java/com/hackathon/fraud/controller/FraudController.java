package com.hackathon.fraud.controller;

import com.hackathon.common.annotation.RequiresRole;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.FraudRequest;
import com.hackathon.common.dto.FraudResponse;
import com.hackathon.common.dto.FraudReportDto;
import com.hackathon.fraud.entity.FraudReport;
import com.hackathon.fraud.mapper.FraudMapper;
import com.hackathon.fraud.service.FraudService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fraud")
public class FraudController {

    private final FraudService fraudService;
    private final FraudMapper fraudMapper;

    public FraudController(FraudService fraudService, FraudMapper fraudMapper) {
        this.fraudService = fraudService;
        this.fraudMapper = fraudMapper;
    }

    @PostMapping("/validate")
    @RequiresRole({"ROLE_USER", "ROLE_PROCESSOR", "ROLE_MANAGER"})
    public ResponseEntity<ApiResponse<FraudResponse>> validateClaim(@RequestBody FraudRequest request) {
        FraudResponse response = fraudService.validateClaim(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Claim validated successfully"));
    }

    @GetMapping("/reports/{claimId}")
    @RequiresRole({"ROLE_PROCESSOR", "ROLE_MANAGER", "ROLE_AUDITOR"})
    public ResponseEntity<ApiResponse<FraudReportDto>> getReport(@PathVariable("claimId") Long claimId) {
        FraudReport report = fraudService.getReport(claimId);
        return ResponseEntity.ok(ApiResponse.success(fraudMapper.toDto(report), "Fraud report retrieved successfully"));
    }
}
