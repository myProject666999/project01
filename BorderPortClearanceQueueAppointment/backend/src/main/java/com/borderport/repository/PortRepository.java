package com.borderport.repository;

import com.borderport.entity.Port;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortRepository extends JpaRepository<Port, Long> {

    List<Port> findByStatus(String status);
}
