package com.yunbei.skill.controller;

import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.OrganizationDTO;
import com.yunbei.skill.entity.SysOrganization;
import com.yunbei.skill.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/list")
    public Result<List<SysOrganization>> listAll() {
        return Result.success(organizationService.listAll());
    }

    @GetMapping("/tree")
    public Result<List<SysOrganization>> getTree() {
        List<SysOrganization> all = organizationService.listAll();
        List<SysOrganization> tree = buildTree(all, 0L);
        return Result.success(tree);
    }

    private List<SysOrganization> buildTree(List<SysOrganization> all, Long parentId) {
        return all.stream()
                .filter(o -> o.getParentId().equals(parentId))
                .toList();
    }

    @GetMapping("/{id}")
    public Result<SysOrganization> getById(@PathVariable Long id) {
        return Result.success(organizationService.getById(id));
    }

    @PostMapping
    public Result<Void> create(@RequestBody OrganizationDTO dto) {
        organizationService.create(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody OrganizationDTO dto) {
        organizationService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        organizationService.delete(id);
        return Result.success();
    }
}