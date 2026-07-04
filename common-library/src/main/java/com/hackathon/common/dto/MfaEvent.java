package com.hackathon.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaEvent {
    private String email;
    private String username;
    private String otp;
    private String mfaTransactionId;
}
