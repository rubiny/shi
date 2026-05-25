'use client';

// $SHIT Token on Base Network
// Deploy the contract and update SHIT_TOKEN_ADDRESS

const SHIT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SHIT_TOKEN_CONTRACT || '';
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org';
const BASE_CHAIN_ID = 8453;

// ERC20 ABI (minimal)
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// Staking contract ABI
const STAKING_ABI = [
  'function stake(uint256 amount, uint256 lockDays) external',
  'function unstake(uint256 positionId) external',
  'function claimRewards(uint256 positionId) external',
  'function getPosition(uint256 positionId) view returns (uint256 amount, uint256 lockDays, uint256 startedAt, uint256 rewards, bool isUnstaked)',
  'function getUserPositions(address user) view returns (uint256[])',
  'function getAPY(uint256 lockDays) view returns (uint256)',
];

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface StakingPosition {
  id: number;
  amount: string;
  lockDays: number;
  startedAt: number;
  rewards: string;
  isUnstaked: boolean;
}

// Ethereum provider interaction (via window.ethereum)
async function getProvider() {
  if (typeof window === 'undefined') return null;
  const ethereum = (window as unknown as Record<string, unknown>).ethereum as {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
  } | undefined;
  return ethereum || null;
}

export async function connectWallet(): Promise<string | null> {
  const provider = await getProvider();
  if (!provider) return null;

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function switchToBase(): Promise<boolean> {
  const provider = await getProvider();
  if (!provider) return false;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    // Chain not added — add it
    if (err.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: 'Base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: [BASE_RPC_URL],
            blockExplorerUrls: ['https://basescan.org'],
          }],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function getTokenBalance(walletAddress: string): Promise<string> {
  if (!SHIT_TOKEN_ADDRESS) return '0';

  try {
    const response = await fetch(BASE_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SHIT_TOKEN_ADDRESS,
          data: `0x70a08231000000000000000000000000${walletAddress.slice(2)}`,
        }, 'latest'],
        id: 1,
      }),
    });

    const result = await response.json();
    const balance = BigInt(result.result || '0x0');
    return (balance / BigInt(10 ** 18)).toString();
  } catch {
    return '0';
  }
}

export const contractConfig = {
  tokenAddress: SHIT_TOKEN_ADDRESS,
  chainId: BASE_CHAIN_ID,
  rpcUrl: BASE_RPC_URL,
  explorerUrl: 'https://basescan.org',
  tokenAbi: ERC20_ABI,
  stakingAbi: STAKING_ABI,
};
