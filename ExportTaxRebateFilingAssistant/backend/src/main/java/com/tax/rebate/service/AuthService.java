package com.tax.rebate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tax.rebate.dto.LoginDTO;
import com.tax.rebate.entity.SysUser;
import com.tax.rebate.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper sysUserMapper;

    public Map<String, Object> login(LoginDTO dto) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, dto.getUsername());
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        if (!dto.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        if (!user.getEnabled()) {
            throw new RuntimeException("用户已被禁用");
        }

        user.setLastLoginAt(LocalDateTime.now());
        sysUserMapper.updateById(user);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("role", user.getRole());
        return result;
    }
}
