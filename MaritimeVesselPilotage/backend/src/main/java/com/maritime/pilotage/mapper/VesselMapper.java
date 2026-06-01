package com.maritime.pilotage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.maritime.pilotage.entity.Vessel;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VesselMapper extends BaseMapper<Vessel> {
}
