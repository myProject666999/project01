package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.Entrustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntrustmentRepository extends JpaRepository<Entrustment, Long> {

    List<Entrustment> findByStatus(String status);
}
