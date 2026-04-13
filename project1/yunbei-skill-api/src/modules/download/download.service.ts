import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DownloadRecord } from './entities/download-record.entity'
import { CreateDownloadDto } from './dto/create-download.dto'
import { SkillVersion } from '../skill/entities/skill-version.entity'

@Injectable()
export class DownloadService {
  constructor(
    @InjectRepository(DownloadRecord)
    private downloadRepo: Repository<DownloadRecord>,
    @InjectRepository(SkillVersion)
    private versionRepo: Repository<SkillVersion>
  ) {}

  // 记录下载并返回下载信息
  async recordDownload(dto: CreateDownloadDto, userId: number, departmentId: number): Promise<{ downloadUrl: string; zipPath: string }> {
    // 验证版本存在且已发布
    const version = await this.versionRepo.findOne({
      where: { id: dto.versionId, skillId: dto.skillId }
    })
    if (!version) {
      throw new NotFoundException('版本不存在')
    }
    if (version.status !== 'published') {
      throw new NotFoundException('该版本尚未发布')
    }

    // 记录下载
    const record = this.downloadRepo.create({
      userId,
      skillId: dto.skillId,
      versionId: dto.versionId,
      departmentId
    })
    await this.downloadRepo.save(record)

    // 返回下载信息（实际项目中需要OSS签名URL）
    return {
      downloadUrl: `/downloads/${dto.skillId}/${dto.versionId}`, // 实际应为OSS签名URL
      zipPath: version.zipPath
    }
  }

  // 获取用户下载历史
  async getUserDownloads(userId: number, page: number = 1, pageSize: number = 20) {
    const qb = this.downloadRepo.createQueryBuilder('download')
      .leftJoinAndSelect('download.skill', 'skill')
      .leftJoinAndSelect('download.version', 'version')
      .leftJoinAndSelect('skill.category', 'category')
      .where('download.userId = :userId', { userId })
      .orderBy('download.downloadedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }

  // 获取Skill的下载统计
  async getSkillDownloadStats(skillId: number): Promise<{ total: number; recentWeek: number }> {
    const total = await this.downloadRepo.count({ where: { skillId } })

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentWeek = await this.downloadRepo
      .createQueryBuilder('download')
      .where('download.skillId = :skillId', { skillId })
      .andWhere('download.downloadedAt >= :weekAgo', { weekAgo })
      .getCount()

    return { total, recentWeek }
  }
}