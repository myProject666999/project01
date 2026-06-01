package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.enums.EntrustmentStatus;
import com.judicial.appraisal.entity.Entrustment;
import com.judicial.appraisal.repository.EntrustmentRepository;
import com.judicial.appraisal.service.EntrustmentService;
import com.judicial.appraisal.util.NoGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EntrustmentServiceImpl implements EntrustmentService {

    @Autowired
    private EntrustmentRepository entrustmentRepository;

    @Override
    public List<Entrustment> findAll() {
        return entrustmentRepository.findAll();
    }

    @Override
    public Entrustment findById(Long id) {
        return entrustmentRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Entrustment save(Entrustment entrustment) {
        return entrustmentRepository.save(entrustment);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        entrustmentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Entrustment register(Entrustment entrustment, Long userId) {
        entrustment.setEntrustmentNo(NoGenerator.generateEntrustmentNo());
        entrustment.setStatus(EntrustmentStatus.REGISTERED.getCode());
        entrustment.setCreatedBy(userId);
        return entrustmentRepository.save(entrustment);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, String status) {
        Entrustment entrustment = entrustmentRepository.findById(id).orElse(null);
        if (entrustment != null) {
            entrustment.setStatus(status);
            entrustmentRepository.save(entrustment);
        }
    }

    @Override
    public List<Entrustment> findByStatus(String status) {
        return entrustmentRepository.findByStatus(status);
    }
}
