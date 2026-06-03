package com.tax.rebate.controller;

import com.tax.rebate.dto.LoginDTO;
import com.tax.rebate.dto.Result;
import com.tax.rebate.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        try {
            return Result.ok(authService.login(dto));
        } catch (Exception e) {
            return Result.fail(401, e.getMessage());
        }
    }
}
