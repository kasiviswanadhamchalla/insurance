package com.hackathon.fraud.mapper;

import com.hackathon.common.dto.FraudReportDto;
import com.hackathon.fraud.entity.FraudReport;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class FraudMapper {

    public FraudReportDto toDto(FraudReport entity) {
        if (entity == null) {
            return null;
        }
        
        List<String> flagsList = List.of();
        if (entity.getFlags() != null && !entity.getFlags().isBlank()) {
            flagsList = Arrays.asList(entity.getFlags().split(","));
        }

        return FraudReportDto.builder()
                .id(entity.getId())
                .claimId(entity.getClaimId())
                .riskScore(entity.getRiskScore())
                .status(entity.getStatus())
                .flags(flagsList)
                .checkedAt(entity.getCheckedAt())
                .build();
    }
}
