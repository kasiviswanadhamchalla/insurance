package com.hackathon.notification.mapper;

import com.hackathon.notification.entity.Notification;
import com.hackathon.notification.dto.NotificationDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationDto toDto(Notification notification);
    List<NotificationDto> toDtoList(List<Notification> notifications);
}
