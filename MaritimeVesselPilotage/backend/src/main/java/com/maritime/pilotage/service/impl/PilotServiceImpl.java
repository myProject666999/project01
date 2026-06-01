package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.Pilot;
import com.maritime.pilotage.repository.PilotRepository;
import com.maritime.pilotage.service.PilotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PilotServiceImpl implements PilotService {

    private final PilotRepository pilotRepository;

    @Override
    public Pilot save(Pilot pilot) {
        return pilotRepository.save(pilot);
    }

    @Override
    public Optional<Pilot> findById(Long id) {
        return pilotRepository.findById(id);
    }

    @Override
    public List<Pilot> findAll() {
        return pilotRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        pilotRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return pilotRepository.existsById(id);
    }

    @Override
    public long count() {
        return pilotRepository.count();
    }
}
