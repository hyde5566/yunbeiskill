package com.yunbei.skill.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.PageDTO;
import com.yunbei.skill.dto.SkillDTO;
import com.yunbei.skill.dto.SkillVO;
import com.yunbei.skill.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skill")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/list")
    public Result<Page<SkillVO>> list(
            PageDTO pageDTO,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer type) {
        return Result.success(skillService.list(pageDTO, categoryId, status, type));
    }

    @GetMapping("/{id}")
    public Result<SkillVO> getById(@PathVariable Long id) {
        return Result.success(skillService.getById(id));
    }

    @PostMapping
    public Result<Long> create(Authentication authentication, @RequestBody SkillDTO dto) {
        Long userId = (Long) authentication.getPrincipal();
        Long skillId = skillService.create(dto, userId);
        return Result.success(skillId);
    }

    @PutMapping
    public Result<Void> update(@RequestBody SkillDTO dto) {
        skillService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        skillService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/tags")
    public Result<Void> updateTags(@PathVariable Long id, @RequestBody List<String> tags) {
        skillService.updateTags(id, tags);
        return Result.success();
    }

    // 审核接口
    @PostMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id, Authentication authentication) {
        Long approverId = (Long) authentication.getPrincipal();
        skillService.approve(id, approverId);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        skillService.reject(id, reason);
        return Result.success();
    }

    @PostMapping("/{id}/offline")
    public Result<Void> offline(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        skillService.offline(id, reason);
        return Result.success();
    }

    @PostMapping("/{id}/download")
    public Result<Void> download(@PathVariable Long id) {
        skillService.incrementDownload(id);
        return Result.success();
    }
}