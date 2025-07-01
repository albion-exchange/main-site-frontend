import { createPublicClient, http, formatUnits, type Address, type PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import type { TokenInfo, TokenBalance, Distribution, UserTokenData } from '$lib/types';

// ERC20 ABI for basic token operations
const ERC20_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Transfer event ABI for distribution history
const TRANSFER_EVENT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  }
] as const;

export class TokenService {
  private static publicClient: PublicClient;
  
  static initialize(chainId: number = 1) {
    const chain = chainId === 1 ? mainnet : sepolia;
    this.publicClient = createPublicClient({
      chain,
      transport: http()
    });
  }

  /**
   * Get token information from contract
   */
  static async getTokenInfo(contractAddress: Address): Promise<TokenInfo | null> {
    try {
      if (!this.publicClient) this.initialize();

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: 'name'
        }),
        this.publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: 'symbol'
        }),
        this.publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: 'decimals'
        }),
        this.publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: 'totalSupply'
        })
      ]);

      // Determine token type based on symbol (simple heuristic)
      const tokenType = symbol.toLowerCase().includes('royalty') || symbol.toLowerCase().includes('roy') 
        ? 'royalty' as const 
        : 'payment' as const;

      return {
        contractAddress,
        name,
        symbol,
        decimals,
        totalSupply,
        tokenType
      };
    } catch (error) {
      console.error(`Error fetching token info for ${contractAddress}:`, error);
      return null;
    }
  }

  /**
   * Get token balance for a user
   */
  static async getTokenBalance(contractAddress: Address, userAddress: Address): Promise<TokenBalance | null> {
    try {
      if (!this.publicClient) this.initialize();

      const [balance, decimals] = await Promise.all([
        this.publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [userAddress]
        }),
        this.publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: 'decimals'
        })
      ]);

      return {
        contractAddress,
        balance,
        formattedBalance: formatUnits(balance, decimals)
      };
    } catch (error) {
      console.error(`Error fetching balance for ${contractAddress}:`, error);
      return null;
    }
  }

  /**
   * Get user's distribution history (transfers to their address)
   */
  static async getDistributionHistory(contractAddress: Address, userAddress: Address, fromBlock: bigint = 0n): Promise<Distribution[]> {
    try {
      if (!this.publicClient) this.initialize();

      const logs = await this.publicClient.getLogs({
        address: contractAddress,
        event: TRANSFER_EVENT_ABI[0],
        args: {
          to: userAddress
        },
        fromBlock,
        toBlock: 'latest'
      });

      const decimals = await this.publicClient.readContract({
        address: contractAddress,
        abi: ERC20_ABI,
        functionName: 'decimals'
      });

      const distributions: Distribution[] = [];
      
      for (const log of logs) {
        // Skip minting events (from zero address)
        if (log.args.from === '0x0000000000000000000000000000000000000000') continue;

        const block = await this.publicClient.getBlock({ blockNumber: log.blockNumber });
        
        distributions.push({
          blockNumber: Number(log.blockNumber),
          transactionHash: log.transactionHash,
          timestamp: Number(block.timestamp),
          amount: log.args.value,
          formattedAmount: formatUnits(log.args.value, decimals),
          recipient: userAddress
        });
      }

      return distributions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error(`Error fetching distribution history for ${contractAddress}:`, error);
      return [];
    }
  }

  /**
   * Get all token data for a user across multiple contracts
   */
  static async getUserTokenData(userAddress: Address, contractAddresses: Address[]): Promise<UserTokenData> {
    if (!this.publicClient) this.initialize();

    const balances: TokenBalance[] = [];
    const allDistributions: Distribution[] = [];

    for (const contractAddress of contractAddresses) {
      const balance = await this.getTokenBalance(contractAddress, userAddress);
      if (balance) {
        balances.push(balance);
      }

      const distributions = await this.getDistributionHistory(contractAddress, userAddress);
      allDistributions.push(...distributions);
    }

    return {
      address: userAddress,
      balances,
      distributionHistory: allDistributions.sort((a, b) => b.timestamp - a.timestamp)
    };
  }

  /**
   * Get multiple token infos at once
   */
  static async getTokenInfos(contractAddresses: Address[]): Promise<TokenInfo[]> {
    const tokenInfos: TokenInfo[] = [];
    
    for (const address of contractAddresses) {
      const info = await this.getTokenInfo(address);
      if (info) {
        tokenInfos.push(info);
      }
    }

    return tokenInfos;
  }
}