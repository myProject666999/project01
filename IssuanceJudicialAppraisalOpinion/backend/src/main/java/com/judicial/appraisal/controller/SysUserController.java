package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.service.SysUserService;
import com.judicial.appraisal.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class SysUserController {

    @Autowired
    private SysUserService sysUserService;

    @GetMapping("/current")
    public Result<SysUser> getCurrentUser() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
        SysUser user = sysUserService.findById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }

    @GetMapping
    public Result<List<SysUser>> getUsers(@RequestParam(required = false) String role) {
        List<SysUser> users;
        if (role != null && !role.isEmpty()) {
            users = sysUserService.findByRole(role);
        } else {
            users = sysUserService.findAll();
        }
        users.forEach(user -> user.setPassword(null));
        return Result.success(users);
    }

    @GetMapping("/{id}")
    public Result<SysUser> getUserById(@PathVariable Long id) {
        SysUser user = sysUserService.findById(id);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }

    @PostMapping
    public Result<SysUser> createUser(@Valid @RequestBody SysUser user) {
        SysUser savedUser = sysUserService.save(user);
        savedUser.setPassword(null);
        return Result.success(savedUser);
    }

    @PutMapping("/{id}")
    public Result<SysUser> updateUser(@PathVariable Long id, @Valid @RequestBody SysUser user) {
        user.setId(id);
        SysUser updatedUser = sysUserService.save(user);
        updatedUser.setPassword(null);
        return Result.success(updatedUser);
    }
}
