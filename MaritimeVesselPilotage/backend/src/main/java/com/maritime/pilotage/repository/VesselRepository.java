package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.Vessel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VesselRepository extends JpaRepository<Vessel, Long> {

    Optional<Vessel> findByImoNumber(String imoNumber);

    List<Vessel> findByVesselNameContaining(String vesselName);

    List<Vessel> findByVesselType(String vesselType);

    List<Vessel> findByVesselLevel(Integer vesselLevel);

    List<Vessel> findByFlag(String flag);

    List<Vessel> findByVesselLevelAndVesselType(Integer vesselLevel, String vesselType);

    List<Vessel> findByNetTonnageBetween(BigDecimal minTonnage, BigDecimal maxTonnage);

    List<Vessel> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT v FROM Vessel v WHERE v.vesselName LIKE %:keyword% OR v.imoNumber LIKE %:keyword% OR v.callSign LIKE %:keyword%")
    List<Vessel> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT v FROM Vessel v WHERE v.vesselLevel = :level ORDER BY v.netTonnage DESC")
    List<Vessel> findByLevelOrderByTonnageDesc(@Param("level") Integer level);

    @Query("SELECT v FROM Vessel v WHERE v.maximumDraft <= :maxDraft AND v.vesselLevel <= :maxLevel")
    List<Vessel> findVesselsByDraftAndLevelLimits(
            @Param("maxDraft") BigDecimal maxDraft,
            @Param("maxLevel") Integer maxLevel);

    @Query("SELECT v FROM Vessel v WHERE v.createdAt >= :startDate AND v.createdAt <= :endDate")
    List<Vessel> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT v FROM Vessel v WHERE v.netTonnage >= :minTonnage AND v.netTonnage <= :maxTonnage AND v.vesselType = :vesselType")
    List<Vessel> findByTonnageRangeAndType(
            @Param("minTonnage") BigDecimal minTonnage,
            @Param("maxTonnage") BigDecimal maxTonnage,
            @Param("vesselType") String vesselType);

    @Query("SELECT COUNT(v) FROM Vessel v WHERE v.vesselLevel = :level")
    Long countByVesselLevel(@Param("level") Integer level);

    @Query("SELECT COUNT(v) FROM Vessel v WHERE v.vesselType = :vesselType")
    Long countByVesselType(@Param("vesselType") String vesselType);

    boolean existsByImoNumber(String imoNumber);
}
