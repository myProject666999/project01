package com.maritime.pilotage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.maritime.pilotage.entity.PilotageAssignment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PilotageAssignmentMapper extends BaseMapper<PilotageAssignment> {

    @Select("SELECT * FROM pilotage_assignment WHERE pilot_id = #{pilotId} " +
            "AND status IN (1, 2) AND planned_pilotage_time BETWEEN #{startTime} AND #{endTime} " +
            "ORDER BY planned_pilotage_time")
    List<PilotageAssignment> findByPilotIdAndTimeRange(@Param("pilotId") Long pilotId,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime);

    @Select("SELECT * FROM pilotage_assignment WHERE order_id = #{orderId} AND status != 9 " +
            "ORDER BY created_at DESC")
    List<PilotageAssignment> findByOrderId(@Param("orderId") Long orderId);

    @Select("SELECT COUNT(*) FROM pilotage_assignment WHERE pilot_id = #{pilotId} " +
            "AND status IN (1, 2) AND DATE(planned_pilotage_time) = DATE(#{time})")
    Integer countDailyAssignments(@Param("pilotId") Long pilotId,
                                  @Param("time") LocalDateTime time);
}
