package com.hackathon.notification.service;

import com.hackathon.common.dto.NotificationRequest;
import com.hackathon.notification.dto.NotificationDto;

import java.util.List;

public interface NotificationService {
    NotificationDto sendNotification(NotificationRequest request);
    List<NotificationDto> getNotificationHistory(String recipient);
}
