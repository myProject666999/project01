package com.maritime.pilotage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.maritime.pilotage.entity.Tide;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TideMapper extends BaseMapper<Tide> {

    @Select("SELECT * FROM tide WHERE tide_date BETWEEN #{startDate} AND #{endDate} " +
            "AND port = #{port} ORDER BY tide_date, tide_time")
    List<Tide> findByDateRangeAndPort(@Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate,
                                      @Param("port") String port);

    @Select("SELECT * FROM tide WHERE tide_date >= #{date} AND tide_height >= #{minHeight} " +
            "AND port = #{port} ORDER BY tide_date, tide_time LIMIT 50")
    List<Tide> findAvailableTidesAfterDate(@Param("date") LocalDate date,
                                           @Param("minHeight") BigDecimal minHeight,
                                           @Param("port") String port);

    @Select("SELECT MAX(tide_height) FROM tide WHERE tide_date BETWEEN #{startDate} AND #{endDate} " +
            "AND port = #{port}")
    BigDecimal findMaxTideHeightInRange(@Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate,
                                        @Param("port") String port);
}
