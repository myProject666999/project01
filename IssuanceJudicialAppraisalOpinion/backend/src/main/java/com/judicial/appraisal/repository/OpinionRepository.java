package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.Opinion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpinionRepository extends JpaRepository<Opinion, Long> {

    Optional<Opinion> findByVerifyCode(String verifyCode);

    List<Opinion> findByStatus(String status);

    List<Opinion> findByEntrustmentId(Long entrustmentId);
}
