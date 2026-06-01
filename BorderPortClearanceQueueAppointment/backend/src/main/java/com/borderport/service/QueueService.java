package com.borderport.service;

import com.borderport.dto.LaneQueueDTO;
import com.borderport.dto.QueueInfoDTO;
import com.borderport.entity.Lane;
import com.borderport.entity.Port;
import com.borderport.entity.QueueRecord;
import com.borderport.repository.LaneRepository;
import com.borderport.repository.PortRepository;
import com.borderport.repository.QueueRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueRecordRepository queueRecordRepository;
    private final PortRepository portRepository;
    private final LaneRepository laneRepository;

    public QueueInfoDTO getQueueInfo(Long portId) {
        Port port = portRepository.findById(portId)
                .orElseThrow(() -> new RuntimeException("口岸不存在"));
        int waitingCount = queueRecordRepository.countByPortIdAndStatus(portId, "WAITING");
        int processingCount = queueRecordRepository.countByPortIdAndStatus(portId, "PROCESSING");
        int estimatedWaitMinutes = waitingCount * 5;

        List<Lane> lanes = laneRepository.findByPortId(portId);
        List<LaneQueueDTO> laneDetails = lanes.stream()
                .map(lane -> {
                    List<QueueRecord> waitingRecords = queueRecordRepository.findByPortIdAndStatus(portId, "WAITING");
                    int laneWaiting = (int) waitingRecords.stream()
                            .filter(r -> lane.getLaneName().equals(r.getLaneName()))
                            .count();
                    LaneQueueDTO dto = new LaneQueueDTO();
                    dto.setLaneId(lane.getId());
                    dto.setLaneName(lane.getLaneName());
                    dto.setLaneType(lane.getLaneType());
                    dto.setStatus(lane.getStatus());
                    dto.setWaitingCount(laneWaiting);
                    return dto;
                })
                .collect(Collectors.toList());

        return new QueueInfoDTO(portId, port.getName(), waitingCount, processingCount, estimatedWaitMinutes, laneDetails);
    }

    public QueueRecord updateQueueStatus(Long recordId, String status) {
        QueueRecord record = queueRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("排队记录不存在"));
        record.setStatus(status);
        return queueRecordRepository.save(record);
    }

    public QueueRecord clearVehicle(Long recordId) {
        QueueRecord record = queueRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("排队记录不存在"));
        record.setStatus("CLEARED");
        record.setClearedAt(LocalDateTime.now());
        return queueRecordRepository.save(record);
    }
}
