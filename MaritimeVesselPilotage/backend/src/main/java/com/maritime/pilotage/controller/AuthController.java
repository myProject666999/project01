package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.entity.SysUser;
import com.maritime.pilotage.repository.SysUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private SysUserRepository sysUserRepository;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        if (username == null || password == null) {
            return Result.error("用户名和密码不能为空");
        }

        Optional<SysUser> userOpt = sysUserRepository.findAll().stream()
                .filter(u -> username.equals(u.getUsername()))
                .findFirst();

        if (!userOpt.isPresent()) {
            return Result.error("用户不存在");
        }

        SysUser user = userOpt.get();
        if (user.getStatus() != 1) {
            return Result.error("用户已被禁用");
        }

        if (!password.equals(user.getPassword())) {
            return Result.error("密码错误");
        }

        user.setLastLoginTime(LocalDateTime.now());
        sysUserRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("token", "dummy-token-" + user.getId() + "-" + System.currentTimeMillis());
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("role", user.getRole());
        result.put("phone", user.getPhone());
        result.put("email", user.getEmail());

        return Result.success("登录成功", result);
    }

    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success("登出成功", null);
    }

    @PostMapping("/register")
    public Result<SysUser> register(@RequestBody SysUser user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            return Result.error("用户名和密码不能为空");
        }

        boolean exists = sysUserRepository.findAll().stream()
                .anyMatch(u -> user.getUsername().equals(u.getUsername()));
        if (exists) {
            return Result.error("用户名已存在");
        }

        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        if (user.getRole() == null) {
            user.setRole(3);
        }

        SysUser saved = sysUserRepository.save(user);
        saved.setPassword(null);
        return Result.success("注册成功", saved);
    }

    @PutMapping("/change-password")
    public Result<Void> changePassword(@RequestBody Map<String, String> passwordData,
                                       @RequestHeader("Authorization") String token) {
        Long userId = Long.parseLong(passwordData.get("userId"));
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");

        if (userId == null || oldPassword == null || newPassword == null) {
            return Result.error("参数不完整");
        }

        Optional<SysUser> userOpt = sysUserRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return Result.error("用户不存在");
        }

        SysUser user = userOpt.get();
        if (!oldPassword.equals(user.getPassword())) {
            return Result.error("原密码错误");
        }

        user.setPassword(newPassword);
        sysUserRepository.save(user);

        return Result.success("密码修改成功", null);
    }

    @GetMapping("/user/{id}")
    public Result<SysUser> getUserById(@PathVariable Long id) {
        Optional<SysUser> user = sysUserRepository.findById(id);
        if (user.isPresent()) {
            SysUser u = user.get();
            u.setPassword(null);
            return Result.success(u);
        }
        return Result.error("用户不存在");
    }

    @GetMapping("/users")
    public Result<List<SysUser>> listUsers() {
        List<SysUser> list = sysUserRepository.findAll();
        list.forEach(u -> u.setPassword(null));
        return Result.success(list);
    }

    @PostMapping("/user")
    public Result<SysUser> createUser(@RequestBody SysUser user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            return Result.error("用户名和密码不能为空");
        }

        boolean exists = sysUserRepository.findAll().stream()
                .anyMatch(u -> user.getUsername().equals(u.getUsername()));
        if (exists) {
            return Result.error("用户名已存在");
        }

        if (user.getStatus() == null) {
            user.setStatus(1);
        }

        SysUser saved = sysUserRepository.save(user);
        saved.setPassword(null);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/user/{id}")
    public Result<SysUser> updateUser(@PathVariable Long id, @RequestBody SysUser user) {
        if (!sysUserRepository.existsById(id)) {
            return Result.error("用户不存在");
        }

        user.setId(id);
        if (user.getPassword() == null) {
            Optional<SysUser> existing = sysUserRepository.findById(id);
            existing.ifPresent(u -> user.setPassword(u.getPassword()));
        }

        SysUser updated = sysUserRepository.save(user);
        updated.setPassword(null);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/user/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        if (!sysUserRepository.existsById(id)) {
            return Result.error("用户不存在");
        }
        sysUserRepository.deleteById(id);
        return Result.success("删除成功", null);
    }
}
