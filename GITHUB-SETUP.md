# GitHub 仓库设置指南

## 🚀 快速创建仓库

### 步骤 1: 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 仓库名称：`parttime-claw`
3. 仓库所有者：`clawswagger`
4. 可见性：**Public** (公开)
5. **不要** 初始化 README/.gitignore/license (我们已经有了)
6. 点击 **Create repository**

### 步骤 2: 推送代码到 GitHub

```bash
# 进入项目目录
cd ~/.openclaw/workspace/skills/parttime-claw

# 添加远程仓库
git remote add origin https://github.com/clawswagger/parttime-claw.git

# 推送代码
git push -u origin main
```

### 步骤 3: 验证推送

访问 https://github.com/clawswagger/parttime-claw 确认代码已上传

---

## 📦 推荐的文件结构

```
parttime-claw/
├── README.md              # 项目说明
├── SKILL.md              # Skill 文档
├── package.json          # NPM 配置
├── tsconfig.json         # TypeScript 配置
├── scripts/
│   └── quickstart.sh     # 快速安装脚本
├── src/
│   ├── index.ts          # 主入口
│   ├── agent.ts          # Agent 管理
│   ├── setup.ts          # 设置向导
│   ├── listener.ts       # 任务监听
│   ├── claude.ts         # Claw 决策引擎
│   └── config.ts         # 配置管理
└── docs/
    └── CLAW-ANALYSIS.md  # Claw 分析详解
```

---

## 🎯 仓库描述建议

**Name**: PartTime Claw  
**Description**: 🥚 让你的 Claw 利用空闲时间自动赚钱！使用 Claw 自主分析收益和成本，智能决策接单。

**Topics**:
- parttime
- claw
- agent
- earn
- blockchain
- arbitrum
- ai-agent
- passive-income

---

## 📝 README 徽章

添加到 README.md 开头：

```markdown
[![Version](https://img.shields.io/npm/v/parttime-claw.svg)](https://www.npmjs.com/package/parttime-claw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1234567890?label=Discord)](https://discord.gg/openclaw)
```

---

## 🔧 后续维护

### 更新代码

```bash
# 提交更改
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

### 发布新版本

```bash
# 更新版本号 (package.json)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 推送标签
git push origin --tags
```

### 发布到 NPM

```bash
# 登录 NPM
npm login

# 发布
npm publish
```

---

## 📊 GitHub Pages (可选)

如果需要文档网站：

1. 使用 VitePress 或 Docusaurus
2. 部署到 GitHub Pages
3. 访问 https://clawswagger.github.io/parttime-claw

---

## 🎉 完成检查

- [ ] GitHub 仓库已创建
- [ ] 代码已推送
- [ ] README 显示正常
- [ ] 文件结构正确
- [ ] 可以 clone 仓库

---

**仓库地址**: https://github.com/clawswagger/parttime-claw
