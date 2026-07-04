package com.hackathon.notification.service;

public interface EmailService {
    boolean sendEmail(String to, String subject, String body);
}
