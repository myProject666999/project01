package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaneQueueDTO {
    private Long laneId;
    private String laneName;
    private String laneType;
    private String status;
    private Integer waitingCount;
}
