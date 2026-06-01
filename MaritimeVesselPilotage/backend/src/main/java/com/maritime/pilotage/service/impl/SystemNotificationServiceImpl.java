package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.SystemNotification;
import com.maritime.pilotage.repository.SystemNotificationRepository;
import com.maritime.pilotage.service.SystemNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemNotificationServiceImpl implements SystemNotificationService {

    private final SystemNotificationRepository systemNotificationRepository;

    @Override
    public SystemNotification save(SystemNotification systemNotification) {
        return systemNotificationRepository.save(systemNotification);
    }

    @Override
    public Optional<SystemNotification> findById(Long id) {
        return systemNotificationRepository.findById(id);
    }

    @Override
    public List<SystemNotification> findAll() {
        return systemNotificationRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        systemNotificationRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return systemNotificationRepository.existsById(id);
    }

    @Override
    public long count() {
        return systemNotificationRepository.count();
    }
}
