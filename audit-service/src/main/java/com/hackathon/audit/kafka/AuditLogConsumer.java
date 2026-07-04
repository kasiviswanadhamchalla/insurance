package com.hackathon.audit.kafka;

import com.hackathon.audit.service.AuditService;
import com.hackathon.common.dto.ClaimEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AuditLogConsumer {

    private static final Logger log = LoggerFactory.getLogger(AuditLogConsumer.class);
    private final AuditService auditService;

    public AuditLogConsumer(AuditService auditService) {
        this.auditService = auditService;
    }

    @KafkaListener(topics = "claim-submissions", groupId = "${spring.kafka.consumer.group-id:audit-group}")
    public void listenSubmissions(ClaimEvent event) {
        log.info("Audit Service received claim submission event: {}", event);
        try {
            auditService.logSubmission(event);
        } catch (Exception e) {
            log.error("Failed to log submission event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "claim-status-updates", groupId = "${spring.kafka.consumer.group-id:audit-group}")
    public void listenStatusUpdates(ClaimEvent event) {
        log.info("Audit Service received claim status update event: {}", event);
        try {
            auditService.logStatusUpdate(event);
        } catch (Exception e) {
            log.error("Failed to log status update event: {}", e.getMessage(), e);
        }
    }
}
