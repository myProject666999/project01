package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.PilotageAssignment;

import java.util.List;
import java.util.Optional;

public interface PilotageAssignmentService {

    PilotageAssignment save(PilotageAssignment pilotageAssignment);

    Optional<PilotageAssignment> findById(Long id);

    List<PilotageAssignment> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
