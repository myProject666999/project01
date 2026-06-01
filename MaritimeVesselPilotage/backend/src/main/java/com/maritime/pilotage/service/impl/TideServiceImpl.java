package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.Tide;
import com.maritime.pilotage.repository.TideRepository;
import com.maritime.pilotage.service.TideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TideServiceImpl implements TideService {

    private final TideRepository tideRepository;

    @Override
    public Tide save(Tide tide) {
        return tideRepository.save(tide);
    }

    @Override
    public Optional<Tide> findById(Long id) {
        return tideRepository.findById(id);
    }

    @Override
    public List<Tide> findAll() {
        return tideRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        tideRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return tideRepository.existsById(id);
    }

    @Override
    public long count() {
        return tideRepository.count();
    }
}
