package com.hackathon.fraud.service;

import com.hackathon.common.dto.FraudRequest;
import com.hackathon.common.dto.FraudResponse;
import com.hackathon.fraud.entity.FraudReport;

public interface FraudService {
    FraudResponse validateClaim(FraudRequest request);
    FraudReport getReport(Long claimId);
}
