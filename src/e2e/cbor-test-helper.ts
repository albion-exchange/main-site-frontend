// Helper to create properly CBOR-encoded metadata for tests
import cborWeb from 'cbor-web';
import pako from 'pako';
import { ethers } from 'ethers';

const { encodeCanonical } = cborWeb as any;

const MAGIC_NUMBERS = {
  OA_STRUCTURE: BigInt(0xffc47a6299e8a911n),
  OA_SCHEMA: BigInt(0xffa8e8a9b9cf4a31n),
};

export function createEncodedMetadata(metadata: any): string {
  // Convert metadata to JSON string
  const jsonStr = JSON.stringify(metadata);
  
  // Compress with deflate (same as deflateJson in helpers.ts)
  const bytes = pako.deflate(jsonStr);
  
  // Create CBOR structure matching cborEncode function
  const m = new Map();
  m.set(0, bytes); // Payload (compressed JSON)
  m.set(1, MAGIC_NUMBERS.OA_STRUCTURE); // Magic number
  m.set(2, "application/json"); // Content-Type
  m.set(3, "deflate"); // Content-Encoding
  
  // Encode to CBOR
  const cborData = encodeCanonical(m);
  
  // Convert to hex string (matching cborEncode output)
  const hexString = cborData.toString('hex').toLowerCase();
  
  // Create the proper Rain meta document prefix
  // This matches RAIN_META_DOCUMENT magic number: 0xff0a89c674ee7874
  const rainMetaPrefix = 'ff0a89c674ee7874';
  
  // Add content encoding byte (e.g., 0xa5 for map with 5 elements)
  // and content type identifier
  const contentPrefix = 'a500';
  
  // Pad to make 18 bytes total (36 hex chars)
  const paddingBytes = '590672789ca5565b73';
  
  const fullPrefix = rainMetaPrefix + contentPrefix + paddingBytes;
  
  // Return as hex string with 0x prefix
  return '0x' + fullPrefix + hexString;
}

// Test metadata structures
export const wressleMetadata = {
  releaseName: 'Wressle-1 4.5% Royalty Stream',
  tokenType: 'Royalty',
  sharePercentage: 2.5,
  firstPaymentDate: '2025-05-01',
  asset: {
    assetName: 'Wressle-1',
    location: {
      country: 'United Kingdom',
      region: 'Lincolnshire',
      coordinates: { lat: 53.5, lng: -0.5 }
    },
    operator: {
      name: 'Egdon Resources',
      website: 'https://www.egdonresources.com'
    },
    status: 'Producing',
    commodity: 'Oil',
    benchmark: 'Brent',
    description: 'Wressle oil field in Lincolnshire',
    imageUrl: '/images/wressle.jpg',
    technical: {
      reservoirDepth: 2000,
      apiGravity: 35.5
    },
    financial: {
      breakEvenPrice: 6.94,
      transportCosts: 0
    },
    production: {
      currentProduction: 350,
      productionUnit: 'BOE/day',
      lastUpdate: '2025-01-01'
    },
    assetTerms: {
      royaltyPercentage: 4.5,
      paymentFrequency: 'Monthly',
      contractDuration: '20 years'
    }
  },
  oilPriceAssumption: 65,
  benchmarkPremium: -1.3,
  breakEvenOilPrice: 6.94,
  transportCosts: 0,
  baseReturn: 12.04,
  bonusReturn: 3472.2,
  impliedBarrelsPerToken: 0.144,
  plannedProduction: {
    oilPriceAssumption: 65,
    oilPriceAssumptionCurrency: 'USD',
    projections: [
      { month: '2025-05', production: 347.76, revenue: 0 },
      { month: '2025-06', production: 330.885, revenue: 0 },
      { month: '2025-07', production: 336.24, revenue: 0 },
    ]
  },
  paymentFrequency: '30 days',
  name: 'Wressle-1 4.5% Royalty Stream',
  symbol: 'ALB-WR1-R1'
};

