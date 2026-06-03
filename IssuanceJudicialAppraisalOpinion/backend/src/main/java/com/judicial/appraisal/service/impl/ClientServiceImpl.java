package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.entity.Client;
import com.judicial.appraisal.repository.ClientRepository;
import com.judicial.appraisal.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClientServiceImpl implements ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Override
    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    @Override
    public Client findById(Long id) {
        return clientRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Client save(Client client) {
        return clientRepository.save(client);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        clientRepository.deleteById(id);
    }

    @Override
    public List<Client> findByName(String name) {
        return clientRepository.findByNameContaining(name);
    }

    @Override
    @Transactional
    public Client findOrCreateByName(String name, String phone) {
        return clientRepository.findFirstByName(name).orElseGet(() -> {
            Client client = new Client();
            client.setClientType("INDIVIDUAL");
            client.setName(name);
            client.setContactPerson(name);
            client.setContactPhone(phone);
            return clientRepository.save(client);
        });
    }
}
