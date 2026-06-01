package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.AppraisalTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppraisalTaskRepository extends JpaRepository<AppraisalTask, Long> {

    List<AppraisalTask> findByAppraiserId(Long appraiserId);

    List<AppraisalTask> findByStatus(String status);

    List<AppraisalTask> findByAppraiserIdAndStatus(Long appraiserId, String status);
}
