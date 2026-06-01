package com.gafpr.repository;

import com.gafpr.entity.Pilot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PilotRepository extends JpaRepository<Pilot, Long> {

    Optional<Pilot> findByUserId(Long userId);

    Optional<Pilot> findByLicenseNumber(String licenseNumber);
}
