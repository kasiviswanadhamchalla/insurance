package com.hackathon.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyRequest {
    @NotBlank(message = "Transaction ID is required")
    private String mfaTransactionId;
    
    @NotBlank(message = "OTP code is required")
    private String code;
}
