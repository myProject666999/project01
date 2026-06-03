package com.judicial.appraisal.repository;

import com.judicial.appraisal.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByNameContaining(String name);

    Optional<Client> findFirstByName(String name);
}
