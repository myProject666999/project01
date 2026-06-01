package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.PilotageCompletion;
import com.maritime.pilotage.repository.PilotageCompletionRepository;
import com.maritime.pilotage.service.PilotageCompletionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PilotageCompletionServiceImpl implements PilotageCompletionService {

    private final PilotageCompletionRepository pilotageCompletionRepository;

    @Override
    public PilotageCompletion save(PilotageCompletion pilotageCompletion) {
        return pilotageCompletionRepository.save(pilotageCompletion);
    }

    @Override
    public Optional<PilotageCompletion> findById(Long id) {
        return pilotageCompletionRepository.findById(id);
    }

    @Override
    public List<PilotageCompletion> findAll() {
        return pilotageCompletionRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        pilotageCompletionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return pilotageCompletionRepository.existsById(id);
    }

    @Override
    public long count() {
        return pilotageCompletionRepository.count();
    }
}
