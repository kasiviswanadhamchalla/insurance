package com.hackathon.fraud.entity;

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
@Table(name = "fraud_reports")
public class FraudReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long claimId;

    @Column(nullable = false)
    private Integer riskScore;

    @Column(nullable = false, length = 30)
    private String status; // PASSED, FLAGGED

    @Column(length = 1000)
    private String flags; // comma-separated match flags

    private Instant checkedAt;

    @PrePersist
    protected void onCreate() {
        checkedAt = Instant.now();
    }
}
