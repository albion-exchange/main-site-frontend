/**
 * Mock Payment Data
 * 
 * This file contains mock payment data for development and testing.
 */

export interface Payment {
  id: string;
  date: string;
  amount: number;
  asset: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  assetId: string;
  userId: string;
}

export const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    date: '2024-01-15',
    amount: 1250.00,
    asset: 'Permian Basin Well #247',
    status: 'completed',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    assetId: '1',
    userId: 'user-1'
  },
  {
    id: 'payment-2',
    date: '2024-01-01',
    amount: 980.50,
    asset: 'Eagle Ford Shale Project',
    status: 'completed',
    txHash: '0x2345678901bcdef12345678901bcdef123456789',
    assetId: '2',
    userId: 'user-1'
  },
  {
    id: 'payment-3',
    date: '2023-12-15',
    amount: 1450.75,
    asset: 'Bakken Formation Site',
    status: 'pending',
    assetId: '3',
    userId: 'user-1'
  },
  {
    id: 'payment-4',
    date: '2023-12-01',
    amount: 825.25,
    asset: 'Marcellus Shale Gas Well',
    status: 'completed',
    txHash: '0x3456789012cdef123456789012cdef1234567890',
    assetId: '4',
    userId: 'user-1'
  },
  {
    id: 'payment-5',
    date: '2023-11-15',
    amount: 2100.00,
    asset: 'Offshore Gulf Platform',
    status: 'failed',
    assetId: '5',
    userId: 'user-1'
  },
  {
    id: 'payment-6',
    date: '2023-11-01',
    amount: 675.80,
    asset: 'Permian Basin Well #247',
    status: 'completed',
    txHash: '0x4567890123def1234567890123def12345678901',
    assetId: '1',
    userId: 'user-1'
  },
  {
    id: 'payment-7',
    date: '2023-10-15',
    amount: 1125.40,
    asset: 'Eagle Ford Shale Project',
    status: 'completed',
    txHash: '0x567890234ef1234567890234ef123456789012',
    assetId: '2',
    userId: 'user-1'
  },
  {
    id: 'payment-8',
    date: '2023-10-01',
    amount: 1875.60,
    asset: 'Bakken Formation Site',
    status: 'completed',
    txHash: '0x67890345f1234567890345f1234567890123',
    assetId: '3',
    userId: 'user-1'
  }
];

export function getPaymentsByUser(userId: string): Payment[] {
  return mockPayments.filter(payment => payment.userId === userId);
}

export function getPaymentsByAsset(assetId: string): Payment[] {
  return mockPayments.filter(payment => payment.assetId === assetId);
}

export function getPaymentById(paymentId: string): Payment | undefined {
  return mockPayments.find(payment => payment.id === paymentId);
}