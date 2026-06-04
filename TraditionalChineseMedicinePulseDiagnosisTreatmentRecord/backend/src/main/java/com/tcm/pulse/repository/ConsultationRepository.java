package com.tcm.pulse.repository;

import com.tcm.pulse.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByPatientIdOrderByVisitDateDesc(Long patientId);

    @Query("SELECT c FROM Consultation c WHERE " +
           "(:patientId IS NULL OR c.patientId = :patientId) AND " +
           "(:keyword IS NULL OR c.chiefComplaint LIKE CONCAT('%', :keyword, '%'))")
    Page<Consultation> findByConditions(@Param("patientId") Long patientId,
                                        @Param("keyword") String keyword,
                                        Pageable pageable);
}
