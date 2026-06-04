package com.craftbeer.brewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.craftbeer.brewing.dto.TemperatureDataDTO;
import com.craftbeer.brewing.entity.FermentationTemperature;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 发酵温度Service接口
 */
public interface FermentationTemperatureService extends IService<FermentationTemperature> {

    /**
     * 写入温度时序数据
     */
    boolean addTemperatureRecord(TemperatureDataDTO temperatureDataDTO);

    /**
     * 批量写入温度数据
     */
    boolean batchAddTemperatureRecords(List<TemperatureDataDTO> temperatureDataDTOList);

    /**
     * 查询批次温度曲线数据
     */
    List<FermentationTemperature> getTemperatureCurve(Long batchId);

    /**
     * 按时间范围查询温度数据
     */
    List<FermentationTemperature> getTemperatureByTimeRange(Long batchId, LocalDateTime startTime, LocalDateTime endTime);
}
