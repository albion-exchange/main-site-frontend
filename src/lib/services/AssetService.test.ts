/**
 * @fileoverview AssetService Tests
 * 
 * Comprehensive test suite for the AssetService, covering all methods
 * and error handling scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssetService } from './AssetService';
import type { Asset } from '$lib/types/uiTypes';

// Mock data
const mockAsset: Asset = {
	id: 'asset-1',
	name: 'Test Well Alpha',
	assetTokenMapping: 'test-token-address',
	image: '/images/test-well.jpg',
	state: 'TX',
	operator: 'Test Operator LLC',
	county: 'Test County',
	acreage: 1000,
	depth: 8500,
	waterDepth: 0,
	assetClass: 'Horizontal Well',
	status: 'Producing',
	description: 'Test well description',
	expectedEndDate: '2025-12-31',
	totalValue: 2500000,
	monthlyReports: [],
	operationalMetrics: {
		uptime: { percentage: 95.5, lastUpdated: '2024-01-01' },
		efficiency: { percentage: 88.2, lastUpdated: '2024-01-01' }
	},
	productionMetrics: {
		oil: { value: 150, unit: 'barrels/day', lastUpdated: '2024-01-01' },
		gas: { value: 500, unit: 'mcf/day', lastUpdated: '2024-01-01' }
	},
	terms: {
		interestType: 'Overriding Royalty Interest',
		interest: '3.2% of gross',
		paymentFrequency: 'Monthly within 30 days'
	},
	location: {
		latitude: 29.7604,
		longitude: -95.3698,
		address: 'Test Location, TX'
	}
};

describe('AssetService', () => {
	let assetService: AssetService;
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn();
		global.fetch = mockFetch;
		assetService = new AssetService();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('getAllAssets', () => {
		it('returns all assets successfully', async () => {
			const mockAssets = [mockAsset];
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.getAllAssets();

			expect(result).toEqual(mockAssets);
			expect(mockFetch).toHaveBeenCalledWith('/api/assets');
		});

		it('handles fetch errors gracefully', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));

			await expect(assetService.getAllAssets()).rejects.toThrow('Failed to fetch assets');
		});

		it('handles non-ok responses', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});

			await expect(assetService.getAllAssets()).rejects.toThrow('Failed to fetch assets: 500 Internal Server Error');
		});
	});

	describe('getAssetById', () => {
		it('returns specific asset by id', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAsset
			});

			const result = await assetService.getAssetById('asset-1');

			expect(result).toEqual(mockAsset);
			expect(mockFetch).toHaveBeenCalledWith('/api/assets/asset-1');
		});

		it('returns null for non-existent asset', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404
			});

			const result = await assetService.getAssetById('non-existent');

			expect(result).toBeNull();
		});

		it('throws error for server errors', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});

			await expect(assetService.getAssetById('asset-1')).rejects.toThrow('Failed to fetch asset: 500 Internal Server Error');
		});
	});

	describe('getAssetsByStatus', () => {
		it('filters assets by status', async () => {
			const mockAssets = [
				{ ...mockAsset, id: 'asset-1', status: 'Producing' },
				{ ...mockAsset, id: 'asset-2', status: 'Drilling' },
				{ ...mockAsset, id: 'asset-3', status: 'Producing' }
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.getAssetsByStatus('Producing');

			expect(result).toHaveLength(2);
			expect(result.every(asset => asset.status === 'Producing')).toBe(true);
		});

		it('returns empty array when no assets match status', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [mockAsset]
			});

			const result = await assetService.getAssetsByStatus('Abandoned');

			expect(result).toEqual([]);
		});
	});

	describe('calculateAssetMetrics', () => {
		it('calculates basic metrics correctly', () => {
			const assetWithMetrics = {
				...mockAsset,
				totalValue: 1000000,
				monthlyReports: [
					{ month: '2024-01', totalPayout: 50000 },
					{ month: '2024-02', totalPayout: 55000 }
				]
			};

			const metrics = assetService.calculateAssetMetrics(assetWithMetrics);

			expect(metrics.totalValue).toBe(1000000);
			expect(metrics.totalPayouts).toBe(105000);
			expect(metrics.averageMonthlyPayout).toBe(52500);
			expect(metrics.roi).toBe(10.5); // (105000 / 1000000) * 100
		});

		it('handles asset with no payouts', () => {
			const assetWithoutPayouts = {
				...mockAsset,
				totalValue: 1000000,
				monthlyReports: []
			};

			const metrics = assetService.calculateAssetMetrics(assetWithoutPayouts);

			expect(metrics.totalPayouts).toBe(0);
			expect(metrics.averageMonthlyPayout).toBe(0);
			expect(metrics.roi).toBe(0);
		});

		it('handles missing total value', () => {
			const assetWithoutValue = {
				...mockAsset,
				totalValue: 0,
				monthlyReports: [
					{ month: '2024-01', totalPayout: 50000 }
				]
			};

			const metrics = assetService.calculateAssetMetrics(assetWithoutValue);

			expect(metrics.roi).toBe(0); // Avoid division by zero
		});
	});

	describe('getAssetsByLocation', () => {
		it('filters assets by state', async () => {
			const mockAssets = [
				{ ...mockAsset, id: 'asset-1', state: 'TX' },
				{ ...mockAsset, id: 'asset-2', state: 'OK' },
				{ ...mockAsset, id: 'asset-3', state: 'TX' }
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.getAssetsByLocation({ state: 'TX' });

			expect(result).toHaveLength(2);
			expect(result.every(asset => asset.state === 'TX')).toBe(true);
		});

		it('filters assets by county', async () => {
			const mockAssets = [
				{ ...mockAsset, id: 'asset-1', county: 'Harris' },
				{ ...mockAsset, id: 'asset-2', county: 'Dallas' },
				{ ...mockAsset, id: 'asset-3', county: 'Harris' }
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.getAssetsByLocation({ county: 'Harris' });

			expect(result).toHaveLength(2);
			expect(result.every(asset => asset.county === 'Harris')).toBe(true);
		});

		it('filters by multiple criteria', async () => {
			const mockAssets = [
				{ ...mockAsset, id: 'asset-1', state: 'TX', county: 'Harris' },
				{ ...mockAsset, id: 'asset-2', state: 'TX', county: 'Dallas' },
				{ ...mockAsset, id: 'asset-3', state: 'OK', county: 'Harris' }
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.getAssetsByLocation({ 
				state: 'TX', 
				county: 'Harris' 
			});

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('asset-1');
		});
	});

	describe('searchAssets', () => {
		it('searches assets by name', async () => {
			const mockAssets = [
				{ ...mockAsset, id: 'asset-1', name: 'Alpha Well' },
				{ ...mockAsset, id: 'asset-2', name: 'Beta Well' },
				{ ...mockAsset, id: 'asset-3', name: 'Alpha Prime' }
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.searchAssets('Alpha');

			expect(result).toHaveLength(2);
			expect(result.every(asset => asset.name.includes('Alpha'))).toBe(true);
		});

		it('searches assets by operator', async () => {
			const mockAssets = [
				{ ...mockAsset, id: 'asset-1', operator: 'ExxonMobil' },
				{ ...mockAsset, id: 'asset-2', operator: 'Chevron' },
				{ ...mockAsset, id: 'asset-3', operator: 'ExxonMobil' }
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.searchAssets('Exxon');

			expect(result).toHaveLength(2);
		});

		it('performs case-insensitive search', async () => {
			const mockAssets = [
				{ ...mockAsset, id: 'asset-1', name: 'Alpha Well' }
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await assetService.searchAssets('alpha');

			expect(result).toHaveLength(1);
		});

		it('returns empty array for no matches', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [mockAsset]
			});

			const result = await assetService.searchAssets('NonExistent');

			expect(result).toEqual([]);
		});
	});

	describe('Error Handling', () => {
		it('handles malformed JSON responses', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => {
					throw new Error('Invalid JSON');
				}
			});

			await expect(assetService.getAllAssets()).rejects.toThrow('Failed to fetch assets');
		});

		it('handles network timeouts', async () => {
			mockFetch.mockImplementationOnce(() => 
				new Promise((_, reject) => 
					setTimeout(() => reject(new Error('Timeout')), 100)
				)
			);

			await expect(assetService.getAllAssets()).rejects.toThrow('Failed to fetch assets');
		});
	});

	describe('Caching', () => {
		it('caches successful requests', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [mockAsset]
			});

			// First call
			const result1 = await assetService.getAllAssets();
			
			// Second call should use cache
			const result2 = await assetService.getAllAssets();

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(result1).toEqual(result2);
		});
	});
});