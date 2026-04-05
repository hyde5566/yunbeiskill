package com.yunbei.skill.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SkillVO {
    private Long id;
    private String skillName;
    private String skillCode;
    private Long categoryId;
    private String categoryName;
    private String description;
    private String inputExample;
    private String outputExample;
    private String author;
    private String version;
    private Integer status;
    private Integer viewCount;
    private Integer useCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<String> tags;

    // 新增字段
    private Integer type;
    private Long deptId;
    private String deptName;
    private Integer sourceType;
    private String sourceDesc;
    private String sourceLink;
    private String tutorialUrl;
    private String filePath;
    private List<String> screenshots;
    private Integer visibility;
    private Integer needAuth;
    private Long authApproverId;
    private String authApproverName;
    private Integer isFeatured;
    private Integer downloadCount;
    private BigDecimal avgRating;
    private String rejectReason;
    private List<Long> projectIds;
    private List<String> projectNames;
}