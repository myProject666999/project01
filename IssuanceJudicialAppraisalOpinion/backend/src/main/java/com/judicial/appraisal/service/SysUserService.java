package com.judicial.appraisal.service;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.SysUser;

import java.util.List;
import java.util.Map;

public interface SysUserService {

    Result<Map<String, Object>> login(String username, String password);

    SysUser findById(Long id);

    List<SysUser> findAll();

    List<SysUser> findByRole(String role);

    SysUser save(SysUser user);
}
