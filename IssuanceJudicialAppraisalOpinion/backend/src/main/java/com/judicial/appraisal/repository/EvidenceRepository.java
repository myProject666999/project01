package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    Optional<Evidence> findByEvidenceNo(String evidenceNo);

    List<Evidence> findByEntrustmentId(Long entrustmentId);

    List<Evidence> findBySealStatus(String sealStatus);
}
