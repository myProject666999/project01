package com.gafpr.repository;

import com.gafpr.entity.ApprovalNodeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalNodeConfigRepository extends JpaRepository<ApprovalNodeConfig, Long> {

    List<ApprovalNodeConfig> findByAirspaceTypeOrderBySequenceAsc(String airspaceType);

    List<ApprovalNodeConfig> findByAirspaceTypeAndLevelOrderBySequenceAsc(String airspaceType, Integer level);
}
