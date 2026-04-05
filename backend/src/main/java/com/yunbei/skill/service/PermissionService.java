package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunbei.skill.dto.PermissionDTO;
import com.yunbei.skill.entity.SysPermission;
import com.yunbei.skill.mapper.SysPermissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final SysPermissionMapper permissionMapper;

    public List<SysPermission> listAll() {
        return permissionMapper.selectList(
                new LambdaQueryWrapper<SysPermission>()
                        .orderByAsc(SysPermission::getSortOrder)
        );
    }

    public List<SysPermission> listByParentId(Long parentId) {
        return permissionMapper.selectList(
                new LambdaQueryWrapper<SysPermission>()
                        .eq(SysPermission::getParentId, parentId)
                        .orderByAsc(SysPermission::getSortOrder)
        );
    }

    public SysPermission getById(Long id) {
        return permissionMapper.selectById(id);
    }

    @Transactional
    public void create(PermissionDTO dto) {
        SysPermission permission = new SysPermission();
        permission.setPermissionName(dto.getPermissionName());
        permission.setPermissionCode(dto.getPermissionCode());
        permission.setDescription(dto.getDescription());
        permission.setResourceType(dto.getResourceType());
        permission.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        permission.setResourcePath(dto.getResourcePath());
        permission.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        permission.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        permissionMapper.insert(permission);
    }

    @Transactional
    public void update(PermissionDTO dto) {
        SysPermission permission = permissionMapper.selectById(dto.getId());
        if (permission == null) {
            throw new RuntimeException("权限不存在");
        }
        permission.setPermissionName(dto.getPermissionName());
        permission.setPermissionCode(dto.getPermissionCode());
        permission.setDescription(dto.getDescription());
        permission.setResourceType(dto.getResourceType());
        permission.setParentId(dto.getParentId());
        permission.setResourcePath(dto.getResourcePath());
        permission.setSortOrder(dto.getSortOrder());
        permission.setStatus(dto.getStatus());
        permissionMapper.updateById(permission);
    }

    @Transactional
    public void delete(Long id) {
        // 先删除子权限
        permissionMapper.delete(
                new LambdaQueryWrapper<SysPermission>().eq(SysPermission::getParentId, id)
        );
        permissionMapper.deleteById(id);
    }
}