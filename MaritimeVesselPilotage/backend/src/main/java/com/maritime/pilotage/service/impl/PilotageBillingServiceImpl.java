package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.PilotageBilling;
import com.maritime.pilotage.repository.PilotageBillingRepository;
import com.maritime.pilotage.service.PilotageBillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PilotageBillingServiceImpl implements PilotageBillingService {

    private final PilotageBillingRepository pilotageBillingRepository;

    @Override
    public PilotageBilling save(PilotageBilling pilotageBilling) {
        return pilotageBillingRepository.save(pilotageBilling);
    }

    @Override
    public Optional<PilotageBilling> findById(Long id) {
        return pilotageBillingRepository.findById(id);
    }

    @Override
    public List<PilotageBilling> findAll() {
        return pilotageBillingRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        pilotageBillingRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return pilotageBillingRepository.existsById(id);
    }

    @Override
    public long count() {
        return pilotageBillingRepository.count();
    }
}
