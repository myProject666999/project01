package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.security.JwtTokenUtil;
import com.judicial.appraisal.security.LoginUser;
import com.judicial.appraisal.service.SysUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class SysUserServiceImpl implements SysUserService {

    @Autowired
    private SysUserRepository sysUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public Result<Map<String, Object>> login(String username, String password) {
        try {
            log.info("用户登录开始: username={}", username);
            Optional<SysUser> userOpt = sysUserRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                log.warn("用户不存在: username={}", username);
                return Result.error("用户名或密码错误");
            }
            SysUser user = userOpt.get();
            log.info("找到用户: username={}, passwordHash={}", username, user.getPassword());

            boolean passwordMatch = passwordEncoder.matches(password, user.getPassword());
            log.info("密码验证结果: {}", passwordMatch);

            if (!passwordMatch) {
                log.warn("密码错误: username={}", username);
                return Result.error("用户名或密码错误");
            }
            if (user.getStatus() != null && user.getStatus() != 1) {
                log.warn("账号已禁用: username={}", username);
                return Result.error("账号已被禁用");
            }

            LoginUser loginUser = new LoginUser(user.getId(), user.getUsername(), user.getRealName(),
                    user.getRole(), user.getPassword());
            log.info("准备生成JWT token: loginUser={}", loginUser.getUsername());
            String token = jwtTokenUtil.generateToken(loginUser);
            String tokenPreview = token.substring(0, Math.min(20, token.length())) + "...";
            log.info("JWT token生成成功: token={}", tokenPreview);

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            user.setPassword(null);
            data.put("user", user);
            log.info("用户登录成功: username={}", username);
            return Result.success(data);
        } catch (Exception e) {
            log.error("用户登录异常: username={}", username, e);
            return Result.error("登录失败: " + e.getMessage());
        }
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
