package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunbei.skill.dto.PageDTO;
import com.yunbei.skill.dto.UserDTO;
import com.yunbei.skill.dto.UserVO;
import com.yunbei.skill.entity.SysUser;
import com.yunbei.skill.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SysUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<UserVO> list(PageDTO pageDTO) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(pageDTO.getKeyword())) {
            wrapper.like(SysUser::getUsername, pageDTO.getKeyword())
                    .or().like(SysUser::getRealName, pageDTO.getKeyword());
        }
        wrapper.orderByDesc(SysUser::getCreateTime);
        Page<SysUser> userPage = userMapper.selectPage(new Page<>(pageDTO.getPage(), pageDTO.getPageSize()), wrapper);

        // 转换为 UserVO 并填充角色名称
        Page<UserVO> voPage = new Page<>(userPage.getCurrent(), userPage.getSize(), userPage.getTotal());
        List<UserVO> voList = userPage.getRecords().stream().map(user -> {
            UserVO vo = new UserVO();
            vo.setId(user.getId());
            vo.setUsername(user.getUsername());
            vo.setRealName(user.getRealName());
            vo.setPhone(user.getPhone());
            vo.setEmail(user.getEmail());
            vo.setAvatar(user.getAvatar());
            vo.setStatus(user.getStatus());
            vo.setCreateTime(user.getCreateTime());
            vo.setUpdateTime(user.getUpdateTime());
            // 查询用户角色名称
            List<String> roleNames = userMapper.selectRoleNamesByUserId(user.getId());
            vo.setRoleNames(roleNames);
            return vo;
        }).toList();
        voPage.setRecords(voList);
        return voPage;
    }

    public SysUser getById(Long id) {
        return userMapper.selectById(id);
    }

    public List<Long> getRoleIds(Long userId) {
        return userMapper.selectRoleIdsByUserId(userId);
    }

    @Transactional
    public void create(UserDTO dto) {
        SysUser user = new SysUser();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setAvatar(dto.getAvatar());
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        userMapper.insert(user);
    }

    @Transactional
    public void update(UserDTO dto) {
        SysUser user = userMapper.selectById(dto.getId());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setAvatar(dto.getAvatar());
        user.setStatus(dto.getStatus());
        if (StringUtils.hasText(dto.getPassword())) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        userMapper.updateById(user);
    }

    @Transactional
    public void delete(Long id) {
        userMapper.deleteById(id);
    }

    @Transactional
    public void assignRoles(Long userId, List<Long> roleIds) {
        // 先删除旧角色关联
        userMapper.deleteUserRoleByUserId(userId);
        // 再插入新角色关联
        if (roleIds != null && !roleIds.isEmpty()) {
            userMapper.insertUserRoles(userId, roleIds);
        }
    }
}