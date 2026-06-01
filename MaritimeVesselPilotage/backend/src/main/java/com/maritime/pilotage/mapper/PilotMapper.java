package com.maritime.pilotage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.maritime.pilotage.entity.Pilot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PilotMapper extends BaseMapper<Pilot> {

    @Select("SELECT * FROM pilot WHERE pilot_level >= #{requiredLevel} AND status = 1 " +
            "ORDER BY pilot_level DESC, total_pilotage_count ASC")
    List<Pilot> findQualifiedPilots(@Param("requiredLevel") Integer requiredLevel);

    @Select("SELECT p.* FROM pilot p WHERE p.status = 1 AND p.id NOT IN " +
            "(SELECT DISTINCT pilot_id FROM pilot_schedule WHERE schedule_date = #{date} AND status = 1) " +
            "ORDER BY p.pilot_level DESC")
    List<Pilot> findAvailablePilotsForDate(@Param("date") java.time.LocalDate date);

    @Select("SELECT COUNT(*) FROM pilotage_assignment WHERE pilot_id = #{pilotId} " +
            "AND status IN (1, 2) AND planned_pilotage_time BETWEEN #{startTime} AND #{endTime}")
    Integer countAssignmentsInRange(@Param("pilotId") Long pilotId,
                                    @Param("startTime") LocalDateTime startTime,
                                    @Param("endTime") LocalDateTime endTime);
}
