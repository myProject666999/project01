package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.CaseLawyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseLawyerRepository extends JpaRepository<CaseLawyer, Long> {

    List<CaseLawyer> findByCaseId(Long caseId);

    List<CaseLawyer> findByLawyerId(Long lawyerId);

    void deleteByCaseIdAndLawyerId(Long caseId, Long lawyerId);
}
