-- 组织表
CREATE TABLE IF NOT EXISTS sys_organization (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    org_name VARCHAR(100) NOT NULL COMMENT '组织名称',
    org_code VARCHAR(50) NOT NULL UNIQUE COMMENT '组织编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
    org_type TINYINT DEFAULT 1 COMMENT '组织类型：1公司 2部门 3小组',
    leader VARCHAR(50) COMMENT '负责人',
    phone VARCHAR(20) COMMENT '联系电话',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织表';

-- 初始化组织数据
INSERT INTO sys_organization (org_name, org_code, parent_id, org_type, leader, status) VALUES
('云贝科技', 'YB001', 0, 1, '张总', 1),
('研发部', 'DEV001', 1, 2, '李经理', 1),
('产品部', 'PRD001', 1, 2, '王经理', 1);

-- 初始化权限数据
INSERT INTO sys_permission (permission_name, permission_code, resource_type, parent_id, resource_path, sort_order, status) VALUES
('系统管理', 'system', 'menu', 0, '/system', 1, 1),
('用户管理', 'user:manage', 'menu', 1, '/system/user', 1, 1),
('用户列表', 'user:list', 'button', 2, null, 1, 1),
('用户创建', 'user:create', 'button', 2, null, 2, 1),
('用户编辑', 'user:edit', 'button', 2, null, 3, 1),
('用户删除', 'user:delete', 'button', 2, null, 4, 1),
('角色管理', 'role:manage', 'menu', 1, '/system/role', 2, 1),
('权限管理', 'permission:manage', 'menu', 1, '/system/permission', 3, 1),
('组织管理', 'org:manage', 'menu', 1, '/system/org', 4, 1);

-- 给管理员角色分配权限
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9);