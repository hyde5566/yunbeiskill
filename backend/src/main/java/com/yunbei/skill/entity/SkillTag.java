package com.yunbei.skill.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("skill_tag")
public class SkillTag {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String tagName;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}