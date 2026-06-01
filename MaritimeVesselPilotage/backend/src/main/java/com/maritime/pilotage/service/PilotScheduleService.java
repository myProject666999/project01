package com.maritime.pilotage.service;

import com.maritime.pilotage.dto.AvailablePilotDTO;
import com.maritime.pilotage.dto.PilotScheduleCheckRequestDTO;
import com.maritime.pilotage.dto.PilotScheduleCheckResultDTO;
import com.maritime.pilotage.entity.PilotSchedule;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PilotScheduleService {

    PilotSchedule save(PilotSchedule pilotSchedule);

    Optional<PilotSchedule> findById(Long id);

    List<PilotSchedule> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();

    PilotScheduleCheckResultDTO checkPilotSchedule(PilotScheduleCheckRequestDTO request);

    List<AvailablePilotDTO> findAvailablePilots(LocalDateTime plannedTime,
                                                BigDecimal vesselDeadweightTonnage,
                                                Integer vesselLevel);

    boolean checkPilotQualification(Long pilotId, BigDecimal vesselDeadweightTonnage, Integer vesselLevel);

    boolean hasConsecutiveShifts(Long pilotId, LocalDateTime plannedTime);

    AvailablePilotDTO recommendBestPilot(LocalDateTime plannedTime,
                                         BigDecimal vesselDeadweightTonnage,
                                         Integer vesselLevel);

    int getRequiredPilotLevel(BigDecimal vesselDeadweightTonnage, Integer vesselLevel);
}
