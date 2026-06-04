package com.tcm.pulse.repository;

import com.tcm.pulse.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    @EntityGraph(attributePaths = "items")
    @Query("SELECT p FROM Prescription p WHERE p.patientId = :patientId ORDER BY p.createdAt DESC")
    List<Prescription> findByPatientIdForComparison(@Param("patientId") Long patientId);

    @Query("SELECT p FROM Prescription p WHERE " +
           "(:patientId IS NULL OR p.patientId = :patientId) AND " +
           "(:doctorName IS NULL OR p.doctorName LIKE CONCAT('%', :doctorName, '%'))")
    Page<Prescription> findByConditions(@Param("patientId") Long patientId,
                                        @Param("doctorName") String doctorName,
                                        Pageable pageable);

    @EntityGraph(attributePaths = "items")
    Optional<Prescription> findWithItemsById(Long id);

    Optional<Prescription> findTopByPatientIdOrderByCreatedAtDesc(Long patientId);
}
