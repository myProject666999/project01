package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SysUserServiceImpl implements SysUserService {

    @Autowired
    private SysUserRepository sysUserRepository;

    @Override
    public Result<Map<String, Object>> login(String username, String password) {
        Optional<SysUser> userOpt = sysUserRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return Result.error("用户名或密码错误");
        }
        SysUser user = userOpt.get();
        if (!password.equals(user.getPassword())) {
            return Result.error("用户名或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() != 1) {
            return Result.error("账号已被禁用");
        }
        String token = UUID.randomUUID().toString().replace("-", "");
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        user.setPassword(null);
        data.put("user", user);
        return Result.success(data);
    }

    @Override
    public SysUser findById(Long id) {
        return sysUserRepository.findById(id).orElse(null);
    }

    @Override
    public List<SysUser> findAll() {
        return sysUserRepository.findAll();
    }

    @Override
    public List<SysUser> findByRole(String role) {
        return sysUserRepository.findByRole(role);
    }

    @Override
    @Transactional
    public SysUser save(SysUser user) {
        return sysUserRepository.save(user);
    }
}
