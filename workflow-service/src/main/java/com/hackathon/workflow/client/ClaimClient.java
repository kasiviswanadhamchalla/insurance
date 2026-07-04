package com.hackathon.workflow.client;

import com.hackathon.common.constant.ClaimStatus;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.ClaimDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "claim-service")
public interface ClaimClient {

    @PutMapping("/claims/{id}/status")
    ApiResponse<ClaimDto> updateClaimStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") ClaimStatus status
    );
}
