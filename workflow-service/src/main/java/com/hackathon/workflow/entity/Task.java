package com.hackathon.workflow.entity;

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
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long claimId;

    @Column(nullable = false, length = 50)
    private String assignedRole; // ROLE_PROCESSOR, ROLE_MANAGER

    private String assignedUserId; // username of processor/manager who claimed it

    @Column(nullable = false, length = 30)
    private String status; // PENDING, COMPLETED

    @Column(length = 500)
    private String description;

    private Instant createdAt;
    private Instant completedAt;

    private String actionDecision; // APPROVE, REJECT, REQUEST_DOCS
    private String comment;

    @Version
    private Integer version; // Optimistic locking

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
