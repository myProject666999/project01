package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.dto.TemperatureDataDTO;
import com.craftbeer.brewing.entity.FermentationTemperature;
import com.craftbeer.brewing.mapper.FermentationTemperatureMapper;
import com.craftbeer.brewing.service.FermentationTemperatureService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 发酵温度Service实现类
 */
@Service
public class FermentationTemperatureServiceImpl extends ServiceImpl<FermentationTemperatureMapper, FermentationTemperature> implements FermentationTemperatureService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addTemperatureRecord(TemperatureDataDTO temperatureDataDTO) {
        FermentationTemperature temperature = new FermentationTemperature();
        BeanUtils.copyProperties(temperatureDataDTO, temperature);
        temperature.setId(null);
        temperature.setCreateTime(LocalDateTime.now());
        return save(temperature);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchAddTemperatureRecords(List<TemperatureDataDTO> temperatureDataDTOList) {
        List<FermentationTemperature> temperatureList = new ArrayList<>();
        for (TemperatureDataDTO dto : temperatureDataDTOList) {
            FermentationTemperature temperature = new FermentationTemperature();
            BeanUtils.copyProperties(dto, temperature);
            temperature.setId(null);
            temperature.setCreateTime(LocalDateTime.now());
            temperatureList.add(temperature);
        }
        return saveBatch(temperatureList);
    }

    @Override
    public List<FermentationTemperature> getTemperatureCurve(Long batchId) {
        LambdaQueryWrapper<FermentationTemperature> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FermentationTemperature::getBatchId, batchId)
                .orderByAsc(FermentationTemperature::getRecordTime);
        return list(wrapper);
    }

    @Override
    public List<FermentationTemperature> getTemperatureByTimeRange(Long batchId, LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<FermentationTemperature> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FermentationTemperature::getBatchId, batchId)
                .ge(FermentationTemperature::getRecordTime, startTime)
                .le(FermentationTemperature::getRecordTime, endTime)
                .orderByAsc(FermentationTemperature::getRecordTime);
        return list(wrapper);
    }
}