export const wressleR2Metadata = {
  releaseName: 'Wressle-1 5% Royalty Stream',
  tokenType: 'Royalty',
  sharePercentage: 5.0,
  firstPaymentDate: '2025-06-01',
  asset: {
    assetName: 'Wressle-1',
    location: {
      country: 'United Kingdom',
      region: 'Lincolnshire',
      coordinates: { lat: 53.5, lng: -0.5 }
    },
    operator: {
      name: 'Egdon Resources',
      website: 'https://www.egdonresources.com'
    },
    status: 'Producing',
    commodity: 'Oil',
    benchmark: 'Brent',
    description: 'Wressle oil field in Lincolnshire',
    imageUrl: '/images/wressle.jpg',
    technical: {
      reservoirDepth: 2000,
      apiGravity: 35.5
    },
    financial: {
      breakEvenPrice: 6.94,
      transportCosts: 0
    },
    production: {
      currentProduction: 350,
      productionUnit: 'BOE/day',
      lastUpdate: '2025-01-01'
    },
    assetTerms: {
      royaltyPercentage: 5.0,
      paymentFrequency: 'Monthly',
      contractDuration: '20 years'
    }
  },
  oilPriceAssumption: 65,
  benchmarkPremium: -1.3,
  breakEvenOilPrice: 6.94,
  transportCosts: 0,
  baseReturn: 13.5,
  bonusReturn: 4000.0,
  impliedBarrelsPerToken: 0.200,
  plannedProduction: {
    oilPriceAssumption: 65,
    oilPriceAssumptionCurrency: 'USD',
    projections: [
      { month: '2025-06', production: 400.0, revenue: 0 },
      { month: '2025-07', production: 390.0, revenue: 0 },
      { month: '2025-08', production: 380.0, revenue: 0 },
    ]
  },
  paymentFrequency: '30 days',
  name: 'Wressle-1 5% Royalty Stream',
  symbol: 'ALB-WR1-R2'
};

export const gulfMetadata = {
  releaseName: 'Gulf Deep Water 3% Royalty',
  tokenType: 'Royalty',
  sharePercentage: 3.0,
  firstPaymentDate: '2025-05-01',
  asset: {
    assetName: 'Gulf Deep Water',
    location: {
      country: 'United States',
      region: 'Gulf of Mexico',
      coordinates: { lat: 28.5, lng: -90.5 }
    },
    operator: {
      name: 'Offshore Energy',
      website: 'https://www.offshoreenergy.com'
    },
    status: 'Developing',
    commodity: 'Oil',
    benchmark: 'WTI',
    description: 'Deep water oil field in Gulf of Mexico',
    imageUrl: '/images/gulf.jpg',
    technical: {
      reservoirDepth: 5000,
      apiGravity: 32.5
    },
    financial: {
      breakEvenPrice: 8.50,
      transportCosts: 2.0
    },
    production: {
      currentProduction: 500,
      productionUnit: 'BOE/day',
      lastUpdate: '2025-01-01'
    },
    assetTerms: {
      royaltyPercentage: 3.0,
      paymentFrequency: 'Monthly',
      contractDuration: '15 years'
    }
  },
  oilPriceAssumption: 70,
  benchmarkPremium: -2.0,
  breakEvenOilPrice: 8.50,
  transportCosts: 2.0,
  baseReturn: 14.0,
  bonusReturn: 2500.0,
  impliedBarrelsPerToken: 0.200,
  plannedProduction: {
    oilPriceAssumption: 70,
    oilPriceAssumptionCurrency: 'USD',
    projections: [
      { month: '2025-05', production: 500.0, revenue: 0 },
      { month: '2025-06', production: 480.0, revenue: 0 },
      { month: '2025-07', production: 460.0, revenue: 0 },
    ]
  },
  paymentFrequency: '30 days',
  name: 'Gulf Deep Water 3% Royalty',
  symbol: 'ALB-GDW-R1'
};