package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.entity.Species;
import com.fishery.fryrelease.service.SpeciesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/species")
public class SpeciesController {

    @Autowired
    private SpeciesService speciesService;

    @GetMapping
    public Result<PageResult<Species>> getPage(PageRequest pageRequest,
                                                @RequestParam(required = false) String keyword,
                                                @RequestParam(required = false) String category) {
        return Result.success(speciesService.getPage(pageRequest, keyword, category));
    }

    @GetMapping("/list")
    public Result<List<Species>> listAll() {
        return Result.success(speciesService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Species> getById(@PathVariable Long id) {
        return Result.success(speciesService.getById(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody Species species) {
        speciesService.save(species);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Species species) {
        species.setId(id);
        speciesService.updateById(species);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        speciesService.removeById(id);
        return Result.success();
    }
}
