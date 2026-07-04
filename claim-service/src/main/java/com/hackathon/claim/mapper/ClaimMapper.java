package com.hackathon.claim.mapper;

import com.hackathon.claim.entity.Claim;
import com.hackathon.common.dto.ClaimDto;
import com.hackathon.common.dto.ClaimRequest;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class ClaimMapper {

    public Claim toEntity(ClaimRequest request) {
        if (request == null) {
            return null;
        }
        return Claim.builder()
                .policyNumber(request.getPolicyNumber())
                .claimAmount(request.getClaimAmount())
                .lossType(request.getLossType())
                .dateOfOccurrence(request.getDateOfOccurrence())
                .description(request.getDescription())
                .build();
    }

    public ClaimDto toDto(Claim entity) {
        if (entity == null) {
            return null;
        }
        return ClaimDto.builder()
                .id(entity.getId())
                .policyNumber(entity.getPolicyNumber())
                .claimAmount(entity.getClaimAmount())
                .lossType(entity.getLossType())
                .dateOfOccurrence(entity.getDateOfOccurrence())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .username(entity.getUsername())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Page<ClaimDto> toDtoPage(Page<Claim> page) {
        if (page == null) {
            return null;
        }
        return page.map(this::toDto);
    }
}
