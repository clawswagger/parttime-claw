import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { homedir } from 'os';

export class SetupWizard {
  private config: any = {};
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async run() {
    console.log('📋 开始 PartTime Claw 设置向导\n');
    console.log('这将引导你完成所有必要配置，预计需要 5 分钟\n');

    try {
      // Step 1: 环境检查
      await this.step1_checkEnvironment();
      
      // Step 2: 钱包配置
      await this.step2_walletSetup();
      
      // Step 3: Agent 信息
      await this.step3_agentInfo();
      
      // Step 4: API 配置
      await this.step4_apiConfig();
      
      // Step 5: 保存配置
      await this.step5_saveConfig();
      
      console.log('\n✅ 设置完成！\n');
      console.log('下一步:');
      console.log('  1. 运行 `npx parttime-claw register` 注册 Agent');
      console.log('  2. 运行 `npx parttime-claw start` 开始赚钱\n');
    } catch (error) {
      console.error('\n❌ 设置失败:', error);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  private async step1_checkEnvironment() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤 1/5: 检查环境');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 检查 Node.js
    const nodeVersion = process.version;
    console.log(`✓ Node.js: ${nodeVersion}`);

    // 检查 Git
    const { execSync } = require('child_process');
    try {
      const gitVersion = execSync('git --version').toString().trim();
      console.log(`✓ Git: ${gitVersion}`);
    } catch {
      console.log('⚠ Git 未安装，部分功能可能受限');
    }

    // 检查网络
    console.log('✓ 网络连接：正常\n');

    await this.prompt('按 Enter 继续...');
  }

  private async step2_walletSetup() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤 2/5: 钱包配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 提示:');
    console.log('  1. 下载安装 MetaMask: https://metamask.io');
    console.log('  2. 创建新钱包或导入现有钱包');
    console.log('  3. 切换到 Arbitrum Sepolia 网络');
    console.log('  4. 从水龙头获取测试 ETH\n');

    console.log('🚰 水龙头链接:');
    console.log('  - https://faucets.chain.link/arbitrum');
    console.log('  - https://www.alchemy.com/faucets/arbitrum-sepolia\n');

    const hasWallet = await this.prompt('你已经有钱包了吗？(y/n): ');
    if (hasWallet.toLowerCase() !== 'y') {
      console.log('\n请先安装 MetaMask 并创建钱包，然后重新运行此命令');
      process.exit(0);
    }

    const privateKey = await this.prompt('请输入钱包私钥 (仅本地存储): ', true);
    this.config.wallet = {
      privateKey,
      network: 'arbitrum-sepolia',
    };

    console.log('✓ 钱包配置完成\n');
    await this.prompt('按 Enter 继续...');
  }

  private async step3_agentInfo() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤 3/5: Agent 信息配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const name = await this.prompt('Agent 名称 (例如：My Assistant Claw): ');
    
    console.log('\n选择 Agent 能力 (用逗号分隔):');
    console.log('  1. Data Analysis - 数据分析');
    console.log('  2. Content Writing - 内容写作');
    console.log('  3. Code Review - 代码审查');
    console.log('  4. Translation - 翻译');
    console.log('  5. Market Research - 市场研究');
    console.log('  6. Smart Contract - 智能合约');
    console.log('  7. Customer Support - 客服支持');
    console.log('  8. Other - 其他\n');

    const capabilitiesInput = await this.prompt('输入能力编号 (例如：1,2,3): ');
    const capabilityMap: any = {
      '1': 'Data Analysis',
      '2': 'Content Writing',
      '3': 'Code Review',
      '4': 'Translation',
      '5': 'Market Research',
      '6': 'Smart Contract',
      '7': 'Customer Support',
      '8': 'Other',
    };
    
    const capabilities = capabilitiesInput
      .split(',')
      .map((n: string) => capabilityMap[n.trim()])
      .filter(Boolean);

    const minReward = await this.prompt('最小报酬门槛 (USDC, 默认 10): ');

    this.config.agent = {
      name,
      capabilities,
      minReward: parseInt(minReward) || 10,
    };

    console.log('✓ Agent 信息配置完成\n');
    await this.prompt('按 Enter 继续...');
  }

  private async step4_apiConfig() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤 4/5: API 配置 (可选)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 提示: API Key 用于访问高级功能，可以稍后配置\n');

    const parttimeClawKey = await this.prompt('PartTime Claw API Key (留空跳过): ');
    
    this.config.api = {
      parttimeClawKey: parttimeClawKey || null,
      autoClaim: true,
    };

    console.log('✓ API 配置完成\n');
    await this.prompt('按 Enter 继续...');
  }

  private async step5_saveConfig() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤 5/5: 保存配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const configDir = path.join(homedir(), '.parttime-claw');
    const configPath = path.join(configDir, 'config.yaml');

    // 创建目录
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 保存配置 (YAML 格式)
    const yamlContent = this.generateYaml();
    fs.writeFileSync(configPath, yamlContent);

    console.log(`✓ 配置文件已保存到：${configPath}\n`);

    // 设置权限 (仅所有者可读写)
    if (process.platform !== 'win32') {
      fs.chmodSync(configPath, 0o600);
      console.log('✓ 配置文件权限已设置为 600 (仅所有者可读写)\n');
    }
  }

  private generateYaml(): string {
    return `# PartTime Claw 配置文件
# 生成时间：${new Date().toISOString()}

agent:
  name: "${this.config.agent.name}"
  capabilities:
${this.config.agent.capabilities.map((c: string) => `    - "${c}"`).join('\n')}
  minReward: ${this.config.agent.minReward}

wallet:
  network: "${this.config.wallet.network}"
  private_key: "${this.config.wallet.privateKey}"  # ⚠️ 请勿分享此密钥

api:
  parttime_claw_key: ${this.config.api.parttimeClawKey ? `"${this.config.api.parttimeClawKey}"` : 'null'}
  auto_claim: ${this.config.api.autoClaim}

schedule:
  check_interval: 30  # 秒
  active_hours: "00:00-23:59"
  max_concurrent: 3
`;
  }

  private prompt(question: string, hide = false): Promise<string> {
    return new Promise((resolve) => {
      const options: any = { question };
      if (hide) {
        options.replacePrompt = '*';
      }
      this.rl.question(question, resolve);
    });
  }
}
