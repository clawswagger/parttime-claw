import { Task } from './listener';

export interface Decision {
  accept: boolean;
  reason: string;
  confidence: number; // 0-1
  suggestedAction?: string;
  analysis?: {
    estimatedCost: number;    // 预计成本 (时间/资源)
    estimatedReward: number;  // 预计报酬
    profitMargin: number;     // 利润率
    timeRequired: number;     // 所需时间 (小时)
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export class ClawDecision {
  private config: any;
  private clawStats: ClawStats;

  constructor(config: any) {
    this.config = config;
    this.clawStats = new ClawStats(config);
  }

  /**
   * 使用客户自己的 Claw 分析任务收益和成本
   */
  async decide(task: Task): Promise<Decision> {
    console.log('\n🤖 Claw 正在分析任务收益和成本...\n');

    // 1. 计算预计成本
    const costAnalysis = await this.clawStats.estimateCost(task);
    
    // 2. 计算预期收益
    const rewardAnalysis = await this.clawStats.estimateReward(task);
    
    // 3. 计算利润率
    const profitMargin = this.calculateProfitMargin(costAnalysis, rewardAnalysis);
    
    // 4. 评估风险
    const riskLevel = this.assessRisk(task, costAnalysis);
    
    // 5. 综合决策
    const decision = this.makeDecision(task, costAnalysis, rewardAnalysis, profitMargin, riskLevel);
    
    return decision;
  }

  /**
   * 计算利润率
   */
  private calculateProfitMargin(cost: any, reward: any): number {
    const profit = reward.netReward - cost.totalCost;
    const margin = profit / reward.netReward;
    return margin; // 0-1 之间
  }

  /**
   * 评估风险等级
   */
  private assessRisk(task: Task, cost: any): 'low' | 'medium' | 'high' {
    // 风险评估因素：
    // 1. 时间紧迫度
    // 2. 任务复杂度
    // 3. 历史成功率
    // 4. 报酬合理性
    
    const timePressure = this.calculateTimePressure(task.deadline);
    const complexity = this.estimateComplexity(task);
    const historicalSuccess = this.clawStats.getHistoricalSuccessRate(task.capabilities);
    
    if (timePressure > 0.8 || complexity > 0.8 || historicalSuccess < 0.5) {
      return 'high';
    } else if (timePressure > 0.5 || complexity > 0.5 || historicalSuccess < 0.7) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 综合决策逻辑
   */
  private makeDecision(
    task: Task,
    cost: any,
    reward: any,
    profitMargin: number,
    riskLevel: string
  ): Decision {
    const minReward = this.config.agent?.minReward || 10;
    const minProfitMargin = 0.3; // 最低 30% 利润率
    
    // 1. 检查报酬门槛
    if (Number(task.reward) / 1e6 < minReward) {
      return {
        accept: false,
        reason: `报酬 ${Number(task.reward) / 1e6} USDC 低于最低门槛 ${minReward} USDC`,
        confidence: 1.0,
        suggestedAction: '跳过此任务',
        analysis: {
          estimatedCost: cost.totalCost,
          estimatedReward: reward.netReward,
          profitMargin: 0,
          timeRequired: cost.estimatedHours,
          riskLevel: 'low',
        },
      };
    }

    // 2. 检查利润率
    if (profitMargin < minProfitMargin) {
      return {
        accept: false,
        reason: `利润率 ${(profitMargin * 100).toFixed(1)}% 低于最低要求 ${(minProfitMargin * 100).toFixed(0)}%`,
        confidence: 0.9,
        suggestedAction: '跳过此任务，寻找更高利润的任务',
        analysis: {
          estimatedCost: cost.totalCost,
          estimatedReward: reward.netReward,
          profitMargin: profitMargin,
          timeRequired: cost.estimatedHours,
          riskLevel: riskLevel as any,
        },
      };
    }

    // 3. 检查风险等级
    if (riskLevel === 'high') {
      return {
        accept: false,
        reason: `风险等级过高 (${riskLevel})，可能影响信誉分`,
        confidence: 0.8,
        suggestedAction: '跳过高风险任务，或先提升相关能力',
        analysis: {
          estimatedCost: cost.totalCost,
          estimatedReward: reward.netReward,
          profitMargin: profitMargin,
          timeRequired: cost.estimatedHours,
          riskLevel: riskLevel as any,
        },
      };
    }

    // 4. 检查能力匹配
    const hasCapability = task.capabilities.some((cap: string) =>
      this.config.agent?.capabilities?.includes(cap)
    );
    
    if (!hasCapability) {
      return {
        accept: false,
        reason: `任务需要能力 [${task.capabilities.join(', ')}] 不在你的能力列表中`,
        confidence: 1.0,
        suggestedAction: '跳过此任务，或先学习相关技能',
        analysis: {
          estimatedCost: cost.totalCost,
          estimatedReward: reward.netReward,
          profitMargin: 0,
          timeRequired: 0,
          riskLevel: 'medium',
        },
      };
    }

    // 5. 综合评估：接受任务
    return {
      accept: true,
      reason: `利润率 ${(profitMargin * 100).toFixed(1)}%，风险等级 ${riskLevel}，预计耗时 ${cost.estimatedHours}小时`,
      confidence: 0.85,
      suggestedAction: '建议接受任务，优先处理',
      analysis: {
        estimatedCost: cost.totalCost,
        estimatedReward: reward.netReward,
        profitMargin: profitMargin,
        timeRequired: cost.estimatedHours,
        riskLevel: riskLevel as any,
      },
    };
  }

  /**
   * 计算时间压力 (0-1)
   */
  private calculateTimePressure(deadline: string): number {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // 少于 24 小时压力最大
    if (hoursLeft < 24) return 1.0;
    if (hoursLeft < 48) return 0.7;
    if (hoursLeft < 72) return 0.4;
    return 0.2;
  }

  /**
   * 估算任务复杂度 (0-1)
   */
  private estimateComplexity(task: Task): number {
    // 基于任务描述长度、所需能力数量等
    const descriptionLength = task.description.length;
    const capabilityCount = task.capabilities.length;
    
    const lengthFactor = Math.min(descriptionLength / 1000, 1);
    const capabilityFactor = Math.min(capabilityCount / 5, 1);
    
    return (lengthFactor + capabilityFactor) / 2;
  }
}

/**
 * Claw 统计和成本计算
 */
class ClawStats {
  private config: any;
  private historicalData: any;

  constructor(config: any) {
    this.config = config;
    this.historicalData = this.loadHistoricalData();
  }

  /**
   * 估算任务成本
   */
  async estimateCost(task: Task): Promise<{
    totalCost: number;
    estimatedHours: number;
    opportunityCost: number;
    resourceCost: number;
  }> {
    // 1. 估算时间成本
    const estimatedHours = await this.estimateTimeRequired(task);
    
    // 2. 计算时间成本 (按每小时机会成本计算)
    const hourlyRate = this.getHourlyRate(); // USDC/小时
    const timeCost = estimatedHours * hourlyRate;
    
    // 3. 计算资源成本 (API 调用、计算资源等)
    const resourceCost = await this.estimateResourceCost(task);
    
    // 4. 计算机会成本
    const opportunityCost = estimatedHours * this.getAverageEarningsPerHour();
    
    // 5. 总成本
    const totalCost = timeCost + resourceCost + opportunityCost;
    
    return {
      totalCost,
      estimatedHours,
      opportunityCost,
      resourceCost,
    };
  }

  /**
   * 估算任务收益
   */
  async estimateReward(task: Task): Promise<{
    grossReward: number;
    netReward: number;
    gasCost: number;
    platformFee: number;
  }> {
    const grossReward = Number(task.reward) / 1e6; // USDC
    
    // 平台手续费 (假设 5%)
    const platformFee = grossReward * 0.05;
    
    // Gas 费 (假设 0.5-2 USDC)
    const gasCost = await this.estimateGasCost();
    
    // 净收益
    const netReward = grossReward - platformFee - gasCost;
    
    return {
      grossReward,
      netReward,
      gasCost,
      platformFee,
    };
  }

  /**
   * 估算任务所需时间
   */
  private async estimateTimeRequired(task: Task): Promise<number> {
    // 基于历史数据估算
    const historicalAvg = this.historicalData.getAverageTimeForCapability(task.capabilities);
    
    if (historicalAvg) {
      return historicalAvg;
    }
    
    // 默认估算：根据任务类型
    const defaultTimes: any = {
      'Data Analysis': 3,
      'Content Writing': 4,
      'Code Review': 2,
      'Translation': 2,
      'Market Research': 4,
      'Smart Contract': 8,
      'Customer Support': 1,
    };
    
    let totalHours = 0;
    for (const cap of task.capabilities) {
      totalHours += defaultTimes[cap] || 3;
    }
    
    return totalHours / task.capabilities.length;
  }

  /**
   * 获取每小时费率
   */
  private getHourlyRate(): number {
    // 基于历史收益计算平均每小时收益
    const avgEarnings = this.getAverageEarningsPerHour();
    return avgEarnings || 10; // 默认 10 USDC/小时
  }

  /**
   * 获取平均每小时收益
   */
  private getAverageEarningsPerHour(): number {
    // 从历史数据中获取
    return this.historicalData.averageEarningsPerHour || 15;
  }

  /**
   * 估算 Gas 费
   */
  private async estimateGasCost(): Promise<number> {
    // TODO: 从链上获取当前 Gas 价格
    // 这里使用估算值
    return 1.0; // 1 USDC
  }

  /**
   * 估算资源成本
   */
  private async estimateResourceCost(task: Task): Promise<number> {
    // API 调用成本、计算资源等
    let cost = 0;
    
    if (task.capabilities.includes('Data Analysis')) {
      cost += 0.5; // 可能需要调用数据分析 API
    }
    
    if (task.capabilities.includes('Market Research')) {
      cost += 1.0; // 可能需要付费数据源
    }
    
    return cost;
  }

  /**
   * 获取历史成功率
   */
  getHistoricalSuccessRate(capabilities: string[]): number {
    // 从历史数据中获取
    return this.historicalData.getSuccessRate(capabilities) || 0.8;
  }

  /**
   * 加载历史数据
   */
  private loadHistoricalData(): any {
    // TODO: 从本地数据库或文件加载历史数据
    return {
      getAverageTimeForCapability: (caps: string[]) => null,
      getSuccessRate: (caps: string[]) => null,
      averageEarningsPerHour: 15,
    };
  }
}
