package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByBizTypeAndBizId(String bizType, Long bizId);
}
