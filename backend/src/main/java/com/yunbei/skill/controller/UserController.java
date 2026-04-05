package com.yunbei.skill.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunbei.skill.common.Result;
import com.yunbei.skill.dto.PageDTO;
import com.yunbei.skill.dto.UserDTO;
import com.yunbei.skill.dto.UserVO;
import com.yunbei.skill.entity.SysUser;
import com.yunbei.skill.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/list")
    public Result<Page<UserVO>> list(PageDTO pageDTO) {
        return Result.success(userService.list(pageDTO));
    }

    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @GetMapping("/{id}/roles")
    public Result<List<Long>> getUserRoles(@PathVariable Long id) {
        return Result.success(userService.getRoleIds(id));
    }

    @PostMapping
    public Result<Void> create(@RequestBody UserDTO dto) {
        userService.create(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody UserDTO dto) {
        userService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/roles")
    public Result<Void> assignRoles(@PathVariable Long id, @RequestBody List<Long> roleIds) {
        userService.assignRoles(id, roleIds);
        return Result.success();
    }
}