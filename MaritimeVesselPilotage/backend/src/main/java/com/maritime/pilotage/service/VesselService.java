package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.Vessel;

import java.util.List;
import java.util.Optional;

public interface VesselService {

    Vessel save(Vessel vessel);

    Optional<Vessel> findById(Long id);

    List<Vessel> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
