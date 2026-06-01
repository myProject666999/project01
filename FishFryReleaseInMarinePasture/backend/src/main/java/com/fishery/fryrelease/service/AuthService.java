package com.fishery.fryrelease.service;

import com.fishery.fryrelease.entity.SysUser;

public interface AuthService {
    SysUser login(String username, String password);

    SysUser getCurrentUser(Long userId);
}
