package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.Lawyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LawyerRepository extends JpaRepository<Lawyer, Long> {

    List<Lawyer> findByStatus(Integer status);

    Lawyer findByLicenseNumber(String licenseNumber);
}
