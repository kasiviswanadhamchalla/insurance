package com.hackathon.claim.controller;

import com.hackathon.claim.entity.Claim;
import com.hackathon.claim.mapper.ClaimMapper;
import com.hackathon.claim.service.ClaimService;
import com.hackathon.common.annotation.RequiresRole;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.ClaimDto;
import com.hackathon.common.dto.ClaimRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/claims")
public class ClaimController {

    private final ClaimService claimService;
    private final ClaimMapper claimMapper;

    public ClaimController(ClaimService claimService, ClaimMapper claimMapper) {
        this.claimService = claimService;
        this.claimMapper = claimMapper;
    }

    @PostMapping
    @RequiresRole("ROLE_USER")
    public ResponseEntity<ApiResponse<ClaimDto>> createClaimDraft(
            @RequestHeader("X-User-Name") String username,
            @Valid @RequestBody ClaimRequest request) {
        Claim claimEntity = claimMapper.toEntity(request);
        Claim created = claimService.createClaimDraft(username, claimEntity);
        return ResponseEntity.ok(ApiResponse.success(claimMapper.toDto(created), "Claim draft created successfully"));
    }

    @PostMapping("/{id}/submit")
    @RequiresRole("ROLE_USER")
    public ResponseEntity<ApiResponse<ClaimDto>> submitClaim(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Name") String username) {
        Claim submitted = claimService.submitClaim(id, username);
        return ResponseEntity.ok(ApiResponse.success(claimMapper.toDto(submitted), "Claim submitted successfully"));
    }

    @GetMapping("/{id}")
    @RequiresRole({"ROLE_USER", "ROLE_PROCESSOR", "ROLE_MANAGER", "ROLE_AUDITOR"})
    public ResponseEntity<ApiResponse<ClaimDto>> getClaimDetails(@PathVariable("id") Long id) {
        Claim claim = claimService.getClaimDetails(id);
        return ResponseEntity.ok(ApiResponse.success(claimMapper.toDto(claim), "Claim details retrieved successfully"));
    }

    @GetMapping
    @RequiresRole("ROLE_USER")
    public ResponseEntity<ApiResponse<Page<ClaimDto>>> listCustomerClaims(
            @RequestHeader("X-User-Name") String username,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Claim> claims = claimService.listCustomerClaims(username, pageable);
        return ResponseEntity.ok(ApiResponse.success(claimMapper.toDtoPage(claims), "Customer claims retrieved successfully"));
    }

    @GetMapping("/all")
    @RequiresRole({"ROLE_PROCESSOR", "ROLE_MANAGER", "ROLE_AUDITOR"})
    public ResponseEntity<ApiResponse<Page<ClaimDto>>> listAllClaims(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Claim> claims = claimService.listAllClaims(pageable);
        return ResponseEntity.ok(ApiResponse.success(claimMapper.toDtoPage(claims), "All system claims retrieved successfully"));
    }

    @PutMapping("/{id}")
    @RequiresRole("ROLE_USER")
    public ResponseEntity<ApiResponse<ClaimDto>> updateClaimDraft(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Name") String username,
            @Valid @RequestBody ClaimRequest request) {
        Claim claimEntity = claimMapper.toEntity(request);
        Claim updated = claimService.updateClaimDraft(id, username, claimEntity);
        return ResponseEntity.ok(ApiResponse.success(claimMapper.toDto(updated), "Claim draft updated successfully"));
    }

    @DeleteMapping("/{id}")
    @RequiresRole("ROLE_USER")
    public ResponseEntity<ApiResponse<String>> cancelClaim(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Name") String username) {
        claimService.cancelClaim(id, username);
        return ResponseEntity.ok(ApiResponse.success("Claim canceled successfully", "Claim canceled successfully"));
    }

    @PutMapping("/{id}/status")
    @RequiresRole({"ROLE_PROCESSOR", "ROLE_MANAGER"})
    public ResponseEntity<ApiResponse<ClaimDto>> updateClaimStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") com.hackathon.common.constant.ClaimStatus status) {
        Claim updated = claimService.updateClaimStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(claimMapper.toDto(updated), "Claim status updated successfully"));
    }
}
