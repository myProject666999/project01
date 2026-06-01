package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.Pilot;

import java.util.List;
import java.util.Optional;

public interface PilotService {

    Pilot save(Pilot pilot);

    Optional<Pilot> findById(Long id);

    List<Pilot> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
