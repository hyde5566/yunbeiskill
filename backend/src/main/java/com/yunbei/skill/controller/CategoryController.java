package com.yunbei.skill.controller;

import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.CategoryDTO;
import com.yunbei.skill.entity.SkillCategory;
import com.yunbei.skill.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/list")
    public Result<List<SkillCategory>> listAll() {
        return Result.success(categoryService.listAll());
    }

    @GetMapping("/{id}")
    public Result<SkillCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @PostMapping
    public Result<Void> create(@RequestBody CategoryDTO dto) {
        categoryService.create(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody CategoryDTO dto) {
        categoryService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}