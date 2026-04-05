package com.yunbei.skill.dto;

import lombok.Data;
import java.util.List;

@Data
public class SkillDTO {
    private Long id;
    private String skillName;
    private String skillCode;
    private Long categoryId;
    private String description;
    private String inputExample;
    private String outputExample;
    private String author;
    private String version;
    private Integer status;

    // 新增字段
    private Integer type;
    private Long deptId;
    private Integer sourceType;
    private String sourceDesc;
    private String sourceLink;
    private String tutorialUrl;
    private String filePath;
    private List<String> screenshots;
    private Integer visibility;
    private Integer needAuth;
    private Long authApproverId;
    private List<Long> projectIds;
}