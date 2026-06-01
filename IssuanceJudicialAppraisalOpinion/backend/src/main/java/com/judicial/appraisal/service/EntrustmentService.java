package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.Entrustment;

import java.util.List;

public interface EntrustmentService {

    List<Entrustment> findAll();

    Entrustment findById(Long id);

    Entrustment save(Entrustment entrustment);

    void deleteById(Long id);

    Entrustment register(Entrustment entrustment, Long userId);

    void updateStatus(Long id, String status);

    List<Entrustment> findByStatus(String status);
}
