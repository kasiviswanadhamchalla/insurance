package com.hackathon.claim.service;

import com.hackathon.claim.entity.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClaimService {
    Claim createClaimDraft(String username, Claim claim);
    Claim submitClaim(Long id, String username);
    Claim getClaimDetails(Long id);
    Page<Claim> listCustomerClaims(String username, Pageable pageable);
    Page<Claim> listAllClaims(Pageable pageable);
    Claim updateClaimDraft(Long id, String username, Claim claim);
    void cancelClaim(Long id, String username);
    Claim updateClaimStatus(Long id, com.hackathon.common.constant.ClaimStatus status);
}
