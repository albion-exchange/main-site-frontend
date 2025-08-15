import { formatDate } from './formatters';

export function formatPaymentDuration(days: number): string {
  if (days === 30) return 'Monthly';
  if (days === 90) return 'Quarterly';
  if (days === 365) return 'Annual';
  return `Every ${days} days`;
}

export function formatPaymentAmount(amount: string, decimals: number): string {
  try {
    if (!amount || amount === 'invalid' || amount === null) {
      return '0.00';
    }
    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const result = Number(value) / Number(divisor);
    return result.toFixed(2);
  } catch {
    return '0.00';
  }
}

export function formatNextPaymentDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || !dateStr) {
      return 'No upcoming payment';
    }
    
    const now = new Date();
    if (date < now) {
      return 'No upcoming payment';
    }
    
    // Simple date formatting
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch {
    return 'No upcoming payment';
  }
}

export function calculateTotalPayments(payments: Array<{ amount: string; decimals: number }>): string {
  if (!payments || payments.length === 0) return '0.00';
  
  let total = 0;
  for (const payment of payments) {
    const value = parseFloat(formatPaymentAmount(payment.amount, payment.decimals));
    total += value;
  }
  
  return total.toFixed(2);
}

export function calculateAveragePayment(payments: Array<{ amount: string; decimals: number }>): string {
  if (!payments || payments.length === 0) return '0.00';
  
  const total = parseFloat(calculateTotalPayments(payments));
  const average = total / payments.length;
  
  return average.toFixed(2);
}

export function getPaymentStatus(payment: { paymentDate: string; claimed: boolean }): string {
  const now = new Date();
  const paymentDate = new Date(payment.paymentDate);
  
  if (payment.claimed) {
    return 'claimed';
  }
  
  if (paymentDate > now) {
    return 'pending';
  }
  
  return 'claimable';
}

export function validateClaimEligibility(params: {
  paymentDate: string;
  claimed: boolean;
  userAddress: string;
  recipientAddress: string;
}): boolean {
  const now = new Date();
  const paymentDate = new Date(params.paymentDate);
  
  // Already claimed
  if (params.claimed) return false;
  
  // Future payment
  if (paymentDate > now) return false;
  
  // Wrong recipient
  if (params.userAddress.toLowerCase() !== params.recipientAddress.toLowerCase()) {
    return false;
  }
  
  return true;
}

export function groupPaymentsByToken(payments: Array<{ tokenSymbol: string; [key: string]: any }>): Record<string, any[]> {
  if (!payments || payments.length === 0) return {};
  
  const grouped: Record<string, any[]> = {};
  
  for (const payment of payments) {
    if (!grouped[payment.tokenSymbol]) {
      grouped[payment.tokenSymbol] = [];
    }
    grouped[payment.tokenSymbol].push(payment);
  }
  
  return grouped;
}

export function filterPendingPayments(payments: Array<{ claimed: boolean; paymentDate: string }>): any[] {
  if (!payments) return [];
  return payments.filter(p => !p.claimed);
}

export function sortPaymentsByDate(payments: Array<{ paymentDate: string | null }>): any[] {
  if (!payments) return [];
  
  return [...payments].sort((a, b) => {
    try {
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return dateB - dateA; // Descending order
    } catch {
      return 0;
    }
  });
}