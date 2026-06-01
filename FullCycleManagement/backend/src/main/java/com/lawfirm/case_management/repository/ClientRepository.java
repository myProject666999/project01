package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByNameContaining(String name);

    @Query("SELECT c FROM Client c WHERE c.normalizedName LIKE %:normalizedName%")
    List<Client> findByNormalizedNameContaining(String normalizedName);

    List<Client> findByIdCard(String idCard);
}
