package com.borderport.repository;

import com.borderport.entity.Lane;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LaneRepository extends JpaRepository<Lane, Long> {

    List<Lane> findByPortId(Long portId);

    List<Lane> findByPortIdAndLaneType(Long portId, String laneType);
}
