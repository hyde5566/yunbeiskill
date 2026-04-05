package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunbei.skill.dto.UserInfoDTO;
import com.yunbei.skill.dto.UserPermissionDTO;
import com.yunbei.skill.entity.SysUser;
import com.yunbei.skill.mapper.SysPermissionMapper;
import com.yunbei.skill.mapper.SysUserMapper;
import com.yunbei.skill.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper userMapper;
    private final SysPermissionMapper permissionMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.expiration}")
    private Long expiration;

    public UserPermissionDTO login(String username, String password) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, username).eq(SysUser::getStatus, 1);
        SysUser user = userMapper.selectOne(wrapper);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        String token = jwtUtil.generateToken(username, user.getId());
        redisTemplate.opsForValue().set("token:" + user.getId(), token, expiration, TimeUnit.MILLISECONDS);

        // 获取用户权限
        List<String> permissions = permissionMapper.selectPermissionCodesByUserId(user.getId());

        UserPermissionDTO dto = new UserPermissionDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRealName(user.getRealName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        dto.setToken(token);
        dto.setPermissions(permissions);
        return dto;
    }

    public void logout(Long userId) {
        redisTemplate.delete("token:" + userId);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
        redisTemplate.delete("token:" + userId);
    }

    public UserInfoDTO getCurrentUser(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        UserInfoDTO dto = new UserInfoDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRealName(user.getRealName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        return dto;
    }

    public List<String> getUserPermissions(Long userId) {
        return permissionMapper.selectPermissionCodesByUserId(userId);
    }
}