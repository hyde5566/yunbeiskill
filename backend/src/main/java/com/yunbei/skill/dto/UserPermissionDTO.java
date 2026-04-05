package com.yunbei.skill.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserPermissionDTO {
    private Long id;
    private String username;
    private String realName;
    private String phone;
    private String email;
    private String avatar;
    private String token;
    private List<String> permissions;
}