package com.tcm.pulse.service;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.dto.ConsultationDTO;
import com.tcm.pulse.entity.Consultation;
import com.tcm.pulse.exception.BusinessException;
import com.tcm.pulse.repository.ConsultationRepository;
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
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;

    public PageResult<Consultation> findPage(int pageNum, int pageSize, Long patientId, String keyword) {
        Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Direction.DESC, "visitDate"));
        Page<Consultation> page = consultationRepository.findByConditions(patientId, keyword, pageable);
        return new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
    }

    public List<Consultation> findByPatientId(Long patientId) {
        return consultationRepository.findByPatientIdOrderByVisitDateDesc(patientId);
    }

    public Consultation findById(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("诊疗记录不存在"));
    }

    @Transactional
    public Consultation create(ConsultationDTO dto) {
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new BusinessException("患者不存在");
        }
        Consultation consultation = new Consultation();
        BeanUtils.copyProperties(dto, consultation);
        return consultationRepository.save(consultation);
    }

    @Transactional
    public Consultation update(Long id, ConsultationDTO dto) {
        Consultation consultation = findById(id);
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new BusinessException("患者不存在");
        }
        BeanUtils.copyProperties(dto, consultation, "id");
        return consultationRepository.save(consultation);
    }

    @Transactional
    public void delete(Long id) {
        if (!consultationRepository.existsById(id)) {
            throw new BusinessException("诊疗记录不存在");
        }
        consultationRepository.deleteById(id);
    }
}
