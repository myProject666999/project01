package com.lawfirm.case_management.service;

import com.lawfirm.case_management.entity.Lawyer;
import com.lawfirm.case_management.repository.LawyerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LawyerService {

    private final LawyerRepository lawyerRepository;

    public List<Lawyer> findAll() {
        return lawyerRepository.findAll();
    }

    public List<Lawyer> findActiveLawyers() {
        return lawyerRepository.findByStatus(1);
    }

    public Optional<Lawyer> findById(Long id) {
        return lawyerRepository.findById(id);
    }

    public Lawyer create(Lawyer lawyer) {
        return lawyerRepository.save(lawyer);
    }

    public Lawyer update(Long id, Lawyer lawyer) {
        Lawyer existing = lawyerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("律师不存在"));
        existing.setName(lawyer.getName());
        existing.setLicenseNumber(lawyer.getLicenseNumber());
        existing.setPhone(lawyer.getPhone());
        existing.setEmail(lawyer.getEmail());
        existing.setSpecialty(lawyer.getSpecialty());
        existing.setHourlyRate(lawyer.getHourlyRate());
        existing.setStatus(lawyer.getStatus());
        return lawyerRepository.save(existing);
    }

    public void delete(Long id) {
        Lawyer lawyer = lawyerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("律师不存在"));
        lawyer.setStatus(0);
        lawyerRepository.save(lawyer);
    }
}
