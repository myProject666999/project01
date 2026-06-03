package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.dto.LoginRequest;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.service.SysUserService;
import com.judicial.appraisal.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private SysUserService sysUserService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return sysUserService.login(request.getUsername(), request.getPassword());
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }

    @GetMapping("/user-info")
    public Result<Map<String, Object>> getUserInfo() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
        SysUser user = sysUserService.findById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("username", user.getUsername());
        info.put("realName", user.getRealName());
        info.put("role", user.getRole());
        info.put("name", user.getRealName());
        info.put("roleName", getRoleDisplayName(user.getRole()));
        info.put("phone", user.getPhone());
        info.put("email", user.getEmail());
        info.put("qualificationNo", user.getQualificationNo());
        return Result.success(info);
    }

    @PutMapping("/change-password")
    public Result<Void> changePassword(@RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        if (oldPassword == null || newPassword == null) {
            return Result.error("旧密码和新密码不能为空");
        }
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
        SysUser user = sysUserService.findById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return Result.error("旧密码错误");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        sysUserService.save(user);
        return Result.success();
    }

    private String getRoleDisplayName(String role) {
        switch (role) {
            case "ADMIN": return "管理员";
            case "APPRAISER": return "鉴定人";
            case "REVIEWER1": return "一级复核人";
            case "REVIEWER2": return "二级复核人";
            case "REVIEWER3": return "三级复核人";
            default: return role;
        }
    }
}
