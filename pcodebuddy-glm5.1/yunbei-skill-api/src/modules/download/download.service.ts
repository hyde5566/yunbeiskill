import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DownloadRecord } from './entities/download-record.entity'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class DownloadService {
  constructor(
    @InjectRepository(DownloadRecord)
    private downloadRepository: Repository<DownloadRecord>,
  ) {}

  async recordDownload(userId: number, skillId: number, versionId: number, departmentId: number) {
    const record = this.downloadRepository.create({
      user_id: userId,
      skill_id: skillId,
      version_id: versionId,
      department_id: departmentId,
    })
    return this.downloadRepository.save(record)
  }

  // 我的下载skill列表（去重，每个skill只显示一条最新）
  async getMyDownloadedSkills(userId: number, pagination: PaginationDto) {
    const query = this.downloadRepository
      .createQueryBuilder('dr')
      .leftJoinAndSelect('dr.skill', 'skill')
      .leftJoinAndSelect('dr.version', 'version')
      .where('dr.user_id = :userId', { userId })

    const [list, total] = await query
      .distinctOn(['dr.skill_id'])
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('dr.skill_id', 'ASC')
      .addOrderBy('dr.downloaded_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  // 我的下载记录详情
  async getMyDownloadRecords(userId: number, pagination: PaginationDto, skillName?: string) {
    const query = this.downloadRepository
      .createQueryBuilder('dr')
      .leftJoinAndSelect('dr.skill', 'skill')
      .leftJoinAndSelect('dr.version', 'version')
      .leftJoinAndSelect('dr.department', 'department')
      .where('dr.user_id = :userId', { userId })

    if (skillName) {
      query.andWhere('skill.name LIKE :name', { name: `%${skillName}%` })
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('dr.downloaded_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  // 全局下载统计
  async getGlobalStats() {
    const totalDownloads = await this.downloadRepository.count()

    const skillStats = await this.downloadRepository
      .createQueryBuilder('dr')
      .select('dr.skill_id', 'skill_id')
      .addSelect('COUNT(*)', 'download_count')
      .groupBy('dr.skill_id')
      .orderBy('download_count', 'DESC')
      .limit(10)
      .getRawMany()

    return {
      total_downloads: totalDownloads,
      top_skills: skillStats,
    }
  }
}
