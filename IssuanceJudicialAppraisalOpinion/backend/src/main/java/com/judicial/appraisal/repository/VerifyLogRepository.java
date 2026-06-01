package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.VerifyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerifyLogRepository extends JpaRepository<VerifyLog, Long> {

    List<VerifyLog> findByVerifyCodeOrderByVerifyTimeDesc(String verifyCode);
}
