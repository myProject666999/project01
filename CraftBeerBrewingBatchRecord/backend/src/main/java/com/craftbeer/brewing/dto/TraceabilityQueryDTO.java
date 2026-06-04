package com.craftbeer.brewing.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 追溯查询条件DTO
 */
@Data
public class TraceabilityQueryDTO {

    private Long batchId;

    private String batchNo;

    private Long materialId;

    private String materialName;

    private Long processTypeId;

    private String traceType;

    private String rootCauseCategory;

    private String qualityStatus;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer pageNum = 1;

    private Integer pageSize = 10;
}
