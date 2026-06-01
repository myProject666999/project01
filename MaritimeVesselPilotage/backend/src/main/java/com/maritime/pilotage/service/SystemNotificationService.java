package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.SystemNotification;

import java.util.List;
import java.util.Optional;

public interface SystemNotificationService {

    SystemNotification save(SystemNotification systemNotification);

    Optional<SystemNotification> findById(Long id);

    List<SystemNotification> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
