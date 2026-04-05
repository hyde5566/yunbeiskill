package com.yunbei.skill;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.yunbei.skill.mapper")
public class SkillApplication {
    public static void main(String[] args) {
        SpringApplication.run(SkillApplication.class, args);
    }
}