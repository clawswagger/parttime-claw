#!/usr/bin/env node
/**
 * PartTime Claw - 配置文件加密工具
 * 
 * 使用 AES-256-GCM 加密敏感配置 (私钥、API Key 等)
 * 加密后的配置文件可以安全存储和传输
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(text) {
  return new Promise((resolve) => {
    rl.question(text, resolve);
  });
}

/**
 * 从密码派生加密密钥
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * 加密数据
 */
function encrypt(data, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    salt,
    iv,
    authTag,
    encrypted,
  };
}

/**
 * 解密数据
 */
function decrypt(encryptedData, password) {
  const { salt, iv, authTag, encrypted } = encryptedData;
  
  const key = deriveKey(password, Buffer.from(salt, 'hex'));
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'), {
    authTagLength: AUTH_TAG_LENGTH,
  });
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

/**
 * 加密配置文件
 */
async function encryptConfig() {
  console.log('🔐 PartTime Claw - 配置加密工具\n');
  
  const configPath = path.join(process.cwd(), 'config.json');
  const encryptedPath = path.join(process.cwd(), 'config.enc.json');
  
  if (!fs.existsSync(configPath)) {
    console.log(`❌ 配置文件不存在：${configPath}`);
    console.log('请先运行设置向导创建配置文件');
    process.exit(1);
  }
  
  // 读取配置
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // 识别敏感字段
  const sensitiveFields = ['privateKey', 'api_key', 'secret', 'password'];
  const sensitiveData = {};
  const nonSensitiveData = { ...config };
  
  function extractSensitive(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
        sensitiveData[fullPath] = value;
        delete nonSensitiveData[key];
      } else if (typeof value === 'object' && value !== null) {
        extractSensitive(value, fullPath);
      }
    }
  }
  
  extractSensitive(config);
  
  console.log('📋 待加密的敏感字段:');
  Object.keys(sensitiveData).forEach(key => {
    console.log(`   - ${key}`);
  });
  
  const password = await question('\n请输入加密密码: ');
  const confirmPassword = await question('确认加密密码: ');
  
  if (password !== confirmPassword) {
    console.log('\n❌ 密码不匹配!');
    process.exit(1);
  }
  
  // 加密敏感数据
  const encrypted = encrypt(sensitiveData, password);
  
  // 保存加密配置
  const output = {
    version: '1.0',
    encrypted: true,
    algorithm: ALGORITHM,
    data: {
      salt: encrypted.salt.toString('hex'),
      iv: encrypted.iv.toString('hex'),
      authTag: encrypted.authTag,
      encrypted: encrypted.encrypted,
    },
    nonSensitive: nonSensitiveData,
    createdAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(encryptedPath, JSON.stringify(output, null, 2));
  
  // 设置文件权限 (仅所有者可读写)
  if (process.platform !== 'win32') {
    fs.chmodSync(encryptedPath, 0o600);
  }
  
  console.log('\n✅ 加密完成!');
  console.log(`   加密文件：${encryptedPath}`);
  console.log(`   权限：600 (仅所有者可读写)`);
  
  console.log('\n💡 提示:');
  console.log('   - 请妥善保管密码，丢失后无法恢复');
  console.log('   - 运行 `decrypt-config.js` 解密配置');
  console.log('   - 原始配置文件建议安全删除\n');
  
  rl.close();
}

/**
 * 解密配置文件
 */
async function decryptConfig() {
  console.log('🔓 PartTime Claw - 配置解密工具\n');
  
  const encryptedPath = path.join(process.cwd(), 'config.enc.json');
  const decryptedPath = path.join(process.cwd(), 'config.json');
  
  if (!fs.existsSync(encryptedPath)) {
    console.log(`❌ 加密文件不存在：${encryptedPath}`);
    process.exit(1);
  }
  
  const encryptedData = JSON.parse(fs.readFileSync(encryptedPath, 'utf8'));
  
  if (!encryptedData.encrypted) {
    console.log('❌ 这不是加密配置文件');
    process.exit(1);
  }
  
  const password = await question('请输入解密密码: ');
  
  try {
    const decrypted = decrypt(encryptedData.data, password);
    
    const output = {
      ...encryptedData.nonSensitive,
      ...decrypted,
    };
    
    fs.writeFileSync(decryptedPath, JSON.stringify(output, null, 2));
    
    console.log('\n✅ 解密完成!');
    console.log(`   解密文件：${decryptedPath}`);
    
    rl.close();
  } catch (error) {
    console.log('\n❌ 解密失败：密码错误或文件损坏');
    rl.close();
    process.exit(1);
  }
}

// 主程序
async function main() {
  const action = process.argv[2];
  
  if (action === 'encrypt') {
    await encryptConfig();
  } else if (action === 'decrypt') {
    await decryptConfig();
  } else {
    console.log('用法：node encrypt-config.js [encrypt|decrypt]');
    console.log('');
    console.log('命令:');
    console.log('  encrypt  - 加密配置文件');
    console.log('  decrypt  - 解密配置文件');
    process.exit(1);
  }
}

main();
