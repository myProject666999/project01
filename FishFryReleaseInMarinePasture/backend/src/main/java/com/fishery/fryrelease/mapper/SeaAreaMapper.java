package com.fishery.fryrelease.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.entity.SeaArea;
import org.apache.ibatis.annotations.Param;

public interface SeaAreaMapper extends BaseMapper<SeaArea> {
    IPage<SeaArea> selectPage(Page<SeaArea> page, @Param("areaName") String areaName);
}
