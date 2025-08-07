/**
 * Claims Store
 * 
 * Manages payout claims data from CSV sources
 */

import { writable, derived, get } from 'svelte/store';
import { signerAddress } from 'svelte-wagmi';
import { ENERGY_FIELDS, type Claim } from '$lib/network';
import { getTradesForClaims } from '$lib/queries/getTrades';
import { getOrder } from '$lib/queries/getOrder';
import { 
  fetchAndValidateCSV, 
  sortClaimsData,
  type ClaimHistory 
} from '$lib/utils/claims';
import { fetchWithRetry } from '$lib/utils/fetchWithRetry';

// Claims Types
export interface ProcessedClaim {
  claim: Claim;
  energyField: string;
  amount: number;
  date: string;
  status: 'pending' | 'claimed' | 'expired';
  txHash?: string;
  orderHash: string;
  merkleProof?: string[];
}

export interface ClaimGroup {
  energyField: string;
  claims: ProcessedClaim[];
  totalAmount: number;
  unclaimedAmount: number;
  claimedAmount: number;
}

export interface ClaimsState {
  address: string | null;
  allClaims: ProcessedClaim[];
  claimGroups: ClaimGroup[];
  totalEarned: number;
  totalClaimed: number;
  unclaimedPayout: number;
  csvData: Map<string, ClaimHistory[]>; // energyField -> claims
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Initialize store
const initialState: ClaimsState = {
  address: null,
  allClaims: [],
  claimGroups: [],
  totalEarned: 0,
  totalClaimed: 0,
  unclaimedPayout: 0,
  csvData: new Map(),
  loading: false,
  error: null,
  lastSync: null
};

// Main store
export const claimsStore = writable<ClaimsState>(initialState);

/**
 * Fetch claims data for a specific energy field
 */
async function fetchFieldClaims(
  fieldName: string, 
  walletAddress: string
): Promise<ClaimHistory[]> {
  const field = ENERGY_FIELDS.find(f => f.name === fieldName);
  if (!field?.claims) return [];

  try {
    // Fetch and validate CSV
    const csvData = await fetchAndValidateCSV(field.claims);
    if (!csvData) return [];

    // Sort and filter for this wallet
    const sortedData = sortClaimsData(csvData);
    return sortedData.filter(
      claim => claim.Wallet.toLowerCase() === walletAddress.toLowerCase()
    );
  } catch (error) {
    console.error(`Failed to fetch claims for ${fieldName}:`, error);
    return [];
  }
}

/**
 * Process claims with trade data
 */
async function processClaims(
  claims: Claim[],
  fieldName: string,
  walletAddress: string
): Promise<ProcessedClaim[]> {
  const processed: ProcessedClaim[] = [];

  for (const claim of claims) {
    try {
      // Fetch trade data
      const trades = await getTradesForClaims(
        claim.orderHash, 
        walletAddress, 
        fieldName
      );
      
      const orderDetails = await getOrder(claim.orderHash);
      
      let status: 'pending' | 'claimed' | 'expired' = 'pending';
      let txHash: string | undefined;
      
      if (orderDetails && orderDetails.length > 0) {
        const order = orderDetails[0];
        if (order.cleared) {
          status = 'claimed';
          // Get transaction hash from trades
          txHash = trades?.[0]?.transactionHash;
        }
      }
      
      processed.push({
        claim,
        energyField: fieldName,
        amount: Number(claim.amount),
        date: claim.date,
        status,
        txHash,
        orderHash: claim.orderHash
      });
    } catch (error) {
      console.error(`Failed to process claim ${claim.orderHash}:`, error);
      // Still add the claim with basic info
      processed.push({
        claim,
        energyField: fieldName,
        amount: Number(claim.amount),
        date: claim.date,
        status: 'pending',
        orderHash: claim.orderHash
      });
    }
  }

  return processed;
}

/**
 * Sync claims data for the connected wallet
 */
export async function syncClaimsData(walletAddress?: string): Promise<void> {
  const address = walletAddress || get(signerAddress);
  
  if (!address) {
    claimsStore.set(initialState);
    return;
  }

  claimsStore.update(state => ({ 
    ...state, 
    loading: true, 
    error: null,
    address 
  }));

  try {
    const allClaims: ProcessedClaim[] = [];
    const claimGroups: ClaimGroup[] = [];
    const csvData = new Map<string, ClaimHistory[]>();
    
    // Process each energy field in parallel
    const fieldPromises = ENERGY_FIELDS.map(async field => {
      if (!field.claims) return null;
      
      // Fetch CSV data
      const fieldClaims = await fetchFieldClaims(field.name, address);
      if (fieldClaims.length === 0) return null;
      
      // Store raw CSV data
      csvData.set(field.name, fieldClaims);
      
      // Convert to Claim format
      const claims: Claim[] = fieldClaims.map(csvClaim => ({
        orderHash: csvClaim['Order Hash'] || '',
        amount: csvClaim['USDC (est)']?.toString() || '0',
        date: csvClaim['Date'] || '',
        // Add other necessary fields
      }));
      
      // Process claims with trade data
      const processed = await processClaims(claims, field.name, address);
      
      // Calculate totals for this field
      const totalAmount = processed.reduce((sum, c) => sum + c.amount, 0);
      const claimedAmount = processed
        .filter(c => c.status === 'claimed')
        .reduce((sum, c) => sum + c.amount, 0);
      const unclaimedAmount = totalAmount - claimedAmount;
      
      return {
        energyField: field.name,
        claims: processed,
        totalAmount,
        claimedAmount,
        unclaimedAmount
      };
    });
    
    // Wait for all fields to complete
    const results = await Promise.all(fieldPromises);
    
    // Filter out null results and compile data
    results.forEach(result => {
      if (result) {
        claimGroups.push(result);
        allClaims.push(...result.claims);
      }
    });
    
    // Calculate overall totals
    const totalEarned = allClaims.reduce((sum, c) => sum + c.amount, 0);
    const totalClaimed = allClaims
      .filter(c => c.status === 'claimed')
      .reduce((sum, c) => sum + c.amount, 0);
    const unclaimedPayout = totalEarned - totalClaimed;
    
    // Sort claims by date (newest first)
    allClaims.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Update store
    claimsStore.update(state => ({
      ...state,
      allClaims,
      claimGroups,
      totalEarned,
      totalClaimed,
      unclaimedPayout,
      csvData,
      loading: false,
      error: null,
      lastSync: new Date()
    }));
    
  } catch (error) {
    console.error('Failed to sync claims:', error);
    claimsStore.update(state => ({
      ...state,
      loading: false,
      error: error instanceof Error ? error.message : 'Failed to load claims'
    }));
  }
}

/**
 * Get claims for a specific energy field
 */
export function getClaimsByField(fieldName: string) {
  return derived(claimsStore, $store => 
    $store.claimGroups.find(g => g.energyField === fieldName) || null
  );
}

/**
 * Get unclaimed claims only
 */
export const unclaimedClaims = derived(claimsStore, $store =>
  $store.allClaims.filter(c => c.status === 'pending')
);

/**
 * Get recent claims (last 10)
 */
export const recentClaims = derived(claimsStore, $store =>
  $store.allClaims.slice(0, 10)
);

/**
 * Check if user has any unclaimed payouts
 */
export const hasUnclaimedPayouts = derived(claimsStore, $store =>
  $store.unclaimedPayout > 0
);

// Auto-sync when wallet changes
signerAddress.subscribe(address => {
  if (address) {
    syncClaimsData(address);
  } else {
    claimsStore.set(initialState);
  }
});

// Export loading and error states
export const isLoadingClaims = derived(
  claimsStore, 
  $store => $store.loading
);

export const claimsError = derived(
  claimsStore, 
  $store => $store.error
);