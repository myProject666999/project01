package com.lawfirm.case_management.service;

import com.lawfirm.case_management.entity.Client;
import com.lawfirm.case_management.repository.ClientRepository;
import com.lawfirm.case_management.util.NameNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final NameNormalizer nameNormalizer;

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Optional<Client> findById(Long id) {
        return clientRepository.findById(id);
    }

    public List<Client> searchByName(String name) {
        return clientRepository.findByNameContaining(name);
    }

    public Client create(Client client) {
        client.setNormalizedName(nameNormalizer.normalize(client.getName()));
        return clientRepository.save(client);
    }

    public Client update(Long id, Client client) {
        Client existing = clientRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("当事人不存在"));
        existing.setName(client.getName());
        existing.setNormalizedName(nameNormalizer.normalize(client.getName()));
        existing.setIdCard(client.getIdCard());
        existing.setPhone(client.getPhone());
        existing.setAddress(client.getAddress());
        existing.setClientType(client.getClientType());
        return clientRepository.save(existing);
    }

    public void delete(Long id) {
        clientRepository.deleteById(id);
    }
}
