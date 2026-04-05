package com.yunbei.skill.controller;

import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.ChangePasswordDTO;
import com.yunbei.skill.dto.LoginDTO;
import com.yunbei.skill.dto.UserPermissionDTO;
import com.yunbei.skill.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<UserPermissionDTO> login(@Valid @RequestBody LoginDTO dto) {
        UserPermissionDTO user = authService.login(dto.getUsername(), dto.getPassword());
        return Result.success("登录成功", user);
    }

    @PostMapping("/logout")
    public Result<Void> logout(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        authService.logout(userId);
        return Result.success();
    }

    @PostMapping("/change-password")
    public Result<Void> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordDTO dto) {
        Long userId = (Long) authentication.getPrincipal();
        authService.changePassword(userId, dto.getOldPassword(), dto.getNewPassword());
        return Result.success();
    }

    @GetMapping("/permissions")
    public Result<List<String>> getUserPermissions(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(authService.getUserPermissions(userId));
    }
}