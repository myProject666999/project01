package com.borderport.controller;

import com.borderport.common.Result;
import com.borderport.dto.PortDTO;
import com.borderport.entity.Port;
import com.borderport.service.PortService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ports")
@RequiredArgsConstructor
public class PortController {

    private final PortService portService;

    @GetMapping
    public Result<List<PortDTO>> getAll() {
        return Result.ok(portService.getAllPorts());
    }

    @GetMapping("/{id}")
    public Result<PortDTO> getById(@PathVariable Long id) {
        return Result.ok(portService.getPortById(id));
    }

    @PostMapping
    public Result<Port> create(@RequestBody Port port) {
        return Result.ok(portService.createPort(port));
    }

    @PutMapping("/{id}")
    public Result<Port> update(@PathVariable Long id, @RequestBody Port port) {
        return Result.ok(portService.updatePort(id, port));
    }
}
