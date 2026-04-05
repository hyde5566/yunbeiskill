package com.yunbei.skill.dto;

import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private String categoryName;
    private String categoryCode;
    private Long parentId;
    private String description;
    private Integer sortOrder;
    private Integer status;
}