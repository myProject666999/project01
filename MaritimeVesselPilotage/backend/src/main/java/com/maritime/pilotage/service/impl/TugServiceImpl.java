package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.Tug;
import com.maritime.pilotage.repository.TugRepository;
import com.maritime.pilotage.service.TugService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TugServiceImpl implements TugService {

    private final TugRepository tugRepository;

    @Override
    public Tug save(Tug tug) {
        return tugRepository.save(tug);
    }

    @Override
    public Optional<Tug> findById(Long id) {
        return tugRepository.findById(id);
    }

    @Override
    public List<Tug> findAll() {
        return tugRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        tugRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return tugRepository.existsById(id);
    }

    @Override
    public long count() {
        return tugRepository.count();
    }
}
