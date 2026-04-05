package com.yunbei.skill.controller;

import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.VersionDTO;
import com.yunbei.skill.entity.SkillVersion;
import com.yunbei.skill.service.VersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/version")
@RequiredArgsConstructor
public class VersionController {

    private final VersionService versionService;

    @GetMapping("/skill/{skillId}")
    public Result<List<SkillVersion>> listBySkillId(@PathVariable Long skillId) {
        return Result.success(versionService.listBySkillId(skillId));
    }

    @GetMapping("/{id}")
    public Result<SkillVersion> getById(@PathVariable Long id) {
        return Result.success(versionService.getById(id));
    }

    @PostMapping
    public Result<Void> createVersion(Authentication authentication, @RequestBody VersionDTO dto) {
        Long userId = (Long) authentication.getPrincipal();
        versionService.createVersion(dto, userId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteVersion(@PathVariable Long id) {
        versionService.deleteVersion(id);
        return Result.success();
    }

    @PostMapping("/rollback/{skillId}/{versionId}")
    public Result<Void> rollbackToVersion(
            @PathVariable Long skillId,
            @PathVariable Long versionId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        versionService.rollbackToVersion(skillId, versionId, userId);
        return Result.success();
    }
}