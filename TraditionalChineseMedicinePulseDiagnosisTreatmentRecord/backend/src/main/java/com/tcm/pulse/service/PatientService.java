package com.tcm.pulse.service;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.dto.PatientDTO;
import com.tcm.pulse.entity.Patient;
import com.tcm.pulse.exception.BusinessException;
import com.tcm.pulse.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public PageResult<Patient> findPage(int pageNum, int pageSize, String name, String phone) {
        Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Patient> page = patientRepository.findByConditions(name, phone, pageable);
        return new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
    }

    public List<Patient> findAll() {
        return patientRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("患者不存在"));
    }

    @Transactional
    public Patient create(PatientDTO dto) {
        if (dto.getPhone() != null && patientRepository.existsByPhone(dto.getPhone())) {
            throw new BusinessException("该手机号已存在");
        }
        Patient patient = new Patient();
        BeanUtils.copyProperties(dto, patient);
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient update(Long id, PatientDTO dto) {
        Patient patient = findById(id);
        if (dto.getPhone() != null && !dto.getPhone().equals(patient.getPhone())
                && patientRepository.existsByPhone(dto.getPhone())) {
            throw new BusinessException("该手机号已存在");
        }
        BeanUtils.copyProperties(dto, patient, "id", "createdAt");
        return patientRepository.save(patient);
    }

    @Transactional
    public void delete(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new BusinessException("患者不存在");
        }
        patientRepository.deleteById(id);
    }
}
