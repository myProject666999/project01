package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.PilotageCompletion;

import java.util.List;
import java.util.Optional;

public interface PilotageCompletionService {

    PilotageCompletion save(PilotageCompletion pilotageCompletion);

    Optional<PilotageCompletion> findById(Long id);

    List<PilotageCompletion> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
