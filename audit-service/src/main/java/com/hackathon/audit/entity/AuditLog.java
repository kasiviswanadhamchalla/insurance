package com.hackathon.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long claimId;

    @Column(nullable = false, length = 50)
    private String actionType; // SUBMISSION, STATUS_UPDATE, APPROVAL, REJECTION

    @Column(nullable = false, length = 50)
    private String performedBy;

    @Column(length = 30)
    private String statusBefore;

    @Column(length = 30)
    private String statusAfter;

    private Instant timestamp;

    @Column(length = 1000)
    private String details;

    @PrePersist
    protected void onCreate() {
        timestamp = Instant.now();
    }
}
