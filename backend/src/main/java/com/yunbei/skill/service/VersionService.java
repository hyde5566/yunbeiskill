package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunbei.skill.dto.VersionDTO;
import com.yunbei.skill.entity.Skill;
import com.yunbei.skill.entity.SkillVersion;
import com.yunbei.skill.mapper.SkillMapper;
import com.yunbei.skill.mapper.SkillVersionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VersionService {

    private final SkillVersionMapper versionMapper;
    private final SkillMapper skillMapper;

    public List<SkillVersion> listBySkillId(Long skillId) {
        return versionMapper.selectBySkillId(skillId);
    }

    public SkillVersion getById(Long id) {
        return versionMapper.selectById(id);
    }

    @Transactional
    public void createVersion(VersionDTO dto, Long userId) {
        Skill skill = skillMapper.selectById(dto.getSkillId());
        if (skill == null) {
            throw new RuntimeException("Skill不存在");
        }

        // 创建版本记录
        SkillVersion version = new SkillVersion();
        version.setSkillId(dto.getSkillId());
        version.setVersion(dto.getVersion());
        version.setChangeLog(dto.getChangeLog());
        version.setContent(dto.getContent());
        version.setCreateBy(userId);
        versionMapper.insert(version);

        // 更新Skill的版本号
        skill.setVersion(dto.getVersion());
        skillMapper.updateById(skill);
    }

    @Transactional
    public void deleteVersion(Long id) {
        versionMapper.deleteById(id);
    }

    @Transactional
    public void rollbackToVersion(Long skillId, Long versionId, Long userId) {
        SkillVersion targetVersion = versionMapper.selectById(versionId);
        if (targetVersion == null || !targetVersion.getSkillId().equals(skillId)) {
            throw new RuntimeException("版本不存在");
        }

        Skill skill = skillMapper.selectById(skillId);
        if (skill == null) {
            throw new RuntimeException("Skill不存在");
        }

        // 创建一个新版本记录作为回滚
        SkillVersion newVersion = new SkillVersion();
        newVersion.setSkillId(skillId);
        newVersion.setVersion(incrementVersion(skill.getVersion()));
        newVersion.setChangeLog("回滚到版本 " + targetVersion.getVersion());
        newVersion.setContent(targetVersion.getContent());
        newVersion.setCreateBy(userId);
        versionMapper.insert(newVersion);

        // 更新Skill版本号
        skill.setVersion(newVersion.getVersion());
        skillMapper.updateById(skill);
    }

    private String incrementVersion(String version) {
        try {
            String[] parts = version.split("\\.");
            int patch = Integer.parseInt(parts[parts.length - 1]) + 1;
            parts[parts.length - 1] = String.valueOf(patch);
            return String.join(".", parts);
        } catch (Exception e) {
            return version + ".1";
        }
    }
}