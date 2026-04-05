package com.yunbei.skill.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunbei.skill.entity.Skill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SkillMapper extends BaseMapper<Skill> {

    @Select("SELECT t.tag_name FROM skill_tag t " +
            "INNER JOIN skill_tag_relation r ON t.id = r.tag_id " +
            "WHERE r.skill_id = #{skillId}")
    List<String> selectTagNamesBySkillId(@Param("skillId") Long skillId);
}