package com.hackathon.audit.mapper;

import com.hackathon.audit.entity.AuditLog;
import com.hackathon.common.dto.AuditLogDto;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class AuditMapper {

    public AuditLogDto toDto(AuditLog entity) {
        if (entity == null) {
            return null;
        }
        return AuditLogDto.builder()
                .id(entity.getId())
                .claimId(entity.getClaimId())
                .actionType(entity.getActionType())
                .performedBy(entity.getPerformedBy())
                .statusBefore(entity.getStatusBefore())
                .statusAfter(entity.getStatusAfter())
                .timestamp(entity.getTimestamp())
                .details(entity.getDetails())
                .build();
    }

    public Page<AuditLogDto> toDtoPage(Page<AuditLog> page) {
        if (page == null) {
            return null;
        }
        return page.map(this::toDto);
    }
}
