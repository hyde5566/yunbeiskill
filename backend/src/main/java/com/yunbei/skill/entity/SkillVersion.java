package com.yunbei.skill.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("skill_version")
public class SkillVersion {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long skillId;

    private String version;

    private String changeLog;

    private String content;

    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}