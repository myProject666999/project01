package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueueInfoDTO {
    private Long portId;
    private String portName;
    private Integer waitingCount;
    private Integer processingCount;
    private Integer estimatedWaitMinutes;
    private List<LaneQueueDTO> lanes;
}
