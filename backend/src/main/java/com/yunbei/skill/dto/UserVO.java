package com.yunbei.skill.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String realName;
    private String phone;
    private String email;
    private String avatar;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<String> roleNames;
}