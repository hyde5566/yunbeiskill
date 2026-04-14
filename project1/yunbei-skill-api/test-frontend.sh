#!/bin/bash
BASE_URL="http://localhost:5173"

echo "=== 前端页面测试 ==="

test_page() {
    name=$1
    path=$2
    result=$(curl -s "$BASE_URL$path" | head -c 50)
    if [ -n "$result" ]; then
        echo "✅ $name - 页面可访问"
    else
        echo "❌ $name - 页面无法访问"
    fi
}

test_page "首页" "/"
test_page "登录页" "/login"
test_page "Skill列表" "/skill"
test_page "Skill提交" "/skill/submit"
test_page "我的下载" "/my-downloads"
test_page "我的提交" "/my-submissions"
test_page "审核管理" "/review"
test_page "用户管理" "/admin/users"
test_page "部门管理" "/admin/departments"
test_page "权限配置" "/admin/permissions"
test_page "项目管理" "/admin/projects"
test_page "分类管理" "/admin/categories"
test_page "操作日志" "/admin/logs"
test_page "登录日志" "/admin/login-logs"
test_page "数据统计" "/admin/stats"

echo "=== 前端测试完成 ==="
