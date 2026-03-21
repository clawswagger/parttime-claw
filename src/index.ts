#!/usr/bin/env node

/**
 * PartTime Claw - 让你的 Claw 利用空闲时间赚钱
 * 
 * 核心功能:
 * - 引导式配置
 * - Agent 注册
 * - 自动监听任务
 * - Claude 决策支持
 */

import { PartTimeClawAgent } from './agent';
import { SetupWizard } from './setup';
import { TaskListener } from './listener';
import { ClawDecision } from './claude';
import { ConfigManager } from './config';

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🥚 PartTime Claw - 让每个 Claw 都能创造价值\n');

  switch (command) {
    case 'setup':
      await runSetup();
      break;
    case 'register':
      await runRegister();
      break;
    case 'start':
      await runStart();
      break;
    case 'status':
      await runStatus();
      break;
    case 'stop':
      await runStop();
      break;
    default:
      showHelp();
  }
}

// 引导设置
async function runSetup() {
  console.log('🚀 开始 PartTime Claw 设置向导\n');
  
  const wizard = new SetupWizard();
  await wizard.run();
  
  console.log('\n✅ 设置完成！运行 `npx parttime-claw start` 开始赚钱');
}

// Agent 注册
async function runRegister() {
  console.log('📝 注册 Agent 到 PartTime Claw 平台\n');
  
  const config = ConfigManager.load();
  const agent = new PartTimeClawAgent(config);
  
  await agent.register();
  
  console.log('\n✅ Agent 注册成功！');
}

// 启动监听
async function runStart() {
  console.log('🎯 启动 PartTime Claw 监听服务\n');
  
  const config = ConfigManager.load();
  const agent = new PartTimeClawAgent(config);
  const listener = new TaskListener(agent);
  const claw = new ClawDecision(config);
  
  // 检查配置
  if (!config.wallet?.privateKey) {
    console.error('❌ 错误：未配置钱包私钥');
    console.log('请先运行：npx parttime-claw setup');
    process.exit(1);
  }
  
  // 启动监听
  console.log('📡 连接到任务广播频道...');
  await listener.start({
    onTask: async (task) => {
      console.log(`\n📬 收到新任务 #${task.id}`);
      console.log(`   标题：${task.title}`);
      console.log(`   报酬：${task.reward} USDC`);
      console.log(`   截止：${task.deadline}`);
      
      // 使用 Claw 分析收益和成本
      const decision = await claw.decide(task);
      
      if (decision.accept) {
        console.log(`\n✅ Claw 分析结果：接受任务`);
        console.log(`   理由：${decision.reason}`);
        if (decision.analysis) {
          console.log(`   预计收益：${decision.analysis.estimatedReward.toFixed(2)} USDC`);
          console.log(`   预计成本：${decision.analysis.estimatedCost.toFixed(2)} USDC`);
          console.log(`   利润率：${(decision.analysis.profitMargin * 100).toFixed(1)}%`);
          console.log(`   预计耗时：${decision.analysis.timeRequired.toFixed(1)} 小时`);
          console.log(`   风险等级：${decision.analysis.riskLevel}`);
        }
        
        await agent.claimTask(task.id);
        console.log(`   ✓ 任务已领取`);
        
        // 执行任务
        const result = await executeTask(task);
        await agent.submitResult(task.id, result);
        console.log(`   ✓ 结果已提交`);
      } else {
        console.log(`\n❌ Claw 分析结果：跳过任务`);
        console.log(`   理由：${decision.reason}`);
        if (decision.analysis) {
          console.log(`   预计收益：${decision.analysis.estimatedReward.toFixed(2)} USDC`);
          console.log(`   预计成本：${decision.analysis.estimatedCost.toFixed(2)} USDC`);
          console.log(`   利润率：${(decision.analysis.profitMargin * 100).toFixed(1)}%`);
        }
      }
    },
  });
  
  console.log('\n✨ PartTime Claw 正在运行...');
  console.log('按 Ctrl+C 停止\n');
  
  // 保持运行
  process.on('SIGINT', async () => {
    console.log('\n🛑 正在停止...');
    await listener.stop();
    console.log('✅ 已停止');
    process.exit(0);
  });
}

// 查看状态
async function runStatus() {
  console.log('📊 PartTime Claw 状态\n');
  
  const config = ConfigManager.load();
  const agent = new PartTimeClawAgent(config);
  const status = await agent.getStatus();
  
  if (!status) {
    console.log('⚠️  Agent 未注册或未运行');
    return;
  }
  
  console.log(`🤖 Agent: ${config.agent?.name || 'Unknown'}`);
  console.log(`💰 总收益：${formatReward(status.totalEarnings)} USDC`);
  console.log(`✅ 完成任务：${status.completedTasks.toString()}`);
  console.log(`⏳ 进行中：${status.activeTasks.toString()}`);
  console.log(`📊 信誉分：${status.reputation.toString()}`);
  console.log(`🏆 等级：${getTierName(status.tier)}`);
  console.log(`🕐 运行时间：${formatUptime(status.uptime)}`);
}

// 停止服务
async function runStop() {
  console.log('🛑 停止 PartTime Claw 服务\n');
  
  const pidFile = '/tmp/parttime-claw.pid';
  // TODO: 读取 PID 并停止进程
  
  console.log('✅ 已停止');
}

// 显示帮助
function showHelp() {
  console.log(`
🥚 PartTime Claw - 让每个 Claw 都能创造价值

用法:
  npx parttime-claw <command> [options]

命令:
  setup     引导式设置 (首次使用)
  register  注册 Agent 到平台
  start     启动任务监听
  status    查看运行状态
  stop      停止监听服务
  help      显示帮助信息

示例:
  npx parttime-claw setup      # 首次设置
  npx parttime-claw start      # 开始赚钱
  npx parttime-claw status     # 查看状态

文档: https://docs.openclaw.ai/parttime-claw
`);
}

// 执行任务 (简化版)
async function executeTask(task: any): Promise<string> {
  console.log('\n🔧 执行任务中...');
  // TODO: 根据任务类型调用相应的处理函数
  // 这里返回示例结果
  return '0x' + Buffer.from('task-completed').toString('hex');
}

// 工具函数
function formatReward(reward: bigint): string {
  return (Number(reward) / 1e6).toFixed(2);
}

function getTierName(tier: number): string {
  const tiers = ['Trial', 'Regular', 'Premium', 'Enterprise'];
  return tiers[tier] || 'Unknown';
}

function formatUptime(seconds: bigint): string {
  const s = Number(seconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

// 运行主函数
main().catch((error) => {
  console.error('❌ 错误:', error.message);
  process.exit(1);
});
