package com.hackathon.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskActionRequest {
    private String actionDecision; // APPROVE, REJECT, REQUEST_DOCS
    private String comment;
}
