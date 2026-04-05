package com.yunbei.skill.controller;

import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.PermissionDTO;
import com.yunbei.skill.entity.SysPermission;
import com.yunbei.skill.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permission")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/list")
    public Result<List<SysPermission>> listAll() {
        return Result.success(permissionService.listAll());
    }

    @GetMapping("/tree")
    public Result<List<SysPermission>> getTree() {
        List<SysPermission> all = permissionService.listAll();
        // 构建树形结构
        List<SysPermission> tree = buildTree(all, 0L);
        return Result.success(tree);
    }

    private List<SysPermission> buildTree(List<SysPermission> all, Long parentId) {
        return all.stream()
                .filter(p -> p.getParentId().equals(parentId))
                .peek(p -> {
                    List<SysPermission> children = buildTree(all, p.getId());
                    // 可以添加children属性，需要扩展实体类
                })
                .toList();
    }

    @GetMapping("/{id}")
    public Result<SysPermission> getById(@PathVariable Long id) {
        return Result.success(permissionService.getById(id));
    }

    @PostMapping
    public Result<Void> create(@RequestBody PermissionDTO dto) {
        permissionService.create(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody PermissionDTO dto) {
        permissionService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return Result.success();
    }
}