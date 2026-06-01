package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.Evidence;

import java.util.List;

public interface EvidenceService {

    List<Evidence> findAll();

    Evidence findById(Long id);

    Evidence save(Evidence evidence);

    void deleteById(Long id);

    Evidence receiveEvidence(Evidence evidence, Long userId);

    void updateSealStatus(Long id, String status);

    List<Evidence> findByEntrustmentId(Long entrustmentId);

    List<Evidence> findBySealStatus(String sealStatus);

    List<Evidence> findByEntrustmentIdAndSealStatus(Long entrustmentId, String sealStatus);

    Evidence update(Long id, Evidence evidence);
}
