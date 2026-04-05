package com.yunbei.skill.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("skill_category")
public class SkillCategory {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private String description;

    private Integer sortOrder;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}