package com.fishery.fryrelease.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.entity.ReleasePlan;
import org.apache.ibatis.annotations.Param;

public interface ReleasePlanMapper extends BaseMapper<ReleasePlan> {
    IPage<ReleasePlan> selectPlanPage(Page<ReleasePlan> page,
                                      @Param("areaId") Long areaId,
                                      @Param("speciesId") Long speciesId,
                                      @Param("planYear") Integer planYear,
                                      @Param("status") String status);
}
