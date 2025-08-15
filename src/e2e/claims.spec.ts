import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  formatPaymentDuration,
  formatPaymentAmount,
  formatNextPaymentDate,
  calculateTotalPayments,
  calculateAveragePayment,
  getPaymentStatus,
  validateClaimEligibility,
  groupPaymentsByToken,
  filterPendingPayments,
  sortPaymentsByDate
} from '$lib/utils/claimsFormatters';

describe('claims utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatPaymentDuration', () => {
    it('formats payment duration correctly', () => {
      expect(formatPaymentDuration(30)).toBe('Monthly');
      expect(formatPaymentDuration(90)).toBe('Quarterly');
      expect(formatPaymentDuration(365)).toBe('Annual');
      expect(formatPaymentDuration(45)).toBe('Every 45 days');
    });
  });

  describe('formatPaymentAmount', () => {
    it('formats payment amounts with proper decimals', () => {
      expect(formatPaymentAmount('1000000000000000000', 18)).toBe('1.00');
      expect(formatPaymentAmount('1500000000000000000', 18)).toBe('1.50');
      expect(formatPaymentAmount('1000000', 6)).toBe('1.00');
      expect(formatPaymentAmount('0', 18)).toBe('0.00');
    });

    it('handles invalid inputs gracefully', () => {
      expect(formatPaymentAmount('invalid', 18)).toBe('0.00');
      expect(formatPaymentAmount('', 18)).toBe('0.00');
      expect(formatPaymentAmount(null as any, 18)).toBe('0.00');
    });
  });

  describe('formatNextPaymentDate', () => {
    it('formats next payment date correctly', () => {
      const futureDate = new Date('2025-12-25');
      const formatted = formatNextPaymentDate(futureDate.toISOString());
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('25');
      expect(formatted).toContain('2025');
      
      const pastDate = new Date('2024-01-01');
      expect(formatNextPaymentDate(pastDate.toISOString())).toBe('No upcoming payment');
    });

    it('handles invalid dates', () => {
      expect(formatNextPaymentDate('invalid')).toBe('No upcoming payment');
      expect(formatNextPaymentDate('')).toBe('No upcoming payment');
    });
  });

  describe('calculateTotalPayments', () => {
    it('calculates total from payment array', () => {
      const payments = [
        { amount: '1000000000000000000', decimals: 18 },
        { amount: '2000000000000000000', decimals: 18 },
        { amount: '500000000000000000', decimals: 18 }
      ];
      expect(calculateTotalPayments(payments)).toBe('3.50');
    });

    it('handles empty array', () => {
      expect(calculateTotalPayments([])).toBe('0.00');
    });

    it('handles mixed decimals', () => {
      const payments = [
        { amount: '1000000000000000000', decimals: 18 },
        { amount: '1000000', decimals: 6 }
      ];
      expect(calculateTotalPayments(payments)).toBe('2.00');
    });
  });

  describe('calculateAveragePayment', () => {
    it('calculates average payment amount', () => {
      const payments = [
        { amount: '1000000000000000000', decimals: 18 },
        { amount: '2000000000000000000', decimals: 18 },
        { amount: '3000000000000000000', decimals: 18 }
      ];
      expect(calculateAveragePayment(payments)).toBe('2.00');
    });

    it('returns 0 for empty array', () => {
      expect(calculateAveragePayment([])).toBe('0.00');
    });
  });

  describe('getPaymentStatus', () => {
    it('identifies payment status correctly', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 86400000); // +1 day
      const past = new Date(now.getTime() - 86400000); // -1 day
      
      expect(getPaymentStatus({ 
        paymentDate: future.toISOString(), 
        claimed: false 
      })).toBe('pending');
      
      expect(getPaymentStatus({ 
        paymentDate: past.toISOString(), 
        claimed: false 
      })).toBe('claimable');
      
      expect(getPaymentStatus({ 
        paymentDate: past.toISOString(), 
        claimed: true 
      })).toBe('claimed');
    });
  });

  describe('validateClaimEligibility', () => {
    it('validates claim eligibility', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 86400000);
      const future = new Date(now.getTime() + 86400000);
      
      expect(validateClaimEligibility({
        paymentDate: past.toISOString(),
        claimed: false,
        userAddress: '0x123',
        recipientAddress: '0x123'
      })).toBe(true);
      
      expect(validateClaimEligibility({
        paymentDate: future.toISOString(),
        claimed: false,
        userAddress: '0x123',
        recipientAddress: '0x123'
      })).toBe(false);
      
      expect(validateClaimEligibility({
        paymentDate: past.toISOString(),
        claimed: true,
        userAddress: '0x123',
        recipientAddress: '0x123'
      })).toBe(false);
      
      expect(validateClaimEligibility({
        paymentDate: past.toISOString(),
        claimed: false,
        userAddress: '0x123',
        recipientAddress: '0x456'
      })).toBe(false);
    });
  });

  describe('groupPaymentsByToken', () => {
    it('groups payments by token symbol', () => {
      const payments = [
        { tokenSymbol: 'USDC', amount: '1000000', decimals: 6 },
        { tokenSymbol: 'USDT', amount: '2000000', decimals: 6 },
        { tokenSymbol: 'USDC', amount: '3000000', decimals: 6 }
      ];
      
      const grouped = groupPaymentsByToken(payments);
      expect(grouped['USDC']).toHaveLength(2);
      expect(grouped['USDT']).toHaveLength(1);
      expect(grouped['USDC'][0].amount).toBe('1000000');
      expect(grouped['USDC'][1].amount).toBe('3000000');
    });

    it('handles empty array', () => {
      expect(groupPaymentsByToken([])).toEqual({});
    });
  });

  describe('filterPendingPayments', () => {
    it('filters only pending payments', () => {
      const payments = [
        { claimed: false, paymentDate: new Date(Date.now() + 86400000).toISOString() },
        { claimed: true, paymentDate: new Date(Date.now() - 86400000).toISOString() },
        { claimed: false, paymentDate: new Date(Date.now() - 86400000).toISOString() }
      ];
      
      const pending = filterPendingPayments(payments);
      expect(pending).toHaveLength(2);
      expect(pending.every(p => !p.claimed)).toBe(true);
    });
  });

  describe('sortPaymentsByDate', () => {
    it('sorts payments by date descending', () => {
      const payments = [
        { paymentDate: '2024-01-01' },
        { paymentDate: '2024-03-01' },
        { paymentDate: '2024-02-01' }
      ];
      
      const sorted = sortPaymentsByDate(payments);
      expect(sorted[0].paymentDate).toBe('2024-03-01');
      expect(sorted[1].paymentDate).toBe('2024-02-01');
      expect(sorted[2].paymentDate).toBe('2024-01-01');
    });

    it('handles invalid dates', () => {
      const payments = [
        { paymentDate: 'invalid' },
        { paymentDate: '2024-01-01' },
        { paymentDate: null }
      ];
      
      expect(() => sortPaymentsByDate(payments)).not.toThrow();
    });
  });
});