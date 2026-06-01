package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.EvidenceChain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceChainRepository extends JpaRepository<EvidenceChain, Long> {

    Optional<EvidenceChain> findByChainNo(String chainNo);

    List<EvidenceChain> findByEvidenceIdOrderByOperationTimeAsc(Long evidenceId);

    List<EvidenceChain> findByEvidenceIdOrderByOperationTimeDesc(Long evidenceId);

    List<EvidenceChain> findByOperatorId(Long operatorId);

    List<EvidenceChain> findByOperationType(String operationType);
}
