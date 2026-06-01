package com.fishery.fryrelease.service.impl;

import cn.hutool.crypto.digest.DigestUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishery.fryrelease.entity.SysUser;
import com.fishery.fryrelease.mapper.SysUserMapper;
import com.fishery.fryrelease.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Override
    public SysUser login(String username, String password) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, username);
        SysUser user = sysUserMapper.selectOne(wrapper);
        if (user == null) {
            return null;
        }
        String md5Password = DigestUtil.md5Hex(password);
        if (!md5Password.equals(user.getPassword())) {
            return null;
        }
        user.setPassword(null);
        return user;
    }

    @Override
    public SysUser getCurrentUser(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }
}
