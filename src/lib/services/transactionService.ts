/**
 * Transaction Service
 * 
 * Handles all blockchain transactions, particularly token purchases
 * Provides a clean abstraction over wagmi/viem for transaction management
 */

import { 
  readContract, 
  writeContract, 
  waitForTransactionReceipt, 
  simulateContract 
} from '@wagmi/core';
import { get } from 'svelte/store';
import { wagmiConfig, signerAddress } from 'svelte-wagmi';
import { formatEther, parseUnits, type Hex } from 'viem';
import { tokenStore, getTokenByAddress } from '$lib/stores/tokenStore';
import { syncPortfolioData } from '$lib/stores/portfolioStore';
import type { OffchainAssetReceiptVault } from '$lib/types/offchainAssetReceiptVaultTypes';

// ABIs
import authorizerAbi from '$lib/abi/authorizer.json';
import OffchainAssetReceiptVaultAbi from '$lib/abi/OffchainAssetReceiptVault.json';
import orderbookAbi from '$lib/abi/orderbook.json';

// ERC20 ABI (minimal)
const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  }
] as const;

// Transaction Types
export interface TransactionStatus {
  status: 'idle' | 'approving' | 'approved' | 'confirming' | 'confirmed' | 'failed';
  message?: string;
  txHash?: string;
  error?: Error;
}

export interface PurchaseParams {
  tokenAddress: string;
  amount: string; // Human-readable amount
  onStatusChange?: (status: TransactionStatus) => void;
}

export interface ClaimParams {
  orderBookAddress: string;
  orderHashes: string[];
  onStatusChange?: (status: TransactionStatus) => void;
}

/**
 * Purchase a token
 */
export async function purchaseToken({
  tokenAddress,
  amount,
  onStatusChange
}: PurchaseParams): Promise<void> {
  const updateStatus = (status: TransactionStatus) => {
    onStatusChange?.(status);
  };

  try {
    updateStatus({ status: 'approving', message: 'Preparing transaction...' });

    // Get current state
    const config = get(wagmiConfig);
    const userAddress = get(signerAddress);
    if (!userAddress) throw new Error('Wallet not connected');

    // Get token data
    const tokenState = get(tokenStore);
    const sft = tokenState.rawSfts.find(
      s => s.id.toLowerCase() === tokenAddress.toLowerCase()
    );
    if (!sft) throw new Error('Token not found');

    // Get payment token details
    const paymentToken = await readContract(config, {
      abi: authorizerAbi,
      address: sft.activeAuthorizer?.address as Hex,
      functionName: 'paymentToken',
      args: []
    });

    const paymentTokenDecimals = await readContract(config, {
      abi: erc20Abi,
      address: paymentToken as Hex,
      functionName: 'decimals',
      args: []
    });

    // Calculate amount in wei
    const amountInWei = parseUnits(amount, paymentTokenDecimals as number);

    // Check user balance
    const userBalance = await readContract(config, {
      abi: erc20Abi,
      address: paymentToken as Hex,
      functionName: 'balanceOf',
      args: [userAddress as Hex]
    });

    if (userBalance < amountInWei) {
      throw new Error('Insufficient balance');
    }

    // Check current allowance
    const currentAllowance = await readContract(config, {
      abi: erc20Abi,
      address: paymentToken as Hex,
      functionName: 'allowance',
      args: [userAddress as Hex, sft.activeAuthorizer?.address as Hex]
    });

    // Approve if needed
    if (currentAllowance < amountInWei) {
      updateStatus({ 
        status: 'approving', 
        message: 'Requesting token approval...' 
      });

      // Simulate approval
      const { request: approvalRequest } = await simulateContract(config, {
        abi: erc20Abi,
        address: paymentToken as Hex,
        functionName: 'approve',
        args: [sft.activeAuthorizer?.address as Hex, amountInWei]
      });

      // Execute approval
      const approvalHash = await writeContract(config, approvalRequest);
      
      updateStatus({ 
        status: 'approving', 
        message: 'Waiting for approval confirmation...',
        txHash: approvalHash 
      });

      // Wait for approval
      await waitForTransactionReceipt(config, { 
        hash: approvalHash as Hex 
      });

      updateStatus({ 
        status: 'approved', 
        message: 'Approval confirmed' 
      });
    }

    // Simulate deposit
    updateStatus({ 
      status: 'confirming', 
      message: 'Preparing deposit transaction...' 
    });

    const { request: depositRequest } = await simulateContract(config, {
      abi: OffchainAssetReceiptVaultAbi,
      address: tokenAddress as Hex,
      functionName: 'deposit',
      args: [amountInWei, userAddress]
    });

    // Execute deposit
    const depositHash = await writeContract(config, depositRequest);
    
    updateStatus({ 
      status: 'confirming', 
      message: 'Waiting for deposit confirmation...',
      txHash: depositHash 
    });

    // Wait for confirmation
    await waitForTransactionReceipt(config, { 
      hash: depositHash as Hex 
    });

    updateStatus({ 
      status: 'confirmed', 
      message: 'Purchase successful!',
      txHash: depositHash 
    });

    // Sync portfolio after successful purchase
    await syncPortfolioData();

  } catch (error) {
    console.error('Purchase failed:', error);
    updateStatus({ 
      status: 'failed', 
      error: error instanceof Error ? error : new Error('Purchase failed'),
      message: error instanceof Error ? error.message : 'Purchase failed'
    });
    throw error;
  }
}

/**
 * Claim payouts
 */
export async function claimPayouts({
  orderBookAddress,
  orderHashes,
  onStatusChange
}: ClaimParams): Promise<void> {
  const updateStatus = (status: TransactionStatus) => {
    onStatusChange?.(status);
  };

  try {
    updateStatus({ 
      status: 'confirming', 
      message: 'Preparing claim transaction...' 
    });

    const config = get(wagmiConfig);
    const userAddress = get(signerAddress);
    if (!userAddress) throw new Error('Wallet not connected');

    // Simulate claim
    const { request } = await simulateContract(config, {
      abi: orderbookAbi,
      address: orderBookAddress as Hex,
      functionName: 'clear',
      args: [orderHashes]
    });

    // Execute claim
    const txHash = await writeContract(config, request);
    
    updateStatus({ 
      status: 'confirming', 
      message: 'Waiting for claim confirmation...',
      txHash 
    });

    // Wait for confirmation
    await waitForTransactionReceipt(config, { 
      hash: txHash as Hex 
    });

    updateStatus({ 
      status: 'confirmed', 
      message: 'Claim successful!',
      txHash 
    });

    // Sync portfolio after successful claim
    await syncPortfolioData();

  } catch (error) {
    console.error('Claim failed:', error);
    updateStatus({ 
      status: 'failed', 
      error: error instanceof Error ? error : new Error('Claim failed'),
      message: error instanceof Error ? error.message : 'Claim failed'
    });
    throw error;
  }
}

/**
 * Get token purchase details (price, available supply, etc.)
 */
export async function getTokenPurchaseInfo(tokenAddress: string) {
  const config = get(wagmiConfig);
  const tokenState = get(tokenStore);
  
  const sft = tokenState.rawSfts.find(
    s => s.id.toLowerCase() === tokenAddress.toLowerCase()
  );
  
  if (!sft || !sft.activeAuthorizer) {
    throw new Error('Token not found or not available for purchase');
  }

  // Get payment token
  const paymentToken = await readContract(config, {
    abi: authorizerAbi,
    address: sft.activeAuthorizer.address as Hex,
    functionName: 'paymentToken',
    args: []
  });

  // Get price per share
  const pricePerShare = await readContract(config, {
    abi: authorizerAbi,
    address: sft.activeAuthorizer.address as Hex,
    functionName: 'pricePerShare',
    args: []
  });

  // Get max shares
  const maxShares = await readContract(config, {
    abi: authorizerAbi,
    address: sft.activeAuthorizer.address as Hex,
    functionName: 'maxShares',
    args: []
  });

  // Get current supply
  const currentSupply = sft.totalShares || '0';
  const availableSupply = BigInt(maxShares as string) - BigInt(currentSupply);

  return {
    paymentToken: paymentToken as string,
    pricePerShare: BigInt(pricePerShare as string),
    maxShares: BigInt(maxShares as string),
    currentSupply: BigInt(currentSupply),
    availableSupply,
    authorizerAddress: sft.activeAuthorizer.address
  };
}

/**
 * Estimate gas for a token purchase
 */
export async function estimatePurchaseGas(
  tokenAddress: string,
  amount: string
): Promise<bigint> {
  try {
    const config = get(wagmiConfig);
    const userAddress = get(signerAddress);
    if (!userAddress) throw new Error('Wallet not connected');

    const info = await getTokenPurchaseInfo(tokenAddress);
    const amountInWei = parseUnits(amount, 18); // Assuming 18 decimals

    // Simulate to get gas estimate
    const simulation = await simulateContract(config, {
      abi: OffchainAssetReceiptVaultAbi,
      address: tokenAddress as Hex,
      functionName: 'deposit',
      args: [amountInWei, userAddress]
    });

    // Return a conservative estimate (simulation gas * 1.2)
    return BigInt(Math.floor(Number(simulation.request.gas || 300000n) * 1.2));
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return 300000n; // Return default gas limit
  }
}