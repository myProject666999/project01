package com.ptod.controller;

import com.ptod.dto.ApiResponse;
import com.ptod.dto.UserDTO;
import com.ptod.entity.User;
import com.ptod.service.UserService;
import com.ptod.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SecurityUtil securityUtil;

    @GetMapping("/{id}")
    public ApiResponse<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ApiResponse.success(user);
    }

    @PutMapping("/profile")
    public ApiResponse<UserDTO> updateProfile(@RequestBody UserDTO userDTO) {
        Long userId = securityUtil.getCurrentUserId();
        UserDTO updated = userService.updateUser(userId, userDTO);
        return ApiResponse.success("更新成功", updated);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @RequestParam String oldPassword,
            @RequestParam String newPassword
    ) {
        Long userId = securityUtil.getCurrentUserId();
        userService.changePassword(userId, oldPassword, newPassword);
        return ApiResponse.success("密码修改成功", null);
    }
}
