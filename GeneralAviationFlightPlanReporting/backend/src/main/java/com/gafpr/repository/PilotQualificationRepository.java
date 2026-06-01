package com.gafpr.repository;

import com.gafpr.entity.PilotQualification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PilotQualificationRepository extends JpaRepository<PilotQualification, Long> {

    List<PilotQualification> findByPilotId(Long pilotId);

    List<PilotQualification> findByPilotIdAndAircraftType(Long pilotId, String aircraftType);
}
