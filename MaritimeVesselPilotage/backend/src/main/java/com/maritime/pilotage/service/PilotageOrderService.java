package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.PilotageOrder;

import java.util.List;
import java.util.Optional;

public interface PilotageOrderService {

    PilotageOrder save(PilotageOrder pilotageOrder);

    Optional<PilotageOrder> findById(Long id);

    List<PilotageOrder> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
