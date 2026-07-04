package com.hackathon.claim.service;

import com.hackathon.claim.entity.Claim;
import com.hackathon.claim.repository.ClaimRepository;
import com.hackathon.common.constant.ClaimStatus;
import com.hackathon.common.dto.ClaimEvent;
import com.hackathon.common.exception.BadRequestException;
import com.hackathon.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Transactional
public class ClaimServiceImpl implements ClaimService {

    private static final Logger log = LoggerFactory.getLogger(ClaimServiceImpl.class);

    private final ClaimRepository claimRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final com.hackathon.claim.client.DocumentClient documentClient;

    public ClaimServiceImpl(ClaimRepository claimRepository, 
                            KafkaTemplate<String, Object> kafkaTemplate,
                            com.hackathon.claim.client.DocumentClient documentClient) {
        this.claimRepository = claimRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.documentClient = documentClient;
    }

    @Override
    public Claim createClaimDraft(String username, Claim claim) {
        claim.setUsername(username);
        claim.setStatus(ClaimStatus.DRAFT);
        return claimRepository.save(claim);
    }

    @Override
    public Claim submitClaim(Long id, String username) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + id));

        if (!claim.getUsername().equals(username)) {
            throw new BadRequestException("You can only submit your own claims");
        }

        if (claim.getStatus() != ClaimStatus.DRAFT) {
            throw new BadRequestException("Claim is already submitted or processed");
        }

        // Verify that the claim has uploaded documents via OpenFeign
        try {
            com.hackathon.common.dto.ApiResponse<java.util.List<com.hackathon.common.dto.DocumentDto>> docsResponse = 
                    documentClient.getClaimDocuments(id);
            if (docsResponse == null || !docsResponse.isSuccess() || docsResponse.getData() == null || docsResponse.getData().isEmpty()) {
                throw new BadRequestException("Cannot submit claim without supporting documents. Please upload receipts or evidence first.");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to check documents in document-service via OpenFeign for claim ID: {}. Proceeding submission.", id, e);
        }

        claim.setStatus(ClaimStatus.SUBMITTED);
        Claim savedClaim = claimRepository.save(claim);

        // Publish event to Kafka
        ClaimEvent event = ClaimEvent.builder()
                .claimId(savedClaim.getId())
                .policyNumber(savedClaim.getPolicyNumber())
                .claimAmount(savedClaim.getClaimAmount())
                .lossType(savedClaim.getLossType())
                .description(savedClaim.getDescription())
                .status(savedClaim.getStatus())
                .username(savedClaim.getUsername())
                .timestamp(Instant.now())
                .build();

        try {
            kafkaTemplate.send("claim-submissions", event);
            log.info("Claim submission Kafka event published for claim ID: {}", savedClaim.getId());
        } catch (Exception e) {
            log.error("Failed to publish claim submission event to Kafka for claim ID: {}", savedClaim.getId(), e);
        }

        return savedClaim;
    }

    @Override
    @Transactional(readOnly = true)
    public Claim getClaimDetails(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Claim> listCustomerClaims(String username, Pageable pageable) {
        return claimRepository.findByUsername(username, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Claim> listAllClaims(Pageable pageable) {
        return claimRepository.findAll(pageable);
    }

    @Override
    public Claim updateClaimDraft(Long id, String username, Claim updatedClaim) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + id));

        if (!claim.getUsername().equals(username)) {
            throw new BadRequestException("You can only update your own claims");
        }

        if (claim.getStatus() != ClaimStatus.DRAFT) {
            throw new BadRequestException("Cannot update claim once submitted");
        }

        claim.setPolicyNumber(updatedClaim.getPolicyNumber());
        claim.setClaimAmount(updatedClaim.getClaimAmount());
        claim.setLossType(updatedClaim.getLossType());
        claim.setDateOfOccurrence(updatedClaim.getDateOfOccurrence());
        claim.setDescription(updatedClaim.getDescription());

        return claimRepository.save(claim);
    }

    @Override
    public void cancelClaim(Long id, String username) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + id));

        if (!claim.getUsername().equals(username)) {
            throw new BadRequestException("You can only cancel your own claims");
        }

        if (claim.getStatus() != ClaimStatus.DRAFT) {
            throw new BadRequestException("Cannot cancel claim once submitted");
        }

        claimRepository.delete(claim);
    }

    @Override
    public Claim updateClaimStatus(Long id, ClaimStatus status) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + id));
        claim.setStatus(status);
        return claimRepository.save(claim);
    }
}
