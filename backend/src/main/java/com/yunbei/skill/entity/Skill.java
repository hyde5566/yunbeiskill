package com.yunbei.skill.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("skill")
public class Skill {
    @TableId(type = IdType.AUTO)
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

    private Integer viewCount;

    private Integer useCount;

    private Long createBy;

    // 新增字段
    private Integer type;

    private Long deptId;

    private Integer sourceType;

    private String sourceDesc;

    private String sourceLink;

    private String tutorialUrl;

    private String filePath;

    private String screenshots;

    private Integer visibility;

    private Integer needAuth;

    private Long authApproverId;

    private Integer isFeatured;

    private Integer downloadCount;

    private BigDecimal avgRating;

    private String rejectReason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}