package com.yunbei.skill.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunbei.skill.entity.SkillTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;

@Mapper
public interface SkillTagMapper extends BaseMapper<SkillTag> {

    @Delete("DELETE FROM skill_tag_relation WHERE skill_id = #{skillId}")
    void deleteSkillTagRelation(@Param("skillId") Long skillId);

    @Insert("INSERT INTO skill_tag_relation (skill_id, tag_id) VALUES (#{skillId}, #{tagId})")
    void insertSkillTagRelation(@Param("skillId") Long skillId, @Param("tagId") Long tagId);
}