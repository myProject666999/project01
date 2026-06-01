package com.gafpr.repository;

import com.gafpr.entity.Airspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AirspaceRepository extends JpaRepository<Airspace, Long> {

    Optional<Airspace> findByCode(String code);

    List<Airspace> findByType(String type);

    List<Airspace> findByStatus(Integer status);
}
