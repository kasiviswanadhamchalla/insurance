package com.hackathon.notification.controller;

import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.NotificationRequest;
import com.hackathon.notification.dto.NotificationDto;
import com.hackathon.notification.service.NotificationService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationDto>> sendNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationDto result = notificationService.sendNotification(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Notification dispatched successfully"));
    }

    @GetMapping("/history/{recipient}")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getHistory(@PathVariable String recipient) {
        List<NotificationDto> history = notificationService.getNotificationHistory(recipient);
        return ResponseEntity.ok(ApiResponse.success(history, "History retrieved successfully"));
    }
}
