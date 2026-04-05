# 第二阶段：用户与组织管理

## 目标
实现用户管理、角色管理、权限管理、组织管理等核心功能。

## 实现步骤

### Step 1: 后端 - 用户管理 API
- SysUserController: 用户增删改查
- UserService: 用户业务逻辑
- 用户列表、创建、更新、删除、分配角色

### Step 2: 后端 - 角色管理 API
- SysRoleController: 角色增删改查
- RoleService: 角色业务逻辑
- 角色列表、创建、更新、删除、分配权限

### Step 3: 后端 - 权限管理 API
- SysPermissionController: 权限增删改查
- PermissionService: 权限业务逻辑
- 权限树形结构、创建、更新、删除

### Step 4: 后端 - 组织管理 API
- SysOrganizationController: 组织增删改查
- Organization实体和表
- 组织树形结构、创建、更新、删除

### Step 5: 前端 - 用户管理页面
- UserList.vue: 用户列表（搜索、分页）
- UserForm.vue: 用户创建/编辑表单
- 用户角色分配弹窗

### Step 6: 前端 - 角色管理页面
- RoleList.vue: 角色列表
- RoleForm.vue: 角色创建/编辑表单
- 角色权限分配弹窗

### Step 7: 前端 - 权限管理页面
- PermissionTree.vue: 权限树形管理
- PermissionForm.vue: 权限创建/编辑表单

### Step 8: 前端 - 组织管理页面
- OrganizationTree.vue: 组织树形管理
- OrganizationForm.vue: 组织创建/编辑表单

### Step 9: 集成测试
- 前后端联调各管理功能

## 验收标准
1. 用户管理：列表、创建、编辑、删除、搜索、分页
2. 角色管理：列表、创建、编辑、删除
3. 权限管理：树形展示、创建、编辑、删除
4. 组织管理：树形展示、创建、编辑、删除
5. 权限控制：不同角色看到不同菜单

## 预估时间
1.5-2 周