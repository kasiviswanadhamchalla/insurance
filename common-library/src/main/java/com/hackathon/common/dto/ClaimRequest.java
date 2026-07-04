package com.hackathon.common.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRequest {
    @NotBlank(message = "Policy number is required")
    private String policyNumber;

    @NotNull(message = "Claim amount is required")
    @Min(value = 0, message = "Claim amount cannot be negative")
    private Double claimAmount;

    @NotBlank(message = "Loss type is required")
    private String lossType;

    @NotNull(message = "Date of occurrence is required")
    private Instant dateOfOccurrence;

    private String description;
}
