package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.entity.Pilot;
import com.maritime.pilotage.repository.PilotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pilots")
public class PilotController {

    @Autowired
    private PilotRepository pilotRepository;

    @GetMapping
    public Result<List<Pilot>> list() {
        List<Pilot> list = pilotRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Pilot> getById(@PathVariable Long id) {
        Optional<Pilot> pilot = pilotRepository.findById(id);
        return pilot.map(Result::success).orElseGet(() -> Result.error("引航员不存在"));
    }

    @PostMapping
    public Result<Pilot> create(@RequestBody Pilot pilot) {
        Pilot saved = pilotRepository.save(pilot);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<Pilot> update(@PathVariable Long id, @RequestBody Pilot pilot) {
        if (!pilotRepository.existsById(id)) {
            return Result.error("引航员不存在");
        }
        pilot.setId(id);
        Pilot updated = pilotRepository.save(pilot);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!pilotRepository.existsById(id)) {
            return Result.error("引航员不存在");
        }
        pilotRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/search")
    public Result<List<Pilot>> search(@RequestParam(required = false) String name,
                                      @RequestParam(required = false) String employeeNo,
                                      @RequestParam(required = false) Integer pilotLevel,
                                      @RequestParam(required = false) Integer status) {
        List<Pilot> list = pilotRepository.findAll();
        if (name != null) {
            list = list.stream().filter(p -> p.getName().contains(name)).collect(Collectors.toList());
        }
        if (employeeNo != null) {
            list = list.stream().filter(p -> employeeNo.equals(p.getEmployeeNo())).collect(Collectors.toList());
        }
        if (pilotLevel != null) {
            list = list.stream().filter(p -> pilotLevel.equals(p.getPilotLevel())).collect(Collectors.toList());
        }
        if (status != null) {
            list = list.stream().filter(p -> status.equals(p.getStatus())).collect(Collectors.toList());
        }
        return Result.success(list);
    }

    @GetMapping("/available")
    public Result<List<Pilot>> getAvailablePilots() {
        List<Pilot> list = pilotRepository.findAll().stream()
                .filter(p -> p.getStatus() == 1)
                .collect(Collectors.toList());
        return Result.success(list);
    }
}
