package com.maritime.pilotage.service;

import com.maritime.pilotage.entity.SysUser;

import java.util.List;
import java.util.Optional;

public interface SysUserService {

    SysUser save(SysUser sysUser);

    Optional<SysUser> findById(Long id);

    List<SysUser> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    long count();
}
