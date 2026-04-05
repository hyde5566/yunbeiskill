package com.yunbei.skill.dto;

import lombok.Data;

@Data
public class VersionDTO {
    private Long id;
    private Long skillId;
    private String version;
    private String changeLog;
    private String content;
}