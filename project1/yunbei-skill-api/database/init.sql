-- 云贝Skill管理系统数据库初始化脚本
-- MySQL 8.0

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 用户组织相关表
-- ----------------------------

-- 部门表
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '部门名称',
  `parent_id` bigint DEFAULT NULL COMMENT '父部门ID',
  `level` int NOT NULL DEFAULT 1 COMMENT '层级（1=一级，2=二级...）',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 用户表
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '账号',
  `password` varchar(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `real_name` varchar(100) NOT NULL COMMENT '真实姓名',
  `department_id` bigint NOT NULL COMMENT '所属部门ID',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态（1=正常，0=禁用）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_department_id` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 权限定义表
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '权限代码（basic/review/admin）',
  `name` varchar(100) NOT NULL COMMENT '权限名称',
  `description` varchar(255) DEFAULT NULL COMMENT '权限描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限定义表';

-- 用户权限关联表
CREATE TABLE `user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `permission_id` bigint NOT NULL COMMENT '权限ID',
  `assigned_by` bigint DEFAULT NULL COMMENT '分配人ID',
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_permission` (`user_id`, `permission_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户权限关联表';

-- ----------------------------
-- 2. Skill核心表
-- ----------------------------

-- Skill分类表（预设7个分类）
CREATE TABLE `skill_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `description` varchar(255) DEFAULT NULL COMMENT '分类描述',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill分类表';

-- 预设分类数据
INSERT INTO `skill_categories` (`name`, `description`, `sort_order`) VALUES
('开发工具', '开发辅助工具', 1),
('数据分析', '数据处理和分析工具', 2),
('文档处理', '文档生成和转换工具', 3),
('自动化脚本', '自动化执行脚本', 4),
('API服务', 'API接口相关', 5),
('测试工具', '测试辅助工具', 6),
('其他', '其他类型Skill', 7);

-- Skill基本信息表
CREATE TABLE `skills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `unique_id` varchar(100) NOT NULL COMMENT 'Skill唯一标识（UUID）',
  `name` varchar(200) NOT NULL COMMENT 'Skill名称',
  `description` text COMMENT 'Skill描述',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `source_type` varchar(50) NOT NULL COMMENT '来源类型（internal/external）',
  `source_name` varchar(200) DEFAULT NULL COMMENT '来源名称',
  `submitter_id` bigint NOT NULL COMMENT '提交人ID',
  `status` varchar(50) NOT NULL DEFAULT 'pending_review' COMMENT '状态',
  `visibility_type` varchar(50) NOT NULL DEFAULT 'all' COMMENT '可见范围类型',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_unique_id` (`unique_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_submitter_id` (`submitter_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill基本信息表';

-- Skill版本记录表
CREATE TABLE `skill_versions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_number` varchar(50) NOT NULL COMMENT '版本号（如v1.0）',
  `zip_path` varchar(500) NOT NULL COMMENT 'OSS存储路径',
  `zip_size` bigint NOT NULL COMMENT '文件大小（字节）',
  `change_log` text COMMENT '更新日志',
  `uploader_id` bigint NOT NULL COMMENT '上传人ID',
  `status` varchar(50) NOT NULL DEFAULT 'pending_review' COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill版本记录表';

-- Skill可见范围设置表
CREATE TABLE `skill_visibility` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `target_type` varchar(50) NOT NULL COMMENT '目标类型（project/account）',
  `target_id` bigint NOT NULL COMMENT '目标ID（项目ID或用户ID）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill可见范围设置表';

-- ----------------------------
-- 3. 流程记录表
-- ----------------------------

-- 审核记录表
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint NOT NULL COMMENT '版本ID',
  `reviewer_id` bigint NOT NULL COMMENT '审核人ID',
  `assigned_by` bigint DEFAULT NULL COMMENT '分配人ID',
  `status` varchar(50) NOT NULL COMMENT '状态（pending/approved/rejected）',
  `comment` text COMMENT '审核意见',
  `reviewed_at` datetime DEFAULT NULL COMMENT '审核时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核记录表';

-- 下载记录表
CREATE TABLE `download_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '下载人ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint NOT NULL COMMENT '版本ID',
  `department_id` bigint NOT NULL COMMENT '下载人所属部门ID',
  `downloaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下载时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_version_id` (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='下载记录表';

-- 评分记录表
CREATE TABLE `ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '评分人ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID（可空）',
  `score` int NOT NULL COMMENT '评分（1-5）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`),
  UNIQUE KEY `uk_user_skill` (`user_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分记录表';

-- 反馈记录表
CREATE TABLE `feedbacks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '反馈人ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID',
  `content` text NOT NULL COMMENT '反馈内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈记录表';

-- ----------------------------
-- 4. 项目组织表
-- ----------------------------

-- 项目表
CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '项目名称',
  `description` text COMMENT '项目描述',
  `owner_id` bigint NOT NULL COMMENT '项目负责人ID',
  `status` varchar(50) NOT NULL DEFAULT 'active' COMMENT '状态（active/archived）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 项目成员表
CREATE TABLE `project_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role` varchar(50) NOT NULL DEFAULT 'member' COMMENT '角色（owner/member）',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_user` (`project_id`, `user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表';

-- 项目关联Skill表
CREATE TABLE `project_skills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_skill` (`project_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目关联Skill表';

-- ----------------------------
-- 5. 系统记录表
-- ----------------------------

-- 站内通知表
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '接收人ID',
  `type` varchar(50) NOT NULL COMMENT '通知类型',
  `title` varchar(200) NOT NULL COMMENT '通知标题',
  `content` text COMMENT '通知内容',
  `related_skill_id` bigint DEFAULT NULL COMMENT '关联SkillID',
  `related_version_id` bigint DEFAULT NULL COMMENT '关联版本ID',
  `is_read` tinyint NOT NULL DEFAULT 0 COMMENT '是否已读',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内通知表';

-- 操作日志表
CREATE TABLE `operation_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '操作人ID',
  `module` varchar(100) NOT NULL COMMENT '模块',
  `action` varchar(100) NOT NULL COMMENT '动作',
  `target_type` varchar(100) DEFAULT NULL COMMENT '目标类型',
  `target_id` bigint DEFAULT NULL COMMENT '目标ID',
  `detail` text COMMENT '操作详情',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 登录日志表
CREATE TABLE `login_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '账号',
  `login_type` varchar(50) NOT NULL COMMENT '类型（login/logout）',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `device` varchar(255) DEFAULT NULL COMMENT '设备信息',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态（1=成功，0=失败）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';

-- ----------------------------
-- 6. 初始化权限数据
-- ----------------------------

INSERT INTO `permissions` (`code`, `name`, `description`) VALUES
('basic', '基础权限', '搜索、下载、提交、评分反馈'),
('review', '审核权限', '审核流程操作、批准/驳回'),
('admin', '管理权限', '系统管理、全局统计、导出');

-- ----------------------------
-- 7. 初始化部门和管理员账号
-- 注意：实际密码需要通过bcrypt生成
-- ----------------------------

-- 先创建一个顶级部门
INSERT INTO `departments` (`name`, `level`) VALUES ('云贝科技', 1);

-- 创建管理员账号
-- 密码 admin123 的bcrypt哈希值
INSERT INTO `users` (`username`, `password`, `real_name`, `department_id`, `status`) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PT4aZ3YWQDhKR5.jZa', '系统管理员', 1, 1);

-- 给管理员分配全部权限
INSERT INTO `user_permissions` (`user_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3);

SET FOREIGN_KEY_CHECKS = 1;