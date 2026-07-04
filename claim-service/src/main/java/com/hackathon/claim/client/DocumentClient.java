package com.hackathon.claim.client;

import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.DocumentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "document-service")
public interface DocumentClient {

    @GetMapping("/claims/{id}/documents")
    ApiResponse<List<DocumentDto>> getClaimDocuments(@PathVariable("id") Long id);
}
