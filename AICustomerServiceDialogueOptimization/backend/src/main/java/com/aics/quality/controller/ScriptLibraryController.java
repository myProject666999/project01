package com.aics.quality.controller;

import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.common.Result;
import com.aics.quality.entity.ScriptLibrary;
import com.aics.quality.service.ScriptLibraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/script")
public class ScriptLibraryController {

    @Autowired
    private ScriptLibraryService scriptLibraryService;

    @GetMapping("/list")
    public Result<PageResult<ScriptLibrary>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status) {
        PageQuery pageQuery = new PageQuery();
        pageQuery.setPageNum(pageNum);
        pageQuery.setPageSize(pageSize);
        return Result.success(scriptLibraryService.list(pageQuery, keyword, categoryId, status));
    }

    @GetMapping("/{id}")
    public Result<ScriptLibrary> getById(@PathVariable Long id) {
        return Result.success(scriptLibraryService.getById(id));
    }

    @PostMapping
    public Result<ScriptLibrary> save(@RequestBody ScriptLibrary script) {
        return Result.success(scriptLibraryService.save(script));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody ScriptLibrary script) {
        return Result.success(scriptLibraryService.update(script));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(scriptLibraryService.delete(id));
    }

    @PostMapping("/{id}/use")
    public Result<Void> incrementUseCount(@PathVariable Long id) {
        scriptLibraryService.incrementUseCount(id);
        return Result.success();
    }

    @PostMapping("/{id}/like")
    public Result<Void> incrementLikeCount(@PathVariable Long id) {
        scriptLibraryService.incrementLikeCount(id);
        return Result.success();
    }
}
