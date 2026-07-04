package com.hackathon.workflow.client;

import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.FraudRequest;
import com.hackathon.common.dto.FraudResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "fraud-service")
public interface FraudClient {

    @PostMapping("/fraud/validate")
    ApiResponse<FraudResponse> validateClaim(@RequestBody FraudRequest request);
}
