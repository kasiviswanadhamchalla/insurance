package com.hackathon.fraud.repository;

import com.hackathon.fraud.entity.FraudReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FraudReportRepository extends JpaRepository<FraudReport, Long> {
    Optional<FraudReport> findByClaimId(Long claimId);
}
