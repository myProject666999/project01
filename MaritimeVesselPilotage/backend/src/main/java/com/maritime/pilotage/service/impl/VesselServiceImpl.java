package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.Vessel;
import com.maritime.pilotage.repository.VesselRepository;
import com.maritime.pilotage.service.VesselService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VesselServiceImpl implements VesselService {

    private final VesselRepository vesselRepository;

    @Override
    public Vessel save(Vessel vessel) {
        return vesselRepository.save(vessel);
    }

    @Override
    public Optional<Vessel> findById(Long id) {
        return vesselRepository.findById(id);
    }

    @Override
    public List<Vessel> findAll() {
        return vesselRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        vesselRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return vesselRepository.existsById(id);
    }

    @Override
    public long count() {
        return vesselRepository.count();
    }
}
