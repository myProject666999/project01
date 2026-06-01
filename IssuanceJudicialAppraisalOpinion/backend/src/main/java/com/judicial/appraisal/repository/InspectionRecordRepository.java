package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.InspectionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionRecordRepository extends JpaRepository<InspectionRecord, Long> {

    List<InspectionRecord> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    List<InspectionRecord> findByEvidenceIdOrderByCreatedAtDesc(Long evidenceId);
}
