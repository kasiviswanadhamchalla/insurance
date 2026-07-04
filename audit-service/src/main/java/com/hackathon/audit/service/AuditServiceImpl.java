package com.hackathon.audit.service;

import com.hackathon.audit.entity.AuditLog;
import com.hackathon.audit.repository.AuditLogRepository;
import com.hackathon.common.dto.ClaimEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository logRepository;

    public AuditServiceImpl(AuditLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> searchLogs(Long claimId, Pageable pageable) {
        if (claimId != null) {
            return logRepository.findByClaimId(claimId, pageable);
        }
        return logRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportReport(String format) {
        List<AuditLog> logs = logRepository.findAll();
        StringBuilder sb = new StringBuilder();
        
        if ("csv".equalsIgnoreCase(format)) {
            sb.append("ID,ClaimID,ActionType,PerformedBy,StatusBefore,StatusAfter,Timestamp,Details\n");
            for (AuditLog log : logs) {
                sb.append(log.getId()).append(",")
                  .append(log.getClaimId()).append(",")
                  .append(log.getActionType()).append(",")
                  .append(log.getPerformedBy()).append(",")
                  .append(log.getStatusBefore() != null ? log.getStatusBefore() : "").append(",")
                  .append(log.getStatusAfter() != null ? log.getStatusAfter() : "").append(",")
                  .append(log.getTimestamp()).append(",")
                  .append(log.getDetails() != null ? "\"" + log.getDetails().replace("\"", "\"\"") + "\"" : "")
                  .append("\n");
            }
        } else {
            // Default to plain text formatting
            for (AuditLog log : logs) {
                sb.append("[").append(log.getTimestamp()).append("] ")
                  .append("Claim ID: ").append(log.getClaimId()).append(" | ")
                  .append("Action: ").append(log.getActionType()).append(" | ")
                  .append("By: ").append(log.getPerformedBy()).append(" | ")
                  .append("Details: ").append(log.getDetails())
                  .append("\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public void logSubmission(ClaimEvent event) {
        AuditLog log = AuditLog.builder()
                .claimId(event.getClaimId())
                .actionType("SUBMISSION")
                .performedBy(event.getUsername())
                .statusBefore("DRAFT")
                .statusAfter("SUBMITTED")
                .details(String.format("Claim submitted. Policy: %s, Amount: %s", event.getPolicyNumber(), event.getClaimAmount()))
                .build();
        logRepository.save(log);
    }

    @Override
    public void logStatusUpdate(ClaimEvent event) {
        AuditLog log = AuditLog.builder()
                .claimId(event.getClaimId())
                .actionType("STATUS_UPDATE")
                .performedBy(event.getUsername())
                .statusAfter(event.getStatus() != null ? event.getStatus().toString() : null)
                .details(String.format("Claim status updated. Comment: %s", event.getComment()))
                .build();
        logRepository.save(log);
    }
}
