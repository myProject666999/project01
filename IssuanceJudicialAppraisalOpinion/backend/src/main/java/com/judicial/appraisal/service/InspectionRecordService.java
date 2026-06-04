package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.InspectionRecord;

import java.util.List;

public interface InspectionRecordService {

    InspectionRecord createRecord(InspectionRecord record, Long appraiserId);

    InspectionRecord findById(Long id);

    List<InspectionRecord> findAll();

    List<InspectionRecord> findByTaskId(Long taskId);

    List<InspectionRecord> findByEvidenceId(Long evidenceId);

    void deleteById(Long id);
}
