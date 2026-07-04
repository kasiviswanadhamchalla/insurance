package com.hackathon.audit.service;

import com.hackathon.audit.entity.AuditLog;
import com.hackathon.common.dto.ClaimEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditService {
    Page<AuditLog> searchLogs(Long claimId, Pageable pageable);
    byte[] exportReport(String format);
    void logSubmission(ClaimEvent event);
    void logStatusUpdate(ClaimEvent event);
}
