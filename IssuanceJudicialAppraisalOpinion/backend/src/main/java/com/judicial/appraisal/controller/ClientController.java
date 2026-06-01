package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.Client;
import com.judicial.appraisal.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping
    public Result<List<Client>> getClients(@RequestParam(required = false) String name) {
        List<Client> clients;
        if (name != null && !name.isEmpty()) {
            clients = clientService.findByName(name);
        } else {
            clients = clientService.findAll();
        }
        return Result.success(clients);
    }

    @GetMapping("/{id}")
    public Result<Client> getClientById(@PathVariable Long id) {
        return Result.success(clientService.findById(id));
    }

    @PostMapping
    public Result<Client> createClient(@Valid @RequestBody Client client) {
        return Result.success(clientService.save(client));
    }

    @PutMapping("/{id}")
    public Result<Client> updateClient(@PathVariable Long id, @Valid @RequestBody Client client) {
        client.setId(id);
        return Result.success(clientService.save(client));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteById(id);
        return Result.success();
    }
}
