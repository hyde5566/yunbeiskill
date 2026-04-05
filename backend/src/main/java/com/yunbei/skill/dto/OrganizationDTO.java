package com.yunbei.skill.dto;

import lombok.Data;

@Data
public class OrganizationDTO {
    private Long id;
    private String orgName;
    private String orgCode;
    private Long parentId;
    private Integer orgType;
    private String leader;
    private String phone;
    private Integer sortOrder;
    private Integer status;
}