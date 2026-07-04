package com.hackathon.notification.kafka;

import com.hackathon.common.dto.NotificationRequest;
import com.hackathon.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConsumerPlaceholder {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerPlaceholder.class);
    private final NotificationService notificationService;

    public KafkaConsumerPlaceholder(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "${app.kafka.notification-topic:notifications-topic}", groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void listenNotification(NotificationRequest request) {
        log.info("Received notification request from Kafka broker: {}", request);
        try {
            notificationService.sendNotification(request);
        } catch (Exception e) {
            log.error("Failed to process notification received from Kafka: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "mfa-events", groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void listenMfa(com.hackathon.common.dto.MfaEvent event) {
        log.info("Received MFA Event from Kafka: {}", event);
        try {
            String subject = "Your 2FA One-Time Passcode";
            String body = String.format("Hello %s,\n\nYour One-Time Passcode is: %s\nThis code will expire in 5 minutes.", 
                    event.getUsername(), event.getOtp());
            
            NotificationRequest request = new NotificationRequest();
            request.setRecipient(event.getEmail());
            request.setType("EMAIL");
            request.setSubject(subject);
            request.setBody(body);
            
            notificationService.sendNotification(request);
        } catch (Exception e) {
            log.error("Failed to process MFA Event received from Kafka: {}", e.getMessage(), e);
        }
    }
}
