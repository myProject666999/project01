package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.dto.AssignmentPostponeRequestDTO;
import com.maritime.pilotage.dto.AssignmentPostponeResultDTO;
import com.maritime.pilotage.entity.PilotageAssignment;
import com.maritime.pilotage.repository.PilotageAssignmentRepository;
import com.maritime.pilotage.service.AssignmentPostponeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pilotage-assignments")
public class PilotageAssignmentController {

    @Autowired
    private PilotageAssignmentRepository pilotageAssignmentRepository;

    @Autowired
    private AssignmentPostponeService assignmentPostponeService;

    @GetMapping
    public Result<List<PilotageAssignment>> list() {
        List<PilotageAssignment> list = pilotageAssignmentRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<PilotageAssignment> getById(@PathVariable Long id) {
        Optional<PilotageAssignment> assignment = pilotageAssignmentRepository.findById(id);
        return assignment.map(Result::success).orElseGet(() -> Result.error("任务分配不存在"));
    }

    @PostMapping
    public Result<PilotageAssignment> create(@RequestBody PilotageAssignment assignment) {
        PilotageAssignment saved = pilotageAssignmentRepository.save(assignment);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<PilotageAssignment> update(@PathVariable Long id, @RequestBody PilotageAssignment assignment) {
        if (!pilotageAssignmentRepository.existsById(id)) {
            return Result.error("任务分配不存在");
        }
        assignment.setId(id);
        PilotageAssignment updated = pilotageAssignmentRepository.save(assignment);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!pilotageAssignmentRepository.existsById(id)) {
            return Result.error("任务分配不存在");
        }
        pilotageAssignmentRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/search")
    public Result<List<PilotageAssignment>> search(@RequestParam(required = false) String assignmentNo,
                                                    @RequestParam(required = false) Long orderId,
                                                    @RequestParam(required = false) Long pilotId,
                                                    @RequestParam(required = false) Integer status) {
        List<PilotageAssignment> list = pilotageAssignmentRepository.findAll();
        if (assignmentNo != null) {
            list = list.stream().filter(a -> assignmentNo.equals(a.getAssignmentNo())).collect(Collectors.toList());
        }
        if (orderId != null) {
            list = list.stream().filter(a -> orderId.equals(a.getOrderId())).collect(Collectors.toList());
        }
        if (pilotId != null) {
            list = list.stream().filter(a -> pilotId.equals(a.getPilotId())).collect(Collectors.toList());
        }
        if (status != null) {
            list = list.stream().filter(a -> status.equals(a.getStatus())).collect(Collectors.toList());
        }
        return Result.success(list);
    }

    @GetMapping("/order/{orderId}")
    public Result<List<PilotageAssignment>> getByOrderId(@PathVariable Long orderId) {
        List<PilotageAssignment> list = pilotageAssignmentRepository.findAll().stream()
                .filter(a -> orderId.equals(a.getOrderId()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/pilot/{pilotId}")
    public Result<List<PilotageAssignment>> getByPilotId(@PathVariable Long pilotId) {
        List<PilotageAssignment> list = pilotageAssignmentRepository.findAll().stream()
                .filter(a -> pilotId.equals(a.getPilotId()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/status/{status}")
    public Result<List<PilotageAssignment>> getByStatus(@PathVariable Integer status) {
        List<PilotageAssignment> list = pilotageAssignmentRepository.findAll().stream()
                .filter(a -> status.equals(a.getStatus()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @PostMapping("/postpone")
    public Result<AssignmentPostponeResultDTO> postponeAssignment(@RequestBody AssignmentPostponeRequestDTO request) {
        AssignmentPostponeResultDTO result = assignmentPostponeService.postponeAssignment(request);
        return Result.success("延期成功", result);
    }

    @GetMapping("/planned-time-range")
    public Result<List<PilotageAssignment>> getByPlannedTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<PilotageAssignment> list = pilotageAssignmentRepository.findAll().stream()
                .filter(a -> !a.getPlannedPilotageTime().isBefore(start) && !a.getPlannedPilotageTime().isAfter(end))
                .collect(Collectors.toList());
        return Result.success(list);
    }
}
