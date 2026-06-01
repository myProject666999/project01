package com.gafpr.service;

import com.gafpr.entity.*;
import com.gafpr.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class FlightPlanService {

    @Autowired
    private FlightPlanRepository flightPlanRepository;

    @Autowired
    private PilotRepository pilotRepository;

    @Autowired
    private PilotQualificationRepository pilotQualificationRepository;

    @Autowired
    private AircraftRepository aircraftRepository;

    @Autowired
    private AirspaceRepository airspaceRepository;

    @Autowired
    private ApprovalNodeConfigRepository approvalNodeConfigRepository;

    @Autowired
    private ApprovalProcessRepository approvalProcessRepository;

    @Autowired
    private PilotQualificationRepository qualificationRepository;

    public List<FlightPlan> getAllFlightPlans() {
        return flightPlanRepository.findAll();
    }

    public FlightPlan getFlightPlanById(Long id) {
        return flightPlanRepository.findById(id).orElse(null);
    }

    public List<FlightPlan> getFlightPlansByPilot(Long pilotId) {
        return flightPlanRepository.findByPilotIdOrderByCreatedAtDesc(pilotId);
    }

    public List<FlightPlan> getFlightPlansByStatus(String status) {
        return flightPlanRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional
    public FlightPlan createFlightPlan(FlightPlan flightPlan) {
        flightPlan.setStatus("DRAFT");
        return flightPlanRepository.save(flightPlan);
    }

    @Transactional
    public FlightPlan updateFlightPlan(Long id, FlightPlan flightPlan) {
        FlightPlan existing = flightPlanRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        if (!"DRAFT".equals(existing.getStatus())) {
            throw new RuntimeException("只能修改草稿状态的计划");
        }
        flightPlan.setId(id);
        return flightPlanRepository.save(flightPlan);
    }

    @Transactional
    public FlightPlan submitFlightPlan(Long id) {
        FlightPlan flightPlan = flightPlanRepository.findById(id).orElse(null);
        if (flightPlan == null) {
            return null;
        }

        Pilot pilot = pilotRepository.findById(flightPlan.getPilotId()).orElse(null);
        Aircraft aircraft = aircraftRepository.findById(flightPlan.getAircraftId()).orElse(null);

        if (pilot == null || pilot.getStatus() != 1) {
            throw new RuntimeException("飞行员资质无效");
        }

        List<PilotQualification> qualifications = qualificationRepository.findByPilotIdAndAircraftType(
                flightPlan.getPilotId(), aircraft.getAircraftType());
        if (qualifications.isEmpty()) {
            throw new RuntimeException("飞行员无此机型驾驶资质");
        }

        String[] airspaceIdArray = flightPlan.getAirspaceIds().split(",");
        for (String airspaceIdStr : airspaceIdArray) {
            Long airspaceId = Long.parseLong(airspaceIdStr.trim());
            List<FlightPlan> conflicts = flightPlanRepository.findConflictingPlans(
                    String.valueOf(airspaceId),
                    flightPlan.getDepartureTime(),
                    flightPlan.getArrivalTime());
            if (!conflicts.isEmpty() && !conflicts.get(0).getId().equals(id)) {
                throw new RuntimeException("空域时段存在冲突");
            }
        }

        String planNumber = "FP" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) 
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        flightPlan.setPlanNumber(planNumber);
        flightPlan.setStatus("SUBMITTED");
        flightPlan.setSubmitTime(LocalDateTime.now());
        flightPlanRepository.save(flightPlan);

        createApprovalProcess(flightPlan);

        return flightPlan;
    }

    private void createApprovalProcess(FlightPlan flightPlan) {
        String[] airspaceIdArray = flightPlan.getAirspaceIds().split(",");
        int maxLevel = 1;
        String maxAirspaceType = "G";

        for (String airspaceIdStr : airspaceIdArray) {
            Long airspaceId = Long.parseLong(airspaceIdStr.trim());
            Airspace airspace = airspaceRepository.findById(airspaceId).orElse(null);
            if (airspace != null && airspace.getApprovalLevel() > maxLevel) {
                maxLevel = airspace.getApprovalLevel();
                maxAirspaceType = airspace.getType();
            }
        }

        List<ApprovalNodeConfig> configs = approvalNodeConfigRepository
                .findByAirspaceTypeAndLevelOrderBySequenceAsc(maxAirspaceType, maxLevel);

        for (ApprovalNodeConfig config : configs) {
            ApprovalProcess process = new ApprovalProcess();
            process.setFlightPlanId(flightPlan.getId());
            process.setNodeConfigId(config.getId());
            process.setLevel(config.getLevel());
            process.setSequence(config.getSequence());
            process.setNodeName(config.getNodeName());
            process.setApproverUserId(config.getApproverUserId());
            process.setStatus("PENDING");
            approvalProcessRepository.save(process);
        }
    }

    @Transactional
    public FlightPlan closeFlightPlan(Long id, LocalDateTime actualDeparture, LocalDateTime actualArrival) {
        FlightPlan flightPlan = flightPlanRepository.findById(id).orElse(null);
        if (flightPlan == null) {
            return null;
        }
        if (!"APPROVED".equals(flightPlan.getStatus())) {
            throw new RuntimeException("只能对已批复的计划进行销号");
        }

        flightPlan.setActualDepartureTime(actualDeparture);
        flightPlan.setActualArrivalTime(actualArrival);
        flightPlan.setStatus("COMPLETED");
        flightPlan.setCloseTime(LocalDateTime.now());
        flightPlanRepository.save(flightPlan);

        Pilot pilot = pilotRepository.findById(flightPlan.getPilotId()).orElse(null);
        if (pilot != null && actualDeparture != null && actualArrival != null) {
            long minutes = java.time.Duration.between(actualDeparture, actualArrival).toMinutes();
            double hours = minutes / 60.0;
            pilot.setTotalFlightHours(pilot.getTotalFlightHours().add(java.math.BigDecimal.valueOf(hours)));
            pilotRepository.save(pilot);
        }

        return flightPlan;
    }

    @Transactional
    public boolean deleteFlightPlan(Long id) {
        FlightPlan flightPlan = flightPlanRepository.findById(id).orElse(null);
        if (flightPlan == null) {
            return false;
        }
        if (!"DRAFT".equals(flightPlan.getStatus())) {
            throw new RuntimeException("只能删除草稿状态的计划");
        }
        flightPlanRepository.deleteById(id);
        return true;
    }
}
