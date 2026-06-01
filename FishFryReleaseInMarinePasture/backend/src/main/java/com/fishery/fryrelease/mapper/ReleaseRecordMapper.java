package com.fishery.fryrelease.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.entity.ReleaseRecord;
import org.apache.ibatis.annotations.Param;

public interface ReleaseRecordMapper extends BaseMapper<ReleaseRecord> {
    IPage<ReleaseRecord> selectRecordPage(Page<ReleaseRecord> page,
                                           @Param("areaId") Long areaId,
                                           @Param("speciesId") Long speciesId,
                                           @Param("startDate") String startDate,
                                           @Param("endDate") String endDate);
}
