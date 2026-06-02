package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.entity.Tug;
import com.maritime.pilotage.repository.TugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tugs")
public class TugController {

    @Autowired
    private TugRepository tugRepository;

    @GetMapping
    public Result<List<Tug>> list() {
        List<Tug> list = tugRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Tug> getById(@PathVariable Long id) {
        Optional<Tug> tug = tugRepository.findById(id);
        return tug.map(Result::success).orElseGet(() -> Result.error("拖轮不存在"));
    }

    @PostMapping
    public Result<Tug> create(@RequestBody Tug tug) {
        Tug saved = tugRepository.save(tug);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<Tug> update(@PathVariable Long id, @RequestBody Tug tug) {
        if (!tugRepository.existsById(id)) {
            return Result.error("拖轮不存在");
        }
        tug.setId(id);
        Tug updated = tugRepository.save(tug);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!tugRepository.existsById(id)) {
            return Result.error("拖轮不存在");
        }
        tugRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/search")
    public Result<List<Tug>> search(@RequestParam(required = false) String tugName,
                                    @RequestParam(required = false) String tugCode,
                                    @RequestParam(required = false) Integer status) {
        List<Tug> list = tugRepository.findAll();
        if (tugName != null) {
            list = list.stream().filter(t -> t.getTugName().contains(tugName)).collect(Collectors.toList());
        }
        if (tugCode != null) {
            list = list.stream().filter(t -> tugCode.equals(t.getTugCode())).collect(Collectors.toList());
        }
        if (status != null) {
            list = list.stream().filter(t -> status.equals(t.getStatus())).collect(Collectors.toList());
        }
        return Result.success(list);
    }

    @GetMapping("/available")
    public Result<List<Tug>> getAvailableTugs() {
        List<Tug> list = tugRepository.findAll().stream()
                .filter(t -> t.getStatus() == 1)
                .collect(Collectors.toList());
        return Result.success(list);
    }
}
