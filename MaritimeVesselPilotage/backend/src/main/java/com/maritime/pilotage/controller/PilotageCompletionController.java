package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.entity.PilotageCompletion;
import com.maritime.pilotage.repository.PilotageCompletionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pilotage-completions")
public class PilotageCompletionController {

    @Autowired
    private PilotageCompletionRepository pilotageCompletionRepository;

    @GetMapping
    public Result<List<PilotageCompletion>> list() {
        List<PilotageCompletion> list = pilotageCompletionRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<PilotageCompletion> getById(@PathVariable Long id) {
        Optional<PilotageCompletion> completion = pilotageCompletionRepository.findById(id);
        return completion.map(Result::success).orElseGet(() -> Result.error("完成单不存在"));
    }

    @PostMapping
    public Result<PilotageCompletion> create(@RequestBody PilotageCompletion completion) {
        PilotageCompletion saved = pilotageCompletionRepository.save(completion);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<PilotageCompletion> update(@PathVariable Long id, @RequestBody PilotageCompletion completion) {
        if (!pilotageCompletionRepository.existsById(id)) {
            return Result.error("完成单不存在");
        }
        completion.setId(id);
        PilotageCompletion updated = pilotageCompletionRepository.save(completion);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!pilotageCompletionRepository.existsById(id)) {
            return Result.error("完成单不存在");
        }
        pilotageCompletionRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/search")
    public Result<List<PilotageCompletion>> search(@RequestParam(required = false) String completionNo,
                                                    @RequestParam(required = false) Long assignmentId,
                                                    @RequestParam(required = false) Integer completionStatus) {
        List<PilotageCompletion> list = pilotageCompletionRepository.findAll();
        if (completionNo != null) {
            list = list.stream().filter(c -> completionNo.equals(c.getCompletionNo())).collect(Collectors.toList());
        }
        if (assignmentId != null) {
            list = list.stream().filter(c -> assignmentId.equals(c.getAssignmentId())).collect(Collectors.toList());
        }
        if (completionStatus != null) {
            list = list.stream().filter(c -> completionStatus.equals(c.getCompletionStatus())).collect(Collectors.toList());
        }
        return Result.success(list);
    }

    @GetMapping("/assignment/{assignmentId}")
    public Result<PilotageCompletion> getByAssignmentId(@PathVariable Long assignmentId) {
        Optional<PilotageCompletion> completion = pilotageCompletionRepository.findAll().stream()
                .filter(c -> assignmentId.equals(c.getAssignmentId()))
                .findFirst();
        return completion.map(Result::success).orElseGet(() -> Result.error("完成单不存在"));
    }

    @GetMapping("/status/{status}")
    public Result<List<PilotageCompletion>> getByStatus(@PathVariable Integer status) {
        List<PilotageCompletion> list = pilotageCompletionRepository.findAll().stream()
                .filter(c -> status.equals(c.getCompletionStatus()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/quality/{quality}")
    public Result<List<PilotageCompletion>> getByQuality(@PathVariable Integer quality) {
        List<PilotageCompletion> list = pilotageCompletionRepository.findAll().stream()
                .filter(c -> quality.equals(c.getPilotageQuality()))
                .collect(Collectors.toList());
        return Result.success(list);
    }
}
