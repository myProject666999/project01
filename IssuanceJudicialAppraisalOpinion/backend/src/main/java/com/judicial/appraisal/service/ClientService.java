package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.Client;

import java.util.List;

public interface ClientService {

    List<Client> findAll();

    Client findById(Long id);

    Client save(Client client);

    void deleteById(Long id);

    List<Client> findByName(String name);

    Client findOrCreateByName(String name, String phone);
}
