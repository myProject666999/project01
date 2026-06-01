package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.PilotageOrder;
import com.maritime.pilotage.repository.PilotageOrderRepository;
import com.maritime.pilotage.service.PilotageOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PilotageOrderServiceImpl implements PilotageOrderService {

    private final PilotageOrderRepository pilotageOrderRepository;

    @Override
    public PilotageOrder save(PilotageOrder pilotageOrder) {
        return pilotageOrderRepository.save(pilotageOrder);
    }

    @Override
    public Optional<PilotageOrder> findById(Long id) {
        return pilotageOrderRepository.findById(id);
    }

    @Override
    public List<PilotageOrder> findAll() {
        return pilotageOrderRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        pilotageOrderRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return pilotageOrderRepository.existsById(id);
    }

    @Override
    public long count() {
        return pilotageOrderRepository.count();
    }
}
