package com.ptod.controller;

import com.ptod.dto.ApiResponse;
import com.ptod.dto.LoginRequest;
import com.ptod.dto.LoginResponse;
import com.ptod.dto.RegisterRequest;
import com.ptod.dto.UserDTO;
import com.ptod.entity.User;
import com.ptod.service.JwtService;
import com.ptod.service.UserService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ApiResponse<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO userDTO = userService.register(request);
        return ApiResponse.success("注册成功", userDTO);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generateToken(userDetails);

        UserDTO userDTO = userService.getUserByUsername(request.getUsername());
        LoginResponse response = new LoginResponse(token, "Bearer", userDTO);

        return ApiResponse.success("登录成功", response);
    }

    @GetMapping("/me")
    public ApiResponse<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDTO userDTO = userService.getUserByUsername(username);
        return ApiResponse.success(userDTO);
    }
}
