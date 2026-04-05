package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunbei.skill.dto.CategoryDTO;
import com.yunbei.skill.entity.SkillCategory;
import com.yunbei.skill.mapper.SkillCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final SkillCategoryMapper categoryMapper;

    public List<SkillCategory> listAll() {
        return categoryMapper.selectList(
                new LambdaQueryWrapper<SkillCategory>()
                        .orderByAsc(SkillCategory::getSortOrder)
        );
    }

    public SkillCategory getById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Transactional
    public void create(CategoryDTO dto) {
        SkillCategory category = new SkillCategory();
        category.setCategoryName(dto.getCategoryName());
        category.setCategoryCode(dto.getCategoryCode());
        category.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        category.setDescription(dto.getDescription());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        category.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        categoryMapper.insert(category);
    }

    @Transactional
    public void update(CategoryDTO dto) {
        SkillCategory category = categoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        category.setCategoryName(dto.getCategoryName());
        category.setCategoryCode(dto.getCategoryCode());
        category.setParentId(dto.getParentId());
        category.setDescription(dto.getDescription());
        category.setSortOrder(dto.getSortOrder());
        category.setStatus(dto.getStatus());
        categoryMapper.updateById(category);
    }

    @Transactional
    public void delete(Long id) {
        categoryMapper.deleteById(id);
    }
}