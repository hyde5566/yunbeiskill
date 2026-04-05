package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunbei.skill.dto.PageDTO;
import com.yunbei.skill.dto.RoleDTO;
import com.yunbei.skill.entity.SysRole;
import com.yunbei.skill.mapper.SysRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final SysRoleMapper roleMapper;

    public Page<SysRole> list(PageDTO pageDTO) {
        LambdaQueryWrapper<SysRole> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(pageDTO.getKeyword())) {
            wrapper.like(SysRole::getRoleName, pageDTO.getKeyword())
                    .or().like(SysRole::getRoleCode, pageDTO.getKeyword());
        }
        wrapper.orderByDesc(SysRole::getCreateTime);
        return roleMapper.selectPage(new Page<>(pageDTO.getPage(), pageDTO.getPageSize()), wrapper);
    }

    public List<SysRole> listAll() {
        return roleMapper.selectList(new LambdaQueryWrapper<SysRole>().eq(SysRole::getStatus, 1));
    }

    public SysRole getById(Long id) {
        return roleMapper.selectById(id);
    }

    public List<Long> getPermissionIds(Long roleId) {
        return roleMapper.selectPermissionIdsByRoleId(roleId);
    }

    @Transactional
    public void create(RoleDTO dto) {
        SysRole role = new SysRole();
        role.setRoleName(dto.getRoleName());
        role.setRoleCode(dto.getRoleCode());
        role.setDescription(dto.getDescription());
        role.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        roleMapper.insert(role);
    }

    @Transactional
    public void update(RoleDTO dto) {
        SysRole role = roleMapper.selectById(dto.getId());
        if (role == null) {
            throw new RuntimeException("角色不存在");
        }
        role.setRoleName(dto.getRoleName());
        role.setRoleCode(dto.getRoleCode());
        role.setDescription(dto.getDescription());
        role.setStatus(dto.getStatus());
        roleMapper.updateById(role);
    }

    @Transactional
    public void delete(Long id) {
        roleMapper.deleteById(id);
    }

    @Transactional
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        roleMapper.deleteRolePermissionByRoleId(roleId);
        if (permissionIds != null && !permissionIds.isEmpty()) {
            roleMapper.insertRolePermissions(roleId, permissionIds);
        }
    }
}