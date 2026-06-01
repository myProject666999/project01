package com.fishery.fryrelease.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.entity.Species;
import org.apache.ibatis.annotations.Param;

public interface SpeciesMapper extends BaseMapper<Species> {
    IPage<Species> selectPage(Page<Species> page, @Param("speciesName") String speciesName, @Param("category") String category);
}
