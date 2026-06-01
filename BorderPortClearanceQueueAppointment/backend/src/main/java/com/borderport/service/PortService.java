package com.borderport.service;

import com.borderport.dto.PortDTO;
import com.borderport.entity.Lane;
import com.borderport.entity.Port;
import com.borderport.repository.LaneRepository;
import com.borderport.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortService {

    private final PortRepository portRepository;
    private final LaneRepository laneRepository;
    private final StringRedisTemplate redisTemplate;

    public List<PortDTO> getAllPorts() {
        return portRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PortDTO getPortById(Long id) {
        Port port = portRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("口岸不存在"));
        return convertToDTO(port);
    }

    public Port createPort(Port port) {
        return portRepository.save(port);
    }

    public Port updatePort(Long id, Port port) {
        Port existing = portRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("口岸不存在"));
        existing.setName(port.getName());
        existing.setCode(port.getCode());
        existing.setLatitude(port.getLatitude());
        existing.setLongitude(port.getLongitude());
        existing.setRadius(port.getRadius());
        existing.setStatus(port.getStatus());
        return portRepository.save(existing);
    }

    private PortDTO convertToDTO(Port port) {
        List<Lane> lanes = laneRepository.findByPortId(port.getId());
        int cargoLaneCount = (int) lanes.stream().filter(l -> "CARGO".equals(l.getLaneType())).count();
        int passengerLaneCount = (int) lanes.stream().filter(l -> "PASSENGER".equals(l.getLaneType())).count();

        String congestionLevel = "SMOOTH";
        String redisKey = "port:congestion:" + port.getId();
        String cached = redisTemplate.opsForValue().get(redisKey);
        if (cached != null) {
            congestionLevel = cached;
        }

        PortDTO dto = new PortDTO();
        dto.setId(port.getId());
        dto.setName(port.getName());
        dto.setCode(port.getCode());
        dto.setLatitude(port.getLatitude());
        dto.setLongitude(port.getLongitude());
        dto.setRadius(port.getRadius());
        dto.setStatus(port.getStatus());
        dto.setCargoLaneCount(cargoLaneCount);
        dto.setPassengerLaneCount(passengerLaneCount);
        dto.setCurrentCongestionLevel(congestionLevel);
        return dto;
    }
}
