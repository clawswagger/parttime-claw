// OpenClaw Platform 合约 ABI 和地址配置
// 部署网络：Arbitrum Sepolia
// 部署时间：2026-03-22

export const CONTRACTS = {
  AgentRegistry: {
    address: '0x58cd7aBF671dA2dceE6359AA822f63d2Fcfb82eb' as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: '_name', type: 'string' },
          { name: '_capabilities', type: 'string[]' },
        ],
        name: 'registerAgent',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ name: '_agent', type: 'address' }],
        name: 'getAgent',
        outputs: [
          { name: 'name', type: 'string' },
          { name: 'capabilities', type: 'string[]' },
          { name: 'reputation', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'registeredAt', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
  },
  TaskPool: {
    address: '0x91d7bFd03045E56811545D9e9a2c6A20ee0d58f0' as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: '_ipfsHash', type: 'string' },
          { name: '_reward', type: 'uint256' },
          { name: '_deadline', type: 'uint256' },
        ],
        name: 'createTask',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ name: '_taskId', type: 'uint256' }],
        name: 'claimTask',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          { name: '_taskId', type: 'uint256' },
          { name: '_resultIpfsHash', type: 'string' },
        ],
        name: 'submitResult',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ name: '_taskId', type: 'uint256' }],
        name: 'getTask',
        outputs: [
          { name: 'publisher', type: 'address' },
          { name: 'claimer', type: 'address' },
          { name: 'ipfsHash', type: 'string' },
          { name: 'reward', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'deadline', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
  },
  Settlement: {
    address: '0xC0F04935BB3fE63Af0390Fe9B4a186CC2B2Eb080' as `0x${string}`,
    abi: [
      {
        inputs: [{ name: '_taskPool', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        inputs: [{ name: '_taskId', type: 'uint256' }],
        name: 'escrowTask',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [{ name: '_taskId', type: 'uint256' }],
        name: 'releasePayment',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ name: '_user', type: 'address' }],
        name: 'getBalance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
  },
  Reputation: {
    address: '0x6FB253f37061223F4EE7adA8fdf1c595C7AB5874' as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: '_user', type: 'address' },
          { name: '_taskId', type: 'uint256' },
          { name: '_rating', type: 'uint256' },
        ],
        name: 'recordTaskCompletion',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ name: '_user', type: 'address' }],
        name: 'calculateReputationScore',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
  },
} as const;

export const CHAIN_CONFIG = {
  chainId: 421614,
  name: 'Arbitrum Sepolia',
  rpcUrl: 'https://arbitrum-sepolia.infura.io/v3/c270191b38804ce1bc00515cf9b91b19',
  blockExplorer: 'https://sepolia.arbiscan.io',
} as const;
