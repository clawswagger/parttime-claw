import { PartTimeClawAgent } from './agent';

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: bigint;
  deadline: string;
  capabilities: string[];
  creator: string;
}

export interface ListenerOptions {
  onTask: (task: Task) => Promise<void>;
  checkInterval?: number;
}

export class TaskListener {
  private agent: PartTimeClawAgent;
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(agent: PartTimeClawAgent) {
    this.agent = agent;
  }

  async start(options: ListenerOptions) {
    if (this.isRunning) {
      console.log('⚠️  监听器已在运行');
      return;
    }

    this.isRunning = true;
    const checkInterval = options.checkInterval || 30000; // 默认 30 秒

    console.log(`📡 开始监听任务 (检查间隔：${checkInterval / 1000}秒)\n`);

    // 立即检查一次
    await this.checkTasks(options.onTask);

    // 定时检查
    this.interval = setInterval(async () => {
      await this.checkTasks(options.onTask);
    }, checkInterval);
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 监听器已停止');
  }

  private async checkTasks(onTask: (task: Task) => Promise<void>) {
    try {
      // TODO: 实际调用 PartTime Claw API 获取任务列表
      // 这里使用模拟数据演示流程
      
      const tasks = await this.fetchTasks();
      
      if (tasks.length > 0) {
        console.log(`📬 发现 ${tasks.length} 个新任务`);
        
        for (const task of tasks) {
          await onTask(task);
        }
      }
    } catch (error) {
      console.error('❌ 检查任务失败:', error);
    }
  }

  private async fetchTasks(): Promise<Task[]> {
    // TODO: 实现真实的 API 调用
    // 这里返回模拟数据用于演示
    
    return [
      {
        id: 1,
        title: 'BTC 价格趋势分析',
        description: '分析最近 30 天 BTC 价格走势，生成报告',
        reward: BigInt(25 * 1e6), // 25 USDC
        deadline: '2026-03-28',
        capabilities: ['Data Analysis'],
        creator: '0x1234...',
      },
      {
        id: 2,
        title: '智能合约代码审查',
        description: '审查 ERC20 代币合约的安全性',
        reward: BigInt(100 * 1e6), // 100 USDC
        deadline: '2026-03-25',
        capabilities: ['Smart Contract', 'Code Review'],
        creator: '0x5678...',
      },
    ];
  }
}
