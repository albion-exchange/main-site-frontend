/**
 * Asset metrics composable
 * Extracts asset-related calculations and formatting from components
 */

import { derived, type Readable } from 'svelte/store';
import type { CoreAsset, CoreOperationalMetrics } from '$lib/types/core';
import { formatters } from '$lib/utils/formatters';

export interface AssetMetrics {
  uptime: number | null;
  formattedUptime: string;
  currentProduction: number;
  formattedCurrentProduction: string;
  incidentFreeDays: number | null;
  formattedIncidentFreeDays: string;
  lastIncidentDate: Date | null;
  formattedLastIncidentDate: string;
  safetyRating: string | null;
  dailyTarget: number | null;
  productionEfficiency: number | null;
  formattedProductionEfficiency: string;
}

/**
 * Create asset metrics composable
 */
export function useAssetMetrics(asset: Readable<CoreAsset | null>) {
  const metrics = derived(asset, ($asset): AssetMetrics => {
    if (!$asset) {
      return {
        uptime: null,
        formattedUptime: 'N/A',
        currentProduction: 0,
        formattedCurrentProduction: 'N/A',
        incidentFreeDays: null,
        formattedIncidentFreeDays: 'N/A',
        lastIncidentDate: null,
        formattedLastIncidentDate: 'N/A',
        safetyRating: null,
        dailyTarget: null,
        productionEfficiency: null,
        formattedProductionEfficiency: 'N/A'
      };
    }

    const operationalMetrics = $asset.operationalMetrics;
    const uptime = operationalMetrics?.uptime?.percentage ?? null;
    const currentProduction = $asset.currentProduction;
    const incidentFreeDays = operationalMetrics?.hseMetrics?.incidentFreeDays ?? null;
    const lastIncidentDate = operationalMetrics?.hseMetrics?.lastIncidentDate ?? null;
    const safetyRating = operationalMetrics?.hseMetrics?.safetyRating ?? null;
    const dailyTarget = operationalMetrics?.dailyProduction?.target ?? null;
    
    // Calculate production efficiency
    const productionEfficiency = dailyTarget && currentProduction 
      ? (currentProduction / dailyTarget) * 100 
      : null;

    return {
      uptime,
      formattedUptime: uptime ? formatters.percentage(uptime, 1) : 'N/A',
      currentProduction,
      formattedCurrentProduction: formatters.production.daily(currentProduction),
      incidentFreeDays,
      formattedIncidentFreeDays: incidentFreeDays ? formatters.period.days(incidentFreeDays) : 'N/A',
      lastIncidentDate,
      formattedLastIncidentDate: lastIncidentDate 
        ? formatters.date.monthYear(lastIncidentDate) 
        : 'Never',
      safetyRating,
      dailyTarget,
      productionEfficiency,
      formattedProductionEfficiency: productionEfficiency 
        ? formatters.percentage(productionEfficiency, 1) 
        : 'N/A'
    };
  });

  return {
    metrics,
    // Computed individual metrics for easy access
    uptime: derived(metrics, m => m.uptime),
    formattedUptime: derived(metrics, m => m.formattedUptime),
    currentProduction: derived(metrics, m => m.currentProduction),
    formattedCurrentProduction: derived(metrics, m => m.formattedCurrentProduction),
    incidentFreeDays: derived(metrics, m => m.incidentFreeDays),
    formattedIncidentFreeDays: derived(metrics, m => m.formattedIncidentFreeDays),
    lastIncidentDate: derived(metrics, m => m.lastIncidentDate),
    formattedLastIncidentDate: derived(metrics, m => m.formattedLastIncidentDate),
    safetyRating: derived(metrics, m => m.safetyRating),
    productionEfficiency: derived(metrics, m => m.productionEfficiency),
    formattedProductionEfficiency: derived(metrics, m => m.formattedProductionEfficiency)
  };
}