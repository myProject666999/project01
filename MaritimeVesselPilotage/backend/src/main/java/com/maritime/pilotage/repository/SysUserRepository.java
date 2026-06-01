package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.SysUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SysUserRepository extends JpaRepository<SysUser, Long> {

    Optional<SysUser> findByUsername(String username);

    List<SysUser> findByRole(Integer role);

    List<SysUser> findByStatus(Integer status);

    List<SysUser> findByRoleAndStatus(Integer role, Integer status);

    List<SysUser> findByRealNameContaining(String realName);

    List<SysUser> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<SysUser> findByLastLoginTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT su FROM SysUser su WHERE su.status = :status ORDER BY su.createdAt DESC")
    List<SysUser> findActiveUsersOrderByCreatedAt(@Param("status") Integer status);

    @Query("SELECT su FROM SysUser su WHERE su.lastLoginTime >= :since AND su.status = 1")
    List<SysUser> findRecentlyActiveUsers(@Param("since") LocalDateTime since);

    @Query("SELECT su FROM SysUser su WHERE su.createdAt >= :startDate AND su.createdAt <= :endDate")
    List<SysUser> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(su) FROM SysUser su WHERE su.status = :status")
    Long countByStatus(@Param("status") Integer status);

    @Query("SELECT COUNT(su) FROM SysUser su WHERE su.role = :role")
    Long countByRole(@Param("role") Integer role);

    boolean existsByUsername(String username);
}
