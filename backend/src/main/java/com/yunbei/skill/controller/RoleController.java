package com.yunbei.skill.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.PageDTO;
import com.yunbei.skill.dto.RoleDTO;
import com.yunbei.skill.entity.SysRole;
import com.yunbei.skill.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping("/list")
    public Result<Page<SysRole>> list(PageDTO pageDTO) {
        return Result.success(roleService.list(pageDTO));
    }

    @GetMapping("/all")
    public Result<List<SysRole>> listAll() {
        return Result.success(roleService.listAll());
    }

    @GetMapping("/{id}")
    public Result<SysRole> getById(@PathVariable Long id) {
        return Result.success(roleService.getById(id));
    }

    @GetMapping("/{id}/permissions")
    public Result<List<Long>> getRolePermissions(@PathVariable Long id) {
        return Result.success(roleService.getPermissionIds(id));
    }

    @PostMapping
    public Result<Void> create(@RequestBody RoleDTO dto) {
        roleService.create(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody RoleDTO dto) {
        roleService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/permissions")
    public Result<Void> assignPermissions(@PathVariable Long id, @RequestBody List<Long> permissionIds) {
        roleService.assignPermissions(id, permissionIds);
        return Result.success();
    }
}