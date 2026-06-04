package com.tcm.pulse.controller;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.common.Result;
import com.tcm.pulse.entity.Herb;
import com.tcm.pulse.entity.HerbAlias;
import com.tcm.pulse.service.HerbService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "草药库管理", description = "草药及别名的查询管理")
@RestController
@RequestMapping("/herbs")
@RequiredArgsConstructor
public class HerbController {

    private final HerbService herbService;

    @Operation(summary = "分页查询草药列表")
    @GetMapping
    public Result<PageResult<Herb>> findPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.success(herbService.findPage(pageNum, pageSize, keyword));
    }

    @Operation(summary = "查询所有草药")
    @GetMapping("/all")
    public Result<List<Herb>> findAll() {
        return Result.success(herbService.findAll());
    }

    @Operation(summary = "根据ID查询草药")
    @GetMapping("/{id}")
    public Result<Herb> findById(@PathVariable Long id) {
        return Result.success(herbService.findById(id));
    }

    @Operation(summary = "根据名称或别名查询草药")
    @GetMapping("/search")
    public Result<Herb> findByNameOrAlias(@RequestParam String name) {
        return Result.success(herbService.findByNameOrAlias(name));
    }

    @Operation(summary = "查询草药的所有别名")
    @GetMapping("/{id}/aliases")
    public Result<List<HerbAlias>> getAliases(@PathVariable Long id) {
        return Result.success(herbService.getAliases(id));
    }

    @Operation(summary = "为草药添加别名")
    @PostMapping("/{id}/aliases")
    public Result<Herb> addAlias(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String aliasName = body.get("aliasName");
        return Result.success(herbService.addAlias(id, aliasName));
    }

    @Operation(summary = "删除草药别名")
    @DeleteMapping("/aliases/{aliasId}")
    public Result<Void> removeAlias(@PathVariable Long aliasId) {
        herbService.removeAlias(aliasId);
        return Result.success();
    }
}
