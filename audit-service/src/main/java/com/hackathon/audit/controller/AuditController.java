package com.hackathon.audit.controller;

import com.hackathon.audit.entity.AuditLog;
import com.hackathon.audit.mapper.AuditMapper;
import com.hackathon.audit.service.AuditService;
import com.hackathon.common.annotation.RequiresRole;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.AuditLogDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;
    private final AuditMapper auditMapper;

    public AuditController(AuditService auditService, AuditMapper auditMapper) {
        this.auditService = auditService;
        this.auditMapper = auditMapper;
    }

    @GetMapping("/logs")
    @RequiresRole("ROLE_AUDITOR")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> searchLogs(
            @RequestParam(value = "claimId", required = false) Long claimId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditService.searchLogs(claimId, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditMapper.toDtoPage(logs), "Audit logs retrieved successfully"));
    }

    @GetMapping("/reports/export")
    @RequiresRole("ROLE_AUDITOR")
    public ResponseEntity<byte[]> exportReport(@RequestParam(value = "format", defaultValue = "csv") String format) {
        byte[] data = auditService.exportReport(format);
        String filename = "audit_report_" + System.currentTimeMillis() + "." + format;
        
        MediaType mediaType = "csv".equalsIgnoreCase(format) ? 
                MediaType.parseMediaType("text/csv") : MediaType.TEXT_PLAIN;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(data);
    }
}
