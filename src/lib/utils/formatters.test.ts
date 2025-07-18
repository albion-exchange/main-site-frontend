/**
 * @fileoverview Formatters Utility Tests
 * 
 * Test suite for utility formatting functions.
 */

import { describe, it, expect } from 'vitest';

// Simple formatting functions for testing
const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(amount);
};

const formatPercentage = (value: number, decimals = 1): string => {
	return `${value.toFixed(decimals)}%`;
};

const formatDate = (dateStr: string): string => {
	return new Date(dateStr).toLocaleDateString('en-US');
};

describe('Formatters', () => {
	describe('formatCurrency', () => {
		it('formats positive numbers correctly', () => {
			expect(formatCurrency(1000)).toBe('$1,000.00');
			expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
		});

		it('formats zero correctly', () => {
			expect(formatCurrency(0)).toBe('$0.00');
		});

		it('formats negative numbers correctly', () => {
			expect(formatCurrency(-1000)).toBe('-$1,000.00');
		});
	});

	describe('formatPercentage', () => {
		it('formats percentages with default decimals', () => {
			expect(formatPercentage(12.5)).toBe('12.5%');
			expect(formatPercentage(100)).toBe('100.0%');
		});

		it('formats percentages with custom decimals', () => {
			expect(formatPercentage(12.567, 2)).toBe('12.57%');
			expect(formatPercentage(12.567, 0)).toBe('13%');
		});
	});

	describe('formatDate', () => {
		it('formats ISO date strings correctly', () => {
			expect(formatDate('2024-01-15')).toBe('1/15/2024');
			expect(formatDate('2024-12-25')).toBe('12/25/2024');
		});
	});
});