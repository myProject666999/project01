package com.craftbeer.brewing.dto;

import com.craftbeer.brewing.entity.BatchProcessRecord;
import com.craftbeer.brewing.entity.BrewingBatch;
import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 批次DTO（包含批次信息、工序记录列表）
 */
@Data
public class BatchDTO {

    @NotNull(message = "批次信息不能为空")
    @Valid
    private BrewingBatch batch;

    @Valid
    private List<BatchProcessRecord> processRecords;
}
