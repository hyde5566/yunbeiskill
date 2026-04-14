#!/bin/bash
BASE_URL="http://localhost:3000"
LOG_FILE="test-results.log"

# 获取Token
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败"
    exit 1
fi
echo "✅ 登录成功"

# 测试函数
test_api() {
    name=$1
    method=$2
    path=$3
    data=$4
    
    if [ "$method" = "GET" ]; then
        result=$(curl -s -X GET "$BASE_URL$path" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
    else
        result=$(curl -s -X $method "$BASE_URL$path" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data")
    fi
    
    code=$(echo "$result" | grep -o '"code":[0-9]*' | cut -d':' -f2)
    
    if [ "$code" = "0" ]; then
        echo "✅ $name"
    else
        msg=$(echo "$result" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo "❌ $name - $msg"
    fi
}

echo "=== API自动化测试 ==="

# 1. 认证测试
test_api "获取用户信息" GET "/auth/me"

# 2. Skill测试
test_api "获取Skill列表" GET "/skills"
test_api "获取我提交的Skill" GET "/skills/my"
test_api "获取Skill详情" GET "/skills/1"

# 3. 分类测试
test_api "获取分类列表" GET "/skill-categories"

# 4. 用户测试
test_api "获取用户列表" GET "/users"

# 5. 部门测试
test_api "获取部门列表" GET "/departments"
test_api "获取部门树" GET "/departments/tree"

# 6. 项目测试
test_api "获取项目列表" GET "/projects"

# 7. 权限测试
test_api "获取权限列表" GET "/permissions"

# 8. 下载测试
test_api "获取我的下载" GET "/downloads/my"

# 9. 统计测试
test_api "获取统计概览" GET "/stats/overview"
test_api "获取Skill统计" GET "/stats/skills"
test_api "获取下载统计" GET "/stats/downloads"
test_api "获取分类统计" GET "/stats/categories"

# 10. 通知测试
test_api "获取通知列表" GET "/notifications"
test_api "获取未读通知数" GET "/notifications/unread-count"

# 11. 日志测试
test_api "获取操作日志" GET "/operation-logs"
test_api "获取登录日志" GET "/login-logs"

# 12. 审核测试
test_api "获取待审核Skill" GET "/skills/pending-review"
test_api "获取待审核版本" GET "/skills/pending-version-review"

echo "=== 测试完成 ==="
