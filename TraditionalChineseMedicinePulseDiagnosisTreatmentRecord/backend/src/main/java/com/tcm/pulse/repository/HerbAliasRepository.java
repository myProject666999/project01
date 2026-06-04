package com.tcm.pulse.repository;

import com.tcm.pulse.entity.HerbAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HerbAliasRepository extends JpaRepository<HerbAlias, Long> {

    List<HerbAlias> findByHerbId(Long herbId);

    Optional<HerbAlias> findByHerbIdAndAliasName(Long herbId, String aliasName);

    boolean existsByAliasName(String aliasName);
}
