package com.yunbei.skill.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String realName;
    private String phone;
    private String email;
    private String avatar;
    private Integer status;
    private List<Long> roleIds;
}