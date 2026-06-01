package com.maritime.pilotage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.maritime.pilotage.entity.PilotSchedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PilotScheduleMapper extends BaseMapper<PilotSchedule> {

    @Select("SELECT * FROM pilot_schedule WHERE pilot_id = #{pilotId} " +
            "AND schedule_date BETWEEN #{startDate} AND #{endDate} AND status = 1 " +
            "ORDER BY schedule_date, shift_type")
    List<PilotSchedule> findByPilotIdAndDateRange(@Param("pilotId") Long pilotId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    @Select("SELECT * FROM pilot_schedule WHERE pilot_id = #{pilotId} " +
            "AND end_time > #{checkTime} AND status = 1 " +
            "ORDER BY start_time LIMIT 1")
    PilotSchedule findNextScheduleForPilot(@Param("pilotId") Long pilotId,
                                           @Param("checkTime") LocalDateTime checkTime);

    @Select("SELECT * FROM pilot_schedule WHERE pilot_id = #{pilotId} " +
            "AND start_time < #{checkTime} AND status = 1 " +
            "ORDER BY end_time DESC LIMIT 1")
    PilotSchedule findPreviousScheduleForPilot(@Param("pilotId") Long pilotId,
                                               @Param("checkTime") LocalDateTime checkTime);

    @Select("SELECT COUNT(*) FROM pilot_schedule WHERE pilot_id = #{pilotId} " +
            "AND schedule_date IN (#{date1}, #{date2}) AND status = 1")
    Integer countConsecutiveDayShifts(@Param("pilotId") Long pilotId,
                                      @Param("date1") LocalDate date1,
                                      @Param("date2") LocalDate date2);
}
