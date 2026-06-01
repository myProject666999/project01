package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.entity.Evidence;
import com.judicial.appraisal.repository.EvidenceRepository;
import com.judicial.appraisal.service.EvidenceService;
import com.judicial.appraisal.util.NoGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EvidenceServiceImpl implements EvidenceService {

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Override
    public List<Evidence> findAll() {
        return evidenceRepository.findAll();
    }

    @Override
    public Evidence findById(Long id) {
        return evidenceRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Evidence save(Evidence evidence) {
        return evidenceRepository.save(evidence);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        evidenceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Evidence receiveEvidence(Evidence evidence, Long userId) {
        evidence.setEvidenceNo(NoGenerator.generateEvidenceNo());
        evidence.setReceiveTime(LocalDateTime.now());
        evidence.setReceivedBy(userId);
        return evidenceRepository.save(evidence);
    }

    @Override
    @Transactional
    public void updateSealStatus(Long id, String status) {
        Evidence evidence = evidenceRepository.findById(id).orElse(null);
        if (evidence != null) {
            evidence.setSealStatus(status);
            evidenceRepository.save(evidence);
        }
    }

    @Override
    public List<Evidence> findByEntrustmentId(Long entrustmentId) {
        return evidenceRepository.findByEntrustmentId(entrustmentId);
    }

    @Override
    public List<Evidence> findBySealStatus(String sealStatus) {
        return evidenceRepository.findBySealStatus(sealStatus);
    }

    @Override
    public List<Evidence> findByEntrustmentIdAndSealStatus(Long entrustmentId, String sealStatus) {
        return evidenceRepository.findAll().stream()
                .filter(e -> entrustmentId.equals(e.getEntrustmentId()) && sealStatus.equals(e.getSealStatus()))
                .toList();
    }

    @Override
    @Transactional
    public Evidence update(Long id, Evidence evidence) {
        Evidence existing = evidenceRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        if (evidence.getEvidenceName() != null) {
            existing.setEvidenceName(evidence.getEvidenceName());
        }
        if (evidence.getEvidenceType() != null) {
            existing.setEvidenceType(evidence.getEvidenceType());
        }
        if (evidence.getDescription() != null) {
            existing.setDescription(evidence.getDescription());
        }
        if (evidence.getQuantity() != null) {
            existing.setQuantity(evidence.getQuantity());
        }
        if (evidence.getWeight() != null) {
            existing.setWeight(evidence.getWeight());
        }
        if (evidence.getStorageLocation() != null) {
            existing.setStorageLocation(evidence.getStorageLocation());
        }
        if (evidence.getDeliveredBy() != null) {
            existing.setDeliveredBy(evidence.getDeliveredBy());
        }
        return evidenceRepository.save(existing);
    }
}
