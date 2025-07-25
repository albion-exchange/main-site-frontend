/**
 * @fileoverview Claims data composable
 * Manages claims data and claiming functionality
 */

import { writable, derived, type Readable, type Writable } from "svelte/store";
import { useAssetService, useWalletDataService } from "$lib/services";
import { withSyncErrorHandling } from "$lib/utils/errorHandling";
import type { Asset } from "$lib/types/uiTypes";

interface ClaimsState {
  totalEarned: number;
  totalClaimed: number;
  unclaimedPayout: number;
  holdings: any[];
  claimHistory: any[];
  selectedAssets: string[];
  claimMethod: "wallet" | "exchange";
  estimatedGas: number;
  claiming: boolean;
  claimSuccess: boolean;
  loading: boolean;
  error: string | null;
}

interface ClaimModalState {
  show: boolean;
  mode: "claim" | "reinvest";
}

/**
 * Composable for managing claims data
 */
export function useClaimsData() {
  const assetService = useAssetService();
  const walletDataService = useWalletDataService();

  const state: Writable<ClaimsState> = writable({
    totalEarned: 0,
    totalClaimed: 0,
    unclaimedPayout: 0,
    holdings: [],
    claimHistory: [],
    selectedAssets: [],
    claimMethod: "wallet",
    estimatedGas: 0,
    claiming: false,
    claimSuccess: false,
    loading: true,
    error: null,
  });

  const claimModal: Writable<ClaimModalState> = writable({
    show: false,
    mode: "claim",
  });

  function loadClaimsData() {
    state.update((s) => ({ ...s, loading: true, error: null }));

    try {
      // Load wallet data
      const totalEarned = walletDataService.getTotalPayoutsEarned();
      const totalClaimed = walletDataService.getTotalClaimed();
      const unclaimedPayout = walletDataService.getUnclaimedPayouts();

      // Get holdings with unclaimed amounts
      const assetPayouts = walletDataService.getHoldingsByAsset();
      const allAssets =
        withSyncErrorHandling(() => assetService.getAllAssets(), {
          service: "AssetService",
          operation: "getAllAssets",
        }) || [];

      // Transform holdings data
      const holdings = assetPayouts
        .map((holding) => {
          const asset = allAssets.find((a) => a.id === holding.assetId);
          return {
            id: holding.assetId,
            name: holding.assetName,
            location: asset
              ? `${asset.location.state}, ${asset.location.country}`
              : "",
            unclaimedAmount: holding.unclaimedAmount,
            totalEarned: holding.totalEarned,
            lastClaimDate: holding.lastClaimDate,
            lastPayout: holding.lastPayoutDate,
            status: asset?.production.status || "unknown",
            asset,
          };
        })
        .filter((h) => h.unclaimedAmount > 0);

      // Get claim history
      const claimHistory = walletDataService.getClaimHistory();

      // Calculate estimated gas
      const estimatedGas = calculateEstimatedGas(holdings.length);

      state.update((s) => ({
        ...s,
        totalEarned,
        totalClaimed,
        unclaimedPayout,
        holdings,
        claimHistory,
        estimatedGas,
        loading: false,
      }));
    } catch (error) {
      state.update((s) => ({
        ...s,
        error:
          error instanceof Error ? error.message : "Failed to load claims data",
        loading: false,
      }));
    }
  }

  function calculateEstimatedGas(numAssets: number): number {
    // Base gas cost + per-asset cost
    const baseGas = 0.002; // ETH
    const perAssetGas = 0.0005; // ETH
    const ethPrice = 2500; // USD per ETH (would normally fetch from price feed)

    const totalGasEth = baseGas + numAssets * perAssetGas;
    return totalGasEth * ethPrice;
  }

  function toggleAssetSelection(assetId: string) {
    state.update((s) => {
      const selected = [...s.selectedAssets];
      const index = selected.indexOf(assetId);

      if (index >= 0) {
        selected.splice(index, 1);
      } else {
        selected.push(assetId);
      }

      return { ...s, selectedAssets: selected };
    });
  }

  function selectAllAssets() {
    state.update((s) => ({
      ...s,
      selectedAssets: s.holdings.map((h) => h.id),
    }));
  }

  function deselectAllAssets() {
    state.update((s) => ({
      ...s,
      selectedAssets: [],
    }));
  }

  async function claimPayouts(assetIds?: string[]) {
    const claimIds = assetIds || get(state).selectedAssets;
    if (claimIds.length === 0) return;

    state.update((s) => ({ ...s, claiming: true, claimSuccess: false }));

    try {
      // Simulate claim transaction
      await simulateClaimTransaction(claimIds);

      state.update((s) => ({
        ...s,
        claiming: false,
        claimSuccess: true,
        selectedAssets: [],
      }));

      // Reload data after successful claim
      setTimeout(() => {
        loadClaimsData();
        state.update((s) => ({ ...s, claimSuccess: false }));
      }, 2000);
    } catch (error) {
      state.update((s) => ({
        ...s,
        claiming: false,
        error: error instanceof Error ? error.message : "Claim failed",
      }));
    }
  }

  async function simulateClaimTransaction(assetIds: string[]) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random failure for demo
    if (Math.random() < 0.1) {
      throw new Error("Transaction failed. Please try again.");
    }
  }

  function showClaimModal(mode: "claim" | "reinvest" = "claim") {
    claimModal.set({ show: true, mode });
  }

  function hideClaimModal() {
    claimModal.set({ show: false, mode: "claim" });
  }

  // Derived values
  const selectedAmount = derived(state, ($state) => {
    if ($state.selectedAssets.length === 0) return 0;

    return $state.holdings
      .filter((h) => $state.selectedAssets.includes(h.id))
      .reduce((sum, h) => sum + h.unclaimedAmount, 0);
  });

  const claimStats = derived(state, ($state) => ({
    avgClaimSize:
      $state.claimHistory.length > 0
        ? $state.totalClaimed / $state.claimHistory.length
        : 0,
    totalClaims: $state.claimHistory.length,
    lastClaimDate:
      $state.claimHistory.length > 0 ? $state.claimHistory[0].date : null,
  }));

  // Initialize
  loadClaimsData();

  // Helper to get writable value
  function get<T>(store: Writable<T>): T {
    let value: T;
    const unsubscribe = store.subscribe((v) => {
      value = v;
    });
    unsubscribe();
    return value!;
  }

  return {
    state: { subscribe: state.subscribe },
    claimModal: { subscribe: claimModal.subscribe },
    selectedAmount,
    claimStats,
    loadClaimsData,
    toggleAssetSelection,
    selectAllAssets,
    deselectAllAssets,
    claimPayouts,
    showClaimModal,
    hideClaimModal,
  };
}
