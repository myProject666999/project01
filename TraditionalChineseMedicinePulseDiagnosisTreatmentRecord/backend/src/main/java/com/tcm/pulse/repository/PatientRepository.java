package com.tcm.pulse.repository;

import com.tcm.pulse.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("SELECT p FROM Patient p WHERE " +
           "(:name IS NULL OR p.name LIKE CONCAT('%', :name, '%')) AND " +
           "(:phone IS NULL OR p.phone LIKE CONCAT('%', :phone, '%'))")
    Page<Patient> findByConditions(@Param("name") String name,
                                   @Param("phone") String phone,
                                   Pageable pageable);

    boolean existsByPhone(String phone);
}
