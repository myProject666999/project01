package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.Tug;

import java.util.List;
import java.util.Optional;

public interface TugService {

    Tug save(Tug tug);

    Optional<Tug> findById(Long id);

    List<Tug> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
