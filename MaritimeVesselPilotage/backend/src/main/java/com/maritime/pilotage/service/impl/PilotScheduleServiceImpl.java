package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.dto.AvailablePilotDTO;
import com.maritime.pilotage.dto.PilotScheduleCheckRequestDTO;
import com.maritime.pilotage.dto.PilotScheduleCheckResultDTO;
import com.maritime.pilotage.entity.Pilot;
import com.maritime.pilotage.entity.PilotSchedule;
import com.maritime.pilotage.mapper.PilotMapper;
import com.maritime.pilotage.mapper.PilotScheduleMapper;
import com.maritime.pilotage.mapper.PilotageAssignmentMapper;
import com.maritime.pilotage.repository.PilotScheduleRepository;
import com.maritime.pilotage.service.PilotScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PilotScheduleServiceImpl implements PilotScheduleService {

    private static final BigDecimal TEN_THOUSAND_TONS = new BigDecimal("10000");
    private static final int MIN_REST_HOURS = 8;
    private static final int PILOT_LEVEL_1 = 1;
    private static final int PILOT_LEVEL_2 = 2;
    private static final int PILOT_LEVEL_3 = 3;

    private final PilotScheduleRepository pilotScheduleRepository;
    private final PilotMapper pilotMapper;
    private final PilotScheduleMapper pilotScheduleMapper;
    private final PilotageAssignmentMapper assignmentMapper;

    @Override
    public PilotSchedule save(PilotSchedule pilotSchedule) {
        return pilotScheduleRepository.save(pilotSchedule);
    }

    @Override
    public Optional<PilotSchedule> findById(Long id) {
        return pilotScheduleRepository.findById(id);
    }

    @Override
    public List<PilotSchedule> findAll() {
        return pilotScheduleRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        pilotScheduleRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return pilotScheduleRepository.existsById(id);
    }

    @Override
    public long count() {
        return pilotScheduleRepository.count();
    }

    @Override
    public PilotScheduleCheckResultDTO checkPilotSchedule(PilotScheduleCheckRequestDTO request) {
        Pilot pilot = pilotMapper.selectById(request.getPilotId());
        if (pilot == null) {
            throw new IllegalArgumentException("引航员不存在: " + request.getPilotId());
        }

        List<String> violationMessages = new ArrayList<>();
        boolean isAvailable = true;
        boolean isQualified = true;
        boolean hasConsecutiveShifts = false;

        PilotSchedule previousSchedule = pilotScheduleMapper.findPreviousScheduleForPilot(
                request.getPilotId(), request.getPlannedPilotageTime());
        PilotSchedule nextSchedule = pilotScheduleMapper.findNextScheduleForPilot(
                request.getPilotId(), request.getPlannedPilotageTime());

        hasConsecutiveShifts = checkConsecutiveShifts(request.getPilotId(), request.getPlannedPilotageTime());
        if (hasConsecutiveShifts) {
            violationMessages.add("引航员存在连续两班情况，需要强制休息");
            isAvailable = false;
        }

        if (previousSchedule != null) {
            Duration restDuration = Duration.between(previousSchedule.getEndTime(), request.getPlannedPilotageTime());
            if (restDuration.toHours() < MIN_REST_HOURS) {
                violationMessages.add(String.format("休息时间不足%d小时（仅%d小时）",
                        MIN_REST_HOURS, restDuration.toHours()));
                isAvailable = false;
            }
        }

        if (nextSchedule != null) {
            Duration untilNextDuration = Duration.between(request.getPlannedPilotageTime().plusHours(4), nextSchedule.getStartTime());
            if (untilNextDuration.toHours() < MIN_REST_HOURS) {
                violationMessages.add("任务结束后休息时间不足，与下一班冲突");
                isAvailable = false;
            }
        }

        isQualified = checkPilotQualification(request.getPilotId(),
                request.getVesselDeadweightTonnage(), request.getVesselLevel());
        if (!isQualified) {
            int requiredLevel = getRequiredPilotLevel(request.getVesselDeadweightTonnage(), request.getVesselLevel());
            violationMessages.add(String.format("引航资质不足，需要%d级引航员，当前为%d级",
                    requiredLevel, pilot.getPilotLevel()));
        }

        if (pilot.getStatus() != 1) {
            violationMessages.add("引航员当前状态不可用");
            isAvailable = false;
        }

        Integer dailyAssignments = assignmentMapper.countDailyAssignments(
                request.getPilotId(), request.getPlannedPilotageTime());
        if (dailyAssignments != null && dailyAssignments >= 3) {
            violationMessages.add("引航员当日任务已达上限（3次）");
            isAvailable = false;
        }

        PilotScheduleCheckResultDTO.PilotScheduleCheckResultDTOBuilder resultBuilder = PilotScheduleCheckResultDTO.builder()
                .pilotId(pilot.getId())
                .pilotName(pilot.getName())
                .pilotLevel(pilot.getPilotLevel())
                .isAvailable(isAvailable)
                .isQualified(isQualified)
                .hasConsecutiveShifts(hasConsecutiveShifts)
                .violationMessages(violationMessages)
                .previousShiftEnd(previousSchedule != null ? previousSchedule.getEndTime() : null)
                .nextShiftStart(nextSchedule != null ? nextSchedule.getStartTime() : null);

        if (!isAvailable || !isQualified) {
            AvailablePilotDTO recommended = recommendBestPilot(
                    request.getPlannedPilotageTime(),
                    request.getVesselDeadweightTonnage(),
                    request.getVesselLevel());
            if (recommended != null) {
                resultBuilder.recommendedPilotId(recommended.getPilotId())
                        .recommendedPilotName(recommended.getName());
            }
        }

        return resultBuilder.build();
    }

    @Override
    public List<AvailablePilotDTO> findAvailablePilots(LocalDateTime plannedTime,
                                                       BigDecimal vesselDeadweightTonnage,
                                                       Integer vesselLevel) {
        int requiredLevel = getRequiredPilotLevel(vesselDeadweightTonnage, vesselLevel);
        List<Pilot> qualifiedPilots = pilotMapper.findQualifiedPilots(requiredLevel);

        return qualifiedPilots.stream()
                .map(pilot -> {
                    boolean isQualified = checkPilotQualification(pilot.getId(), vesselDeadweightTonnage, vesselLevel);
                    boolean hasConsecutive = hasConsecutiveShifts(pilot.getId(), plannedTime);
                    boolean hasRestConflict = checkRestConflict(pilot.getId(), plannedTime);
                    Integer dailyCount = assignmentMapper.countDailyAssignments(pilot.getId(), plannedTime);
                    boolean overloaded = dailyCount != null && dailyCount >= 3;

                    int workloadScore = calculateWorkloadScore(pilot, plannedTime, dailyCount);

                    return AvailablePilotDTO.builder()
                            .pilotId(pilot.getId())
                            .employeeNo(pilot.getEmployeeNo())
                            .name(pilot.getName())
                            .pilotLevel(pilot.getPilotLevel())
                            .pilotLevelName(getPilotLevelName(pilot.getPilotLevel()))
                            .phone(pilot.getPhone())
                            .status(pilot.getStatus())
                            .nextAvailableTime(calculateNextAvailableTime(pilot, plannedTime))
                            .consecutiveShiftsCount(getConsecutiveShiftsCount(pilot.getId(), plannedTime))
                            .isQualified(isQualified && !hasConsecutive && !hasRestConflict && !overloaded)
                            .workloadScore(workloadScore)
                            .build();
                })
                .filter(dto -> Boolean.TRUE.equals(dto.getIsQualified()))
                .sorted(Comparator.comparingInt(AvailablePilotDTO::getWorkloadScore)
                        .thenComparing(AvailablePilotDTO::getPilotLevel, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean checkPilotQualification(Long pilotId, BigDecimal vesselDeadweightTonnage, Integer vesselLevel) {
        Pilot pilot = pilotMapper.selectById(pilotId);
        if (pilot == null || pilot.getStatus() != 1) {
            return false;
        }

        int requiredLevel = getRequiredPilotLevel(vesselDeadweightTonnage, vesselLevel);
        return pilot.getPilotLevel() <= requiredLevel;
    }

    @Override
    public boolean hasConsecutiveShifts(Long pilotId, LocalDateTime plannedTime) {
        return checkConsecutiveShifts(pilotId, plannedTime);
    }

    @Override
    public AvailablePilotDTO recommendBestPilot(LocalDateTime plannedTime,
                                                BigDecimal vesselDeadweightTonnage,
                                                Integer vesselLevel) {
        List<AvailablePilotDTO> availablePilots = findAvailablePilots(plannedTime, vesselDeadweightTonnage, vesselLevel);
        return availablePilots.isEmpty() ? null : availablePilots.get(0);
    }

    @Override
    public int getRequiredPilotLevel(BigDecimal vesselDeadweightTonnage, Integer vesselLevel) {
        if (vesselDeadweightTonnage != null && vesselDeadweightTonnage.compareTo(TEN_THOUSAND_TONS) >= 0) {
            return PILOT_LEVEL_1;
        }
        if (vesselLevel != null && vesselLevel >= 2) {
            return PILOT_LEVEL_1;
        }
        if (vesselDeadweightTonnage != null && vesselDeadweightTonnage.compareTo(new BigDecimal("5000")) >= 0) {
            return PILOT_LEVEL_2;
        }
        return PILOT_LEVEL_3;
    }

    private boolean checkConsecutiveShifts(Long pilotId, LocalDateTime plannedTime) {
        LocalDate plannedDate = plannedTime.toLocalDate();
        LocalDate previousDate = plannedDate.minusDays(1);
        LocalDate nextDate = plannedDate.plusDays(1);

        Integer prevDayCount = pilotScheduleMapper.countConsecutiveDayShifts(pilotId, previousDate, plannedDate);
        if (prevDayCount != null && prevDayCount >= 2) {
            return true;
        }

        Integer nextDayCount = pilotScheduleMapper.countConsecutiveDayShifts(pilotId, plannedDate, nextDate);
        if (nextDayCount != null && nextDayCount >= 2) {
            return true;
        }

        Integer todayCount = pilotScheduleMapper.countConsecutiveDayShifts(pilotId, plannedDate, plannedDate);
        if (todayCount != null && todayCount >= 2) {
            return true;
        }

        return false;
    }

    private boolean checkRestConflict(Long pilotId, LocalDateTime plannedTime) {
        PilotSchedule previousSchedule = pilotScheduleMapper.findPreviousScheduleForPilot(pilotId, plannedTime);
        if (previousSchedule != null) {
            Duration restDuration = Duration.between(previousSchedule.getEndTime(), plannedTime);
            if (restDuration.toHours() < MIN_REST_HOURS) {
                return true;
            }
        }
        return false;
    }

    private int calculateWorkloadScore(Pilot pilot, LocalDateTime plannedTime, Integer dailyCount) {
        int score = 0;
        score += pilot.getTotalPilotageCount() / 100;
        if (dailyCount != null) {
            score += dailyCount * 10;
        }
        PilotSchedule nextSchedule = pilotScheduleMapper.findNextScheduleForPilot(pilot.getId(), plannedTime);
        if (nextSchedule != null) {
            Duration duration = Duration.between(plannedTime, nextSchedule.getStartTime());
            if (duration.toHours() < 12) {
                score += 20;
            }
        }
        return score;
    }

    private int getConsecutiveShiftsCount(Long pilotId, LocalDateTime plannedTime) {
        LocalDate startDate = plannedTime.toLocalDate().minusDays(2);
        LocalDate endDate = plannedTime.toLocalDate();
        List<PilotSchedule> schedules = pilotScheduleMapper.findByPilotIdAndDateRange(pilotId, startDate, endDate);
        return schedules.size();
    }

    private LocalDateTime calculateNextAvailableTime(Pilot pilot, LocalDateTime plannedTime) {
        PilotSchedule nextSchedule = pilotScheduleMapper.findNextScheduleForPilot(pilot.getId(), plannedTime);
        if (nextSchedule != null) {
            return nextSchedule.getEndTime().plusHours(MIN_REST_HOURS);
        }
        return plannedTime;
    }

    private String getPilotLevelName(Integer level) {
        switch (level) {
            case 1:
                return "一级引航员";
            case 2:
                return "二级引航员";
            case 3:
                return "三级引航员";
            default:
                return "未知等级";
        }
    }
}
