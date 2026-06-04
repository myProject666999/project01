package com.tcm.pulse.repository;

import com.tcm.pulse.entity.CompatibilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompatibilityRuleRepository extends JpaRepository<CompatibilityRule, Long> {

    Optional<CompatibilityRule> findByHerbAIdAndHerbBId(Long herbAId, Long herbBId);

    @Query("SELECT cr FROM CompatibilityRule cr WHERE " +
           "(cr.herbAId = :herb1Id AND cr.herbBId = :herb2Id) OR " +
           "(cr.herbAId = :herb2Id AND cr.herbBId = :herb1Id)")
    Optional<CompatibilityRule> findByHerbPair(@Param("herb1Id") Long herb1Id,
                                               @Param("herb2Id") Long herb2Id);

    @Query("SELECT cr FROM CompatibilityRule cr WHERE " +
           "(cr.herbAId IN :herbIds AND cr.herbBId IN :herbIds)")
    List<CompatibilityRule> findConflictsInHerbIds(@Param("herbIds") List<Long> herbIds);

    List<CompatibilityRule> findByRuleType(String ruleType);
}
