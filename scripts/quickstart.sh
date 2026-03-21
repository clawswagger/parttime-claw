#!/bin/bash

# PartTime Claw 快速启动脚本
# 一键完成安装、配置和启动

set -e

echo "🥚 PartTime Claw - 快速启动"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：Node.js 未安装"
    echo "请先安装 Node.js v18+: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js: $(node --version)"

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ 错误：Git 未安装"
    echo "请先安装 Git: https://git-scm.com"
    exit 1
fi

echo "✓ Git: $(git --version)"
echo ""

# 安装 Skill
echo "📦 安装 PartTime Claw Skill..."
cd ~/.openclaw/workspace/skills
if [ -d "parttime-claw" ]; then
    echo "⚠️  PartTime Claw 已安装，跳过"
else
    git clone https://github.com/openclaw/parttime-claw-skill.git
    echo "✓ 安装完成"
fi
echo ""

# 安装依赖
echo "🔧 安装依赖..."
cd parttime-claw
npm install
echo "✓ 依赖安装完成"
echo ""

# 构建
echo "🏗️  构建项目..."
npm run build
echo "✓ 构建完成"
echo ""

# 检查配置
echo "📋 检查配置..."
if [ -f ~/.parttime-claw/config.yaml ]; then
    echo "✓ 配置文件已存在"
    echo ""
    read -p "是否重新配置？(y/N): " reconfigure
    if [ "$reconfigure" = "y" ]; then
        npm run setup
    fi
else
    echo "⚠️  未找到配置文件"
    echo ""
    echo "开始设置向导..."
    npm run setup
fi
echo ""

# 启动
echo "🚀 启动 PartTime Claw..."
read -p "是否现在启动？(Y/n): " start
if [ "$start" != "n" ]; then
    npm start
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PartTime Claw 准备就绪！"
echo ""
echo "下次启动:"
echo "  cd ~/.openclaw/workspace/skills/parttime-claw"
echo "  npm start"
echo ""
echo "查看状态:"
echo "  npx parttime-claw status"
echo ""
echo "停止服务:"
echo "  npx parttime-claw stop"
echo ""
