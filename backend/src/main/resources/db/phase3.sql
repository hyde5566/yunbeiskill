-- Skill 分类表
CREATE TABLE IF NOT EXISTS skill_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    description VARCHAR(255) COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill分类表';

-- Skill 主表
CREATE TABLE IF NOT EXISTS skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    skill_name VARCHAR(200) NOT NULL COMMENT 'Skill名称',
    skill_code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Skill编码',
    category_id BIGINT COMMENT '分类ID',
    description TEXT COMMENT '描述',
    input_example TEXT COMMENT '输入示例',
    output_example TEXT COMMENT '输出示例',
    author VARCHAR(100) COMMENT '作者',
    version VARCHAR(20) DEFAULT '1.0.0' COMMENT '当前版本',
    status TINYINT DEFAULT 1 COMMENT '状态：0草稿 1发布 2下架',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    use_count INT DEFAULT 0 COMMENT '使用次数',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_category (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill主表';

-- Skill 版本历史表
CREATE TABLE IF NOT EXISTS skill_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    skill_id BIGINT NOT NULL COMMENT 'Skill ID',
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    change_log TEXT COMMENT '变更日志',
    content TEXT COMMENT '版本内容',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill版本历史表';

-- Skill 标签表
CREATE TABLE IF NOT EXISTS skill_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tag_name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill标签表';

-- Skill 标签关联表
CREATE TABLE IF NOT EXISTS skill_tag_relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    skill_id BIGINT NOT NULL COMMENT 'Skill ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    UNIQUE KEY uk_skill_tag (skill_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill标签关联表';

-- 初始化分类
INSERT INTO skill_category (category_name, category_code, parent_id, description, sort_order, status) VALUES
('文本处理', 'text', 0, '文本相关处理技能', 1, 1),
('数据分析', 'data', 0, '数据分析相关技能', 2, 1),
('代码生成', 'code', 0, '代码生成相关技能', 3, 1),
('知识问答', 'qa', 0, '知识问答相关技能', 4, 1);

-- 添加权限
INSERT INTO sys_permission (permission_name, permission_code, resource_type, parent_id, resource_path, sort_order, status, description) VALUES
('Skill管理', 'skill:manage', 'menu', 1, '/system/skill', 5, 1, 'Skill管理菜单'),
('Skill列表', 'skill:list', 'button', 10, NULL, 1, 1, '查看Skill列表'),
('Skill创建', 'skill:create', 'button', 10, NULL, 2, 1, '创建Skill'),
('Skill编辑', 'skill:edit', 'button', 10, NULL, 3, 1, '编辑Skill'),
('Skill删除', 'skill:delete', 'button', 10, NULL, 4, 1, '删除Skill');

-- 给管理员分配Skill权限
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 1, id FROM sys_permission WHERE permission_code LIKE 'skill:%';

-- 给普通用户分配Skill查看权限
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 2, id FROM sys_permission WHERE permission_code IN ('skill:manage', 'skill:list');