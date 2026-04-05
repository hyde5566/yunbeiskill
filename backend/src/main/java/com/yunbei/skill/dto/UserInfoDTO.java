package com.yunbei.skill.dto;

import lombok.Data;

@Data
public class UserInfoDTO {
    private Long id;
    private String username;
    private String realName;
    private String phone;
    private String email;
    private String avatar;
    private String token;
}