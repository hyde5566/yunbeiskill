package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunbei.skill.dto.PageDTO;
import com.yunbei.skill.dto.SkillDTO;
import com.yunbei.skill.dto.SkillVO;
import com.yunbei.skill.entity.Skill;
import com.yunbei.skill.entity.SkillCategory;
import com.yunbei.skill.entity.SkillTag;
import com.yunbei.skill.mapper.SkillCategoryMapper;
import com.yunbei.skill.mapper.SkillMapper;
import com.yunbei.skill.mapper.SkillTagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillMapper skillMapper;
    private final SkillCategoryMapper categoryMapper;
    private final SkillTagMapper tagMapper;
    private final ObjectMapper objectMapper;

    public Page<SkillVO> list(PageDTO pageDTO, Long categoryId, Integer status, Integer type) {
        LambdaQueryWrapper<Skill> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(pageDTO.getKeyword())) {
            wrapper.and(w -> w.like(Skill::getSkillName, pageDTO.getKeyword())
                    .or().like(Skill::getSkillCode, pageDTO.getKeyword())
                    .or().like(Skill::getDescription, pageDTO.getKeyword()));
        }
        if (categoryId != null) {
            wrapper.eq(Skill::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(Skill::getStatus, status);
        }
        if (type != null) {
            wrapper.eq(Skill::getType, type);
        }
        wrapper.orderByDesc(Skill::getCreateTime);
        Page<Skill> skillPage = skillMapper.selectPage(new Page<>(pageDTO.getPage(), pageDTO.getPageSize()), wrapper);

        List<SkillCategory> categories = categoryMapper.selectList(null);
        Map<Long, String> categoryMap = categories.stream()
                .collect(Collectors.toMap(SkillCategory::getId, SkillCategory::getCategoryName));

        Page<SkillVO> voPage = new Page<>(skillPage.getCurrent(), skillPage.getSize(), skillPage.getTotal());
        List<SkillVO> voList = skillPage.getRecords().stream().map(this::convertToVO).toList();
        voPage.setRecords(voList);
        return voPage;
    }

    public SkillVO getById(Long id) {
        Skill skill = skillMapper.selectById(id);
        if (skill == null) return null;
        return convertToVO(skill);
    }

    private SkillVO convertToVO(Skill skill) {
        SkillVO vo = new SkillVO();
        vo.setId(skill.getId());
        vo.setSkillName(skill.getSkillName());
        vo.setSkillCode(skill.getSkillCode());
        vo.setCategoryId(skill.getCategoryId());
        vo.setDescription(skill.getDescription());
        vo.setInputExample(skill.getInputExample());
        vo.setOutputExample(skill.getOutputExample());
        vo.setAuthor(skill.getAuthor());
        vo.setVersion(skill.getVersion());
        vo.setStatus(skill.getStatus());
        vo.setViewCount(skill.getViewCount());
        vo.setUseCount(skill.getUseCount());
        vo.setCreateTime(skill.getCreateTime());
        vo.setUpdateTime(skill.getUpdateTime());

        // 新增字段
        vo.setType(skill.getType());
        vo.setDeptId(skill.getDeptId());
        vo.setSourceType(skill.getSourceType());
        vo.setSourceDesc(skill.getSourceDesc());
        vo.setSourceLink(skill.getSourceLink());
        vo.setTutorialUrl(skill.getTutorialUrl());
        vo.setFilePath(skill.getFilePath());
        vo.setVisibility(skill.getVisibility());
        vo.setNeedAuth(skill.getNeedAuth());
        vo.setAuthApproverId(skill.getAuthApproverId());
        vo.setIsFeatured(skill.getIsFeatured());
        vo.setDownloadCount(skill.getDownloadCount());
        vo.setAvgRating(skill.getAvgRating());
        vo.setRejectReason(skill.getRejectReason());

        // 分类名称
        SkillCategory category = categoryMapper.selectById(skill.getCategoryId());
        vo.setCategoryName(category != null ? category.getCategoryName() : null);

        // 标签
        vo.setTags(skillMapper.selectTagNamesBySkillId(skill.getId()));

        // 截图解析
        if (StringUtils.hasText(skill.getScreenshots())) {
            try {
                vo.setScreenshots(objectMapper.readValue(skill.getScreenshots(), new TypeReference<List<String>>() {}));
            } catch (Exception ignored) {}
        }

        return vo;
    }

    @Transactional
    public Long create(SkillDTO dto, Long userId) {
        Skill skill = new Skill();
        skill.setSkillName(dto.getSkillName());
        skill.setSkillCode(dto.getSkillCode());
        skill.setCategoryId(dto.getCategoryId());
        skill.setDescription(dto.getDescription());
        skill.setInputExample(dto.getInputExample());
        skill.setOutputExample(dto.getOutputExample());
        skill.setAuthor(dto.getAuthor());
        skill.setVersion(dto.getVersion() != null ? dto.getVersion() : "1.0.0");
        skill.setStatus(dto.getStatus() != null ? dto.getStatus() : 0);
        skill.setCreateBy(userId);

        // 新增字段
        skill.setType(dto.getType() != null ? dto.getType() : 1);
        skill.setDeptId(dto.getDeptId());
        skill.setSourceType(dto.getSourceType() != null ? dto.getSourceType() : 1);
        skill.setSourceDesc(dto.getSourceDesc());
        skill.setSourceLink(dto.getSourceLink());
        skill.setTutorialUrl(dto.getTutorialUrl());
        skill.setFilePath(dto.getFilePath());
        skill.setVisibility(dto.getVisibility() != null ? dto.getVisibility() : 0);
        skill.setNeedAuth(dto.getNeedAuth() != null ? dto.getNeedAuth() : 0);
        skill.setAuthApproverId(dto.getAuthApproverId());

        // 截图序列化
        if (dto.getScreenshots() != null && !dto.getScreenshots().isEmpty()) {
            try {
                skill.setScreenshots(objectMapper.writeValueAsString(dto.getScreenshots()));
            } catch (Exception ignored) {}
        }

        skillMapper.insert(skill);
        return skill.getId();
    }

    @Transactional
    public void update(SkillDTO dto) {
        Skill skill = skillMapper.selectById(dto.getId());
        if (skill == null) {
            throw new RuntimeException("Skill不存在");
        }
        skill.setSkillName(dto.getSkillName());
        skill.setSkillCode(dto.getSkillCode());
        skill.setCategoryId(dto.getCategoryId());
        skill.setDescription(dto.getDescription());
        skill.setInputExample(dto.getInputExample());
        skill.setOutputExample(dto.getOutputExample());
        skill.setAuthor(dto.getAuthor());
        skill.setVersion(dto.getVersion());
        skill.setType(dto.getType());
        skill.setDeptId(dto.getDeptId());
        skill.setSourceType(dto.getSourceType());
        skill.setSourceDesc(dto.getSourceDesc());
        skill.setSourceLink(dto.getSourceLink());
        skill.setTutorialUrl(dto.getTutorialUrl());
        skill.setFilePath(dto.getFilePath());
        skill.setVisibility(dto.getVisibility());
        skill.setNeedAuth(dto.getNeedAuth());
        skill.setAuthApproverId(dto.getAuthApproverId());

        if (dto.getScreenshots() != null) {
            try {
                skill.setScreenshots(objectMapper.writeValueAsString(dto.getScreenshots()));
            } catch (Exception ignored) {}
        }

        skillMapper.updateById(skill);
    }

    @Transactional
    public void delete(Long id) {
        skillMapper.deleteById(id);
    }

    @Transactional
    public void updateTags(Long skillId, List<String> tags) {
        tagMapper.deleteSkillTagRelation(skillId);
        if (tags != null && !tags.isEmpty()) {
            for (String tagName : tags) {
                SkillTag tag = tagMapper.selectOne(
                        new LambdaQueryWrapper<SkillTag>().eq(SkillTag::getTagName, tagName)
                );
                if (tag == null) {
                    tag = new SkillTag();
                    tag.setTagName(tagName);
                    tagMapper.insert(tag);
                }
                tagMapper.insertSkillTagRelation(skillId, tag.getId());
            }
        }
    }

    // 审核相关
    @Transactional
    public void approve(Long id, Long approverId) {
        Skill skill = skillMapper.selectById(id);
        if (skill == null) {
            throw new RuntimeException("Skill不存在");
        }
        skill.setStatus(1);
        skillMapper.updateById(skill);
    }

    @Transactional
    public void reject(Long id, String reason) {
        Skill skill = skillMapper.selectById(id);
        if (skill == null) {
            throw new RuntimeException("Skill不存在");
        }
        skill.setStatus(2);
        skill.setRejectReason(reason);
        skillMapper.updateById(skill);
    }

    @Transactional
    public void offline(Long id, String reason) {
        Skill skill = skillMapper.selectById(id);
        if (skill == null) {
            throw new RuntimeException("Skill不存在");
        }
        skill.setStatus(3);
        skill.setRejectReason(reason);
        skillMapper.updateById(skill);
    }

    @Transactional
    public void incrementDownload(Long id) {
        Skill skill = skillMapper.selectById(id);
        if (skill != null) {
            skill.setDownloadCount(skill.getDownloadCount() + 1);
            skillMapper.updateById(skill);
        }
    }
}