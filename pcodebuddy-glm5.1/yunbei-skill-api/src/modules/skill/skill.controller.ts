import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger'
import type { Response } from 'express'
import { SkillService } from './skill.service'
import { ProjectService } from '../project/project.service'
import { DownloadService } from '../download/download.service'
import { User } from '../user/entities/user.entity'
import { CreateSkillDto, UpdateSkillDto, SubmitVersionDto, SkillQueryDto } from './dto/skill.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import * as path from 'path'
import * as fs from 'fs'

const uploadDest = process.env.UPLOAD_DEST || './uploads'

@ApiTags('Skill管理')
@ApiBearerAuth()
@Controller('skills')
export class SkillController {
  constructor(
    private readonly skillService: SkillService,
    private readonly projectService: ProjectService,
    private readonly downloadService: DownloadService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取已发布Skill列表（检索中心）' })
  async findPublished(
    @Query() pagination: PaginationDto,
    @Query() query: SkillQueryDto,
    @CurrentUser() user: any,
  ) {
    const userProjectIds = await this.projectService.getUserProjectIds(user.id)
    return this.skillService.findPublished(
      pagination,
      query,
      user.id,
      user.permissions,
      userProjectIds,
    )
  }

  @Get('all')
  @RequirePermission('admin')
  @ApiOperation({ summary: '获取所有Skill列表（管理员）' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query() query: SkillQueryDto,
  ) {
    return this.skillService.findAll(pagination, query)
  }

  @Get('my-submissions')
  @ApiOperation({ summary: '我的提交记录' })
  getMySubmissions(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: any,
  ) {
    return this.skillService.getMySubmissions(pagination, user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Skill详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: '提交新Skill' })
  @UseInterceptors(FileInterceptor('zipFile', {
    dest: uploadDest,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
      if (file.originalname.endsWith('.zip')) {
        cb(null, true)
      } else {
        cb(new Error('只允许上传Zip文件'), false)
      }
    },
  }))
  async create(
    @Body() createDto: CreateSkillDto,
    @UploadedFile() zipFile: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!zipFile) {
      throw new BadRequestException('请上传Zip文件')
    }
    const zipPath = zipFile.path
    const zipSize = zipFile.size
    return this.skillService.create(createDto, user.id, zipPath, zipSize)
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑Skill' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSkillDto,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.permissions?.includes('admin')
    return this.skillService.update(id, updateDto, user.id, isAdmin)
  }

  @Post(':id/versions')
  @ApiOperation({ summary: '提交新版本' })
  @UseInterceptors(FileInterceptor('zipFile', {
    dest: uploadDest,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.originalname.endsWith('.zip')) {
        cb(null, true)
      } else {
        cb(new Error('只允许上传Zip文件'), false)
      }
    },
  }))
  submitVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitVersionDto,
    @UploadedFile() zipFile: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.skillService.submitVersion(id, dto, user.id, zipFile.path, zipFile.size)
  }

  @Get(':id/versions')
  @ApiOperation({ summary: '获取版本列表' })
  getVersions(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.getVersions(id)
  }

  @Post(':id/publish')
  @RequirePermission('admin')
  @ApiOperation({ summary: '发布Skill' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.publish(id)
  }

  @Post(':id/offline')
  @RequirePermission('admin')
  @ApiOperation({ summary: '下架Skill' })
  offline(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.offline(id)
  }

  @Post(':id/resubmit')
  @ApiOperation({ summary: '重新提交审核' })
  resubmit(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.skillService.resubmit(id, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Skill' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const isAdmin = user.permissions?.includes('admin')
    return this.skillService.remove(id, user.id, isAdmin)
  }

  @Get(':skillId/versions/:versionId/download')
  @ApiOperation({ summary: '下载Skill Zip包' })
  async downloadZip(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { filePath, fileName } = await this.skillService.getDownloadInfo(skillId, versionId)
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('文件不存在')
    }

    // 记录下载
    const dbUser = await this.userRepository.findOne({ where: { id: user.id } })
    if (dbUser) {
      await this.downloadService.recordDownload(user.id, skillId, versionId, dbUser.department_id)
    }

    res.download(filePath, fileName)
  }
}
