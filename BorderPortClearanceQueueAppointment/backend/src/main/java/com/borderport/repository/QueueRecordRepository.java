package com.borderport.repository;

import com.borderport.entity.QueueRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QueueRecordRepository extends JpaRepository<QueueRecord, Long> {

    List<QueueRecord> findByPortIdAndStatus(Long portId, String status);

    int countByPortIdAndStatus(Long portId, String status);
}
