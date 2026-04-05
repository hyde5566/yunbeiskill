package com.yunbei.skill.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunbei.skill.entity.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;

import java.util.List;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    @Select("SELECT p.id FROM sys_permission p " +
            "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id " +
            "WHERE rp.role_id = #{roleId} AND p.deleted = 0")
    List<Long> selectPermissionIdsByRoleId(@Param("roleId") Long roleId);

    @Delete("DELETE FROM sys_role_permission WHERE role_id = #{roleId}")
    void deleteRolePermissionByRoleId(@Param("roleId") Long roleId);

    @Insert("<script>" +
            "INSERT INTO sys_role_permission (role_id, permission_id) VALUES " +
            "<foreach collection='permissionIds' item='permissionId' separator=','>" +
            "(#{roleId}, #{permissionId})" +
            "</foreach>" +
            "</script>")
    void insertRolePermissions(@Param("roleId") Long roleId, @Param("permissionIds") List<Long> permissionIds);
}