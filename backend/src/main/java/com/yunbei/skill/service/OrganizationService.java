package com.yunbei.skill.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunbei.skill.dto.OrganizationDTO;
import com.yunbei.skill.entity.SysOrganization;
import com.yunbei.skill.mapper.SysOrganizationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final SysOrganizationMapper organizationMapper;

    public List<SysOrganization> listAll() {
        return organizationMapper.selectList(
                new LambdaQueryWrapper<SysOrganization>()
                        .orderByAsc(SysOrganization::getSortOrder)
        );
    }

    public List<SysOrganization> listByParentId(Long parentId) {
        return organizationMapper.selectList(
                new LambdaQueryWrapper<SysOrganization>()
                        .eq(SysOrganization::getParentId, parentId)
                        .orderByAsc(SysOrganization::getSortOrder)
        );
    }

    public SysOrganization getById(Long id) {
        return organizationMapper.selectById(id);
    }

    @Transactional
    public void create(OrganizationDTO dto) {
        SysOrganization org = new SysOrganization();
        org.setOrgName(dto.getOrgName());
        org.setOrgCode(dto.getOrgCode());
        org.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        org.setOrgType(dto.getOrgType() != null ? dto.getOrgType() : 1);
        org.setLeader(dto.getLeader());
        org.setPhone(dto.getPhone());
        org.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        org.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        organizationMapper.insert(org);
    }

    @Transactional
    public void update(OrganizationDTO dto) {
        SysOrganization org = organizationMapper.selectById(dto.getId());
        if (org == null) {
            throw new RuntimeException("组织不存在");
        }
        org.setOrgName(dto.getOrgName());
        org.setOrgCode(dto.getOrgCode());
        org.setParentId(dto.getParentId());
        org.setOrgType(dto.getOrgType());
        org.setLeader(dto.getLeader());
        org.setPhone(dto.getPhone());
        org.setSortOrder(dto.getSortOrder());
        org.setStatus(dto.getStatus());
        organizationMapper.updateById(org);
    }

    @Transactional
    public void delete(Long id) {
        organizationMapper.delete(
                new LambdaQueryWrapper<SysOrganization>().eq(SysOrganization::getParentId, id)
        );
        organizationMapper.deleteById(id);
    }
}