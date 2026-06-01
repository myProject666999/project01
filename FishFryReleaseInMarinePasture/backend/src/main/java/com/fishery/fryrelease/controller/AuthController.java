package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.entity.SysUser;
import com.fishery.fryrelease.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<SysUser> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        SysUser user = authService.login(username, password);
        if (user == null) {
            return Result.error(401, "用户名或密码错误");
        }
        return Result.success(user);
    }

    @GetMapping("/current-user")
    public Result<SysUser> getCurrentUser(@RequestParam Long userId) {
        SysUser user = authService.getCurrentUser(userId);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(user);
    }
}
