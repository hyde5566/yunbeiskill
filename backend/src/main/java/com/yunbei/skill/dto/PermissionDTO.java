package com.yunbei.skill.dto;

import lombok.Data;

@Data
public class PermissionDTO {
    private Long id;
    private String permissionName;
    private String permissionCode;
    private String description;
    private String resourceType;
    private Long parentId;
    private String resourcePath;
    private Integer sortOrder;
    private Integer status;
}