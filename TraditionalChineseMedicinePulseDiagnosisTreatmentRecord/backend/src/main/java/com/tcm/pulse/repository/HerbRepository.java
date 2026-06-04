package com.tcm.pulse.repository;

import com.tcm.pulse.entity.Herb;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HerbRepository extends JpaRepository<Herb, Long> {

    Optional<Herb> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT h FROM Herb h WHERE " +
           "(:keyword IS NULL OR h.name LIKE CONCAT('%', :keyword, '%') OR " +
           "h.category LIKE CONCAT('%', :keyword, '%') OR " +
           "h.description LIKE CONCAT('%', :keyword, '%'))")
    Page<Herb> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT h FROM Herb h JOIN h.aliases ha WHERE " +
           "ha.aliasName = :aliasName")
    Optional<Herb> findByAliasName(@Param("aliasName") String aliasName);

    @Query("SELECT h FROM Herb h WHERE " +
           "h.name = :name OR EXISTS (SELECT 1 FROM HerbAlias ha WHERE ha.herbId = h.id AND ha.aliasName = :name)")
    Optional<Herb> findByNameOrAlias(@Param("name") String name);
}
