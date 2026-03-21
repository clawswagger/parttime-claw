import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export class ConfigManager {
  private static configPath = path.join(homedir(), '.parttime-claw', 'config.yaml');

  static load(): any {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(
        '配置文件不存在，请先运行：npx parttime-claw setup'
      );
    }

    const content = fs.readFileSync(this.configPath, 'utf-8');
    return this.parseYaml(content);
  }

  static save(config: any) {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const yaml = this.generateYaml(config);
    fs.writeFileSync(this.configPath, yaml);
    
    // 设置权限
    if (process.platform !== 'win32') {
      fs.chmodSync(this.configPath, 0o600);
    }
  }

  static exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  private static parseYaml(yaml: string): any {
    // 简化的 YAML 解析 (实际应该使用 js-yaml 库)
    const config: any = {};
    const lines = yaml.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.trim().startsWith('#') || line.trim() === '') continue;

      if (!line.startsWith(' ') && line.endsWith(':')) {
        currentSection = line.slice(0, -1);
        config[currentSection] = {};
      } else if (line.includes(':') && currentSection) {
        const [key, value] = line.split(':').map(s => s.trim());
        config[currentSection][key] = value.replace(/"/g, '');
      }
    }

    return config;
  }

  private static generateYaml(config: any): string {
    // 简化的 YAML 生成
    return `# PartTime Claw 配置文件
agent:
  name: "${config.agent?.name}"
  minReward: ${config.agent?.minReward}
wallet:
  network: "${config.wallet?.network}"
  private_key: "${config.wallet?.privateKey}"
`;
  }
}
