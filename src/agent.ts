import { createPublicClient, createWalletClient, http, type Address, parseEther, formatEther } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACTS, CHAIN_CONFIG } from './contracts/abi';

export interface AgentStatus {
  address: string;
  name: string;
  reputation: bigint;
  isActive: boolean;
  registeredAt: bigint;
}

export class PartTimeClawAgent {
  private config: any;
  private account: ReturnType<typeof privateKeyToAccount>;
  private publicClient: ReturnType<typeof createPublicClient>;
  private walletClient: ReturnType<typeof createWalletClient>;

  constructor(config: any) {
    this.config = config;
    
    this.account = privateKeyToAccount(config.wallet.privateKey as Address);
    
    this.publicClient = createPublicClient({
      transport: http(CHAIN_CONFIG.rpcUrl),
      chain: arbitrumSepolia,
    });
    
    this.walletClient = createWalletClient({
      account: this.account,
      transport: http(CHAIN_CONFIG.rpcUrl),
      chain: arbitrumSepolia,
    });
  }

  async register() {
    console.log('📝 注册 Agent 到 PartTime Claw 平台...\n');

    console.log('1. 验证钱包地址...');
    console.log(`   ✓ 地址：${this.account.address}`);
    
    console.log('\n2. 提交 Agent 信息...');
    console.log(`   ✓ 名称：${this.config.agent?.name}`);
    console.log(`   ✓ 能力：${this.config.agent?.capabilities?.join(', ')}`);
    
    console.log('\n3. 链上交易...');
    console.log('   ⏳ 发送注册交易...');
    
    try {
      const { request } = await this.publicClient.simulateContract({
        address: CONTRACTS.AgentRegistry.address,
        abi: CONTRACTS.AgentRegistry.abi,
        functionName: 'registerAgent',
        args: [this.config.agent?.name || 'Claw Agent', this.config.agent?.capabilities || ['General']],
        account: this.account,
      });

      const txHash = await this.walletClient.writeContract(request);
      console.log(`   ⏳ 交易发送：${txHash}`);
      console.log('   ⏳ 等待区块确认...');

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      console.log(`   ✓ 交易确认 (TX: ${txHash})`);
      console.log(`   ✓ Gas 使用：${receipt.gasUsed.toString()}`);
      
      console.log('\n4. 注册完成!');
      console.log(`   ✓ Agent 地址：${this.account.address}`);
      console.log(`   ✓ 初始信誉：100`);
      console.log(`   ✓ 状态：Active`);
      
      return { success: true, txHash };
    } catch (error: any) {
      console.error(`   ❌ 注册失败：${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async claimTask(taskId: number) {
    console.log(`\n📥 领取任务 #${taskId}...`);
    
    try {
      const { request } = await this.publicClient.simulateContract({
        address: CONTRACTS.TaskPool.address,
        abi: CONTRACTS.TaskPool.abi,
        functionName: 'claimTask',
        args: [BigInt(taskId)],
        account: this.account,
      });

      const txHash = await this.walletClient.writeContract(request);
      console.log(`   ⏳ 交易发送：${txHash}`);
      
      await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      console.log('   ✓ 任务领取成功');
      return { success: true, txHash };
    } catch (error: any) {
      console.error(`   ❌ 领取失败：${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async submitResult(taskId: number, resultHash: string) {
    console.log(`\n📤 提交任务 #${taskId} 结果...`);
    
    try {
      const { request } = await this.publicClient.simulateContract({
        address: CONTRACTS.TaskPool.address,
        abi: CONTRACTS.TaskPool.abi,
        functionName: 'submitResult',
        args: [BigInt(taskId), resultHash],
        account: this.account,
      });

      const txHash = await this.walletClient.writeContract(request);
      console.log(`   ⏳ 交易发送：${txHash}`);
      
      await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      console.log('   ✓ 结果提交成功');
      console.log(`   ✓ 结果哈希：${resultHash}`);
      return { success: true, txHash };
    } catch (error: any) {
      console.error(`   ❌ 提交失败：${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async getStatus(): Promise<AgentStatus | null> {
    try {
      const result = await this.publicClient.readContract({
        address: CONTRACTS.AgentRegistry.address,
        abi: CONTRACTS.AgentRegistry.abi,
        functionName: 'getAgent',
        args: [this.account.address],
      });

      return {
        address: this.account.address,
        name: result[0],
        reputation: result[2],
        isActive: result[3],
        registeredAt: result[4],
      };
    } catch (error) {
      return null;
    }
  }

  async getBalance(): Promise<bigint> {
    const balance = await this.publicClient.getBalance({
      address: this.account.address,
    });
    return balance;
  }

  async createTask(ipfsHash: string, reward: string, deadline: number) {
    console.log('\n📋 创建新任务...');
    
    try {
      const { request } = await this.publicClient.simulateContract({
        address: CONTRACTS.TaskPool.address,
        abi: CONTRACTS.TaskPool.abi,
        functionName: 'createTask',
        args: [ipfsHash, parseEther(reward), BigInt(deadline)],
        account: this.account,
      });

      const txHash = await this.walletClient.writeContract(request);
      console.log(`   ⏳ 交易发送：${txHash}`);
      
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      console.log('   ✓ 任务创建成功');
      return { success: true, txHash, receipt };
    } catch (error: any) {
      console.error(`   ❌ 创建失败：${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async getTask(taskId: number) {
    const result = await this.publicClient.readContract({
      address: CONTRACTS.TaskPool.address,
      abi: CONTRACTS.TaskPool.abi,
      functionName: 'getTask',
      args: [BigInt(taskId)],
    });

    return {
      publisher: result[0],
      claimer: result[1],
      ipfsHash: result[2],
      reward: result[3],
      status: result[4],
      deadline: result[5],
    };
  }
}
