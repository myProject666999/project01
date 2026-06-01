package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.PilotageAssignment;
import com.maritime.pilotage.repository.PilotageAssignmentRepository;
import com.maritime.pilotage.service.PilotageAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PilotageAssignmentServiceImpl implements PilotageAssignmentService {

    private final PilotageAssignmentRepository pilotageAssignmentRepository;

    @Override
    public PilotageAssignment save(PilotageAssignment pilotageAssignment) {
        return pilotageAssignmentRepository.save(pilotageAssignment);
    }

    @Override
    public Optional<PilotageAssignment> findById(Long id) {
        return pilotageAssignmentRepository.findById(id);
    }

    @Override
    public List<PilotageAssignment> findAll() {
        return pilotageAssignmentRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        pilotageAssignmentRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return pilotageAssignmentRepository.existsById(id);
    }

    @Override
    public long count() {
        return pilotageAssignmentRepository.count();
    }
}
