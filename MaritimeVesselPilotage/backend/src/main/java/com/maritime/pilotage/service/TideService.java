package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.Tide;

import java.util.List;
import java.util.Optional;

public interface TideService {

    Tide save(Tide tide);

    Optional<Tide> findById(Long id);

    List<Tide> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
