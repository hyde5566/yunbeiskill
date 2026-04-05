package com.yunbei.skill.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunbei.skill.entity.SkillVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SkillVersionMapper extends BaseMapper<SkillVersion> {

    @Select("SELECT * FROM skill_version WHERE skill_id = #{skillId} ORDER BY create_time DESC")
    List<SkillVersion> selectBySkillId(@Param("skillId") Long skillId);
}