/**
 * @fileoverview Test Setup
 * 
 * Global test configuration and setup for Vitest. This file is run before
 * all test files and sets up the testing environment, mocks, and utilities.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SvelteKit environment
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false,
	version: 'test'
}));

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadData: vi.fn(),
	preloadCode: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	pushState: vi.fn(),
	replaceState: vi.fn()
}));

// Mock SvelteKit stores
vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn()
	},
	updated: {
		subscribe: vi.fn()
	}
}));

// Mock lucide-svelte icons for testing
vi.mock('lucide-svelte', () => {
	return new Proxy({}, {
		get: () => {
			// Return a mock Svelte component
			return {
				$$render: () => '<div data-testid="mock-icon"></div>'
			};
		}
	});
});

// Mock the AssetService and other services for testing
vi.mock('$lib/services/AssetService', () => ({
	AssetService: vi.fn().mockImplementation(() => ({
		getAllAssets: vi.fn().mockResolvedValue([]),
		getAssetById: vi.fn().mockResolvedValue(null),
		getAssetsByStatus: vi.fn().mockResolvedValue([]),
		calculateAssetMetrics: vi.fn().mockReturnValue({}),
		getAssetsByLocation: vi.fn().mockResolvedValue([]),
		searchAssets: vi.fn().mockResolvedValue([])
	}))
}));

// Mock composables
vi.mock('$lib/composables/useAssetMetrics', () => ({
	useAssetMetrics: vi.fn().mockReturnValue({
		totalValue: { subscribe: vi.fn(), formatted: '$1,000,000', trend: null, value: 1000000 },
		monthlyRevenue: { subscribe: vi.fn(), formatted: '$50,000', trend: null, value: 50000 },
		uptime: { subscribe: vi.fn(), formatted: '95.5%', trend: null, value: 95.5 },
		roi: { subscribe: vi.fn(), formatted: '12.5%', trend: null, value: 12.5 },
		productionMetrics: { rate: { formatted: '150 bbl/day' } },
		operationalMetrics: { efficiency: { formatted: '88.2%' } }
	})
}));

vi.mock('$lib/composables/usePaymentData', () => ({
	usePaymentData: vi.fn().mockReturnValue({
		filteredPayments: { subscribe: vi.fn() },
		sortedPayments: { subscribe: vi.fn() },
		totalAmount: { subscribe: vi.fn() },
		unclaimedAmount: { subscribe: vi.fn() },
		filters: { update: vi.fn() },
		sortState: { set: vi.fn(), subscribe: vi.fn() }
	})
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock fetch globally
global.fetch = vi.fn();

// Setup console.error to fail tests on errors (but not warnings)
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
	console.error = (...args) => {
		// Allow some expected errors in tests
		const message = args.join(' ');
		if (message.includes('Cannot find base config file') || 
		    message.includes('tsconfig.json')) {
			return; // Ignore SvelteKit config warnings in tests
		}
		originalError(...args);
		throw new Error('Console error: ' + args.join(' '));
	};
	
	// Suppress warnings in tests
	console.warn = () => {};
});

afterEach(() => {
	console.error = originalError;
	console.warn = originalWarn;
	vi.restoreAllMocks();
});