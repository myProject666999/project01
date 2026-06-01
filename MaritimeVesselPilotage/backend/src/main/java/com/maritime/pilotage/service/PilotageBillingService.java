package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.PilotageBilling;

import java.util.List;
import java.util.Optional;

public interface PilotageBillingService {

    PilotageBilling save(PilotageBilling pilotageBilling);

    Optional<PilotageBilling> findById(Long id);

    List<PilotageBilling> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
