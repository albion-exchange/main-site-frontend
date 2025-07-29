/**
 * @fileoverview Tooltip composable
 * Manages tooltip state and interactions
 */

import { writable, type Writable } from "svelte/store";

export interface TooltipState {
  visible: string; // ID of currently visible tooltip
  timer: number | null;
}

/**
 * Composable for managing tooltip visibility
 */
export function useTooltip() {
  const state: Writable<TooltipState> = writable({
    visible: "",
    timer: null,
  });

  const showTooltip = writable("");

  let currentTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Show tooltip with optional delay
   */
  function show(tooltipId: string, delay: number = 200): void {
    // Clear any existing timer
    if (currentTimer) {
      clearTimeout(currentTimer);
      currentTimer = null;
    }

    // Set new timer
    currentTimer = setTimeout(() => {
      state.update((s) => ({
        ...s,
        visible: tooltipId,
      }));
      showTooltip.set(tooltipId);
      currentTimer = null;
    }, delay);
  }

  /**
   * Hide tooltip immediately
   */
  function hide(): void {
    // Clear timer if exists
    if (currentTimer) {
      clearTimeout(currentTimer);
      currentTimer = null;
    }

    // Hide tooltip
    state.update((s) => ({
      ...s,
      visible: "",
    }));
    showTooltip.set("");
  }

  /**
   * Check if a specific tooltip is visible
   */
  function isVisible(tooltipId: string): boolean {
    let visible = false;
    const unsubscribe = state.subscribe((s) => {
      visible = s.visible === tooltipId;
    });
    unsubscribe();
    return visible;
  }

  /**
   * Toggle tooltip visibility
   */
  function toggle(tooltipId: string, delay: number = 200): void {
    if (isVisible(tooltipId)) {
      hide();
    } else {
      show(tooltipId, delay);
    }
  }

  /**
   * Show tooltip with delay (convenience function)
   */
  function showTooltipWithDelay(tooltipId: string, delay: number = 500): void {
    show(tooltipId, delay);
  }

  /**
   * Hide tooltip (convenience function)
   */
  function hideTooltip(): void {
    hide();
  }

  return {
    state: { subscribe: state.subscribe },
    showTooltip,
    show,
    hide,
    toggle,
    isVisible,
    showTooltipWithDelay,
    hideTooltip,
  };
}

/**
 * Tooltip content definitions
 */
export const tooltipContent = {
  // Asset detail tooltips
  "working-interest":
    "A percentage ownership in an oil and gas lease granting the holder the right to explore, drill, and produce oil and gas.",
  "benchmark-premium":
    "Price adjustment relative to benchmark crude oil prices. Negative values indicate a discount.",
  "transport-costs":
    'Cost to transport oil from wellhead to market. "Title transfer at well head" means no transport costs.',
  "water-cut":
    "Percentage of water produced along with oil. Lower is better for profitability.",
  "gas-proportion":
    "Ratio of natural gas to oil production. Affects revenue based on gas prices.",
  uptime: "Percentage of time the well is operational and producing.",

  // Portfolio tooltips
  "capital-returned":
    "The portion of your initial investment already recovered through payouts.",
  "asset-depletion":
    "Estimated percentage of recoverable reserves already produced.",
  "unrecovered-capital":
    "Amount of initial investment not yet returned through payouts.",

  // Financial tooltips
  "net-income": "Revenue minus operating expenses and royalties.",
  "payout-per-token": "Distribution amount per token for the period.",
  "production-volume":
    "Total oil and gas produced, measured in barrels of oil equivalent (BOE).",

  // General tooltips
  boe: "Barrels of Oil Equivalent - standardized measure combining oil and gas production.",
  mboe: "Thousand Barrels of Oil Equivalent.",
  mmbtu:
    "Million British Thermal Units - standard unit for natural gas pricing.",
};
