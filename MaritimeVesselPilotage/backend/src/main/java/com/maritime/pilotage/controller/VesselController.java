package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.entity.Vessel;
import com.maritime.pilotage.repository.VesselRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vessels")
public class VesselController {

    @Autowired
    private VesselRepository vesselRepository;

    @GetMapping
    public Result<List<Vessel>> list() {
        List<Vessel> list = vesselRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Vessel> getById(@PathVariable Long id) {
        Optional<Vessel> vessel = vesselRepository.findById(id);
        return vessel.map(Result::success).orElseGet(() -> Result.error("船舶不存在"));
    }

    @PostMapping
    public Result<Vessel> create(@RequestBody Vessel vessel) {
        Vessel saved = vesselRepository.save(vessel);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<Vessel> update(@PathVariable Long id, @RequestBody Vessel vessel) {
        if (!vesselRepository.existsById(id)) {
            return Result.error("船舶不存在");
        }
        vessel.setId(id);
        Vessel updated = vesselRepository.save(vessel);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!vesselRepository.existsById(id)) {
            return Result.error("船舶不存在");
        }
        vesselRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/search")
    public Result<List<Vessel>> search(@RequestParam(required = false) String vesselName,
                                       @RequestParam(required = false) String imoNumber,
                                       @RequestParam(required = false) Integer vesselLevel) {
        List<Vessel> list = vesselRepository.findAll();
        if (vesselName != null) {
            list = list.stream().filter(v -> v.getVesselName().contains(vesselName)).collect(Collectors.toList());
        }
        if (imoNumber != null) {
            list = list.stream().filter(v -> imoNumber.equals(v.getImoNumber())).collect(Collectors.toList());
        }
        if (vesselLevel != null) {
            list = list.stream().filter(v -> vesselLevel.equals(v.getVesselLevel())).collect(Collectors.toList());
        }
        return Result.success(list);
    }
}
