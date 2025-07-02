export interface TokenInfo {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  tokenType: 'royalty' | 'payment';
}

export interface TokenBalance {
  contractAddress: string;
  balance: bigint;
  formattedBalance: string;
}

export interface Payout {
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  amount: bigint;
  formattedAmount: string;
  recipient: string;
}

export interface UserTokenData {
  address: string;
  balances: TokenBalance[];
  payoutHistory: Payout[];
}