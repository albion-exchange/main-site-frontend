/**
 * Mock Blockchain API for E2E tests
 * Handles smart contract calls and wallet operations
 */

import { testDataProvider } from "../data/testData";

export class MockBlockchainAPI {
  private mockWallet: string | null = null;
  private originalViem: any;

  constructor() {
    // Store original implementations if needed
  }

  async start() {
    // Mock wagmi/viem contract calls
    this.mockContractCalls();
    console.log("Mock Blockchain API started");
  }

  async stop() {
    // Restore original implementations
    console.log("Mock Blockchain API stopped");
  }

  reset() {
    this.mockWallet = null;
  }

  connectWallet(address: string) {
    this.mockWallet = address;
  }

  disconnectWallet() {
    this.mockWallet = null;
  }

  getConnectedWallet() {
    return this.mockWallet;
  }

  private mockContractCalls() {
    // Mock the readContract function from @wagmi/core
    const originalModule = require('@wagmi/core');
    if (originalModule && originalModule.readContract) {
      const originalReadContract = originalModule.readContract;
      
      originalModule.readContract = async (config: any) => {
        const { address, functionName, args } = config;
        
        // Mock maxSharesSupply calls
        if (functionName === 'maxSharesSupply') {
          const response = testDataProvider.getContractResponse(`maxSharesSupply-${address}`);
          if (response) {
            return BigInt(response);
          }
        }

        // Mock balance calls
        if (functionName === 'balanceOf' && args?.length >= 1) {
          const [walletAddress] = args;
          if (walletAddress === this.mockWallet) {
            // Return mock balance for connected wallet
            const sftData = testDataProvider.getSftData();
            const sft = sftData.find(s => s.address.toLowerCase() === address.toLowerCase());
            if (sft) {
              const tokenHolder = sft.tokenHolders.find(th => th.address === walletAddress);
              return BigInt(tokenHolder?.balance || "0");
            }
          }
          return BigInt("0");
        }

        // For unhandled calls, try the original function or return default
        try {
          return await originalReadContract(config);
        } catch {
          return BigInt("0");
        }
      };
    }

    // Mock writeContract function for claiming
    if (originalModule && originalModule.writeContract) {
      const originalWriteContract = originalModule.writeContract;
      
      originalModule.writeContract = async (config: any) => {
        const { functionName } = config;
        
        if (functionName === 'takeOrders') {
          // Simulate successful claim transaction
          return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            wait: () => Promise.resolve({ status: 1 })
          };
        }

        // For other calls, try original or throw
        try {
          return await originalWriteContract(config);
        } catch (error) {
          throw new Error(`Mock blockchain: Unhandled write contract call: ${functionName}`);
        }
      };
    }
  }
}