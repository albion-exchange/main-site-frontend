/**
 * Test data provider for E2E tests
 * Uses the provided smart contract addresses and IPFS hashes to create comprehensive mock data
 */

import type { MetaV1S } from "$lib/types/sftMetadataTypes";
import type { OffchainAssetReceiptVault } from "$lib/types/offchainAssetReceiptVaultTypes";

const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

// Test data based on provided contracts and IPFS hashes
export const TEST_ENERGY_FIELDS = [
  {
    name: "Bakken Horizon-2",
    sftTokens: [
      {
        address: "0xd5316ca888491575befc0273a00de2186c53f760",
        claims: [
          {
            orderHash: "0x6279ea463fdbf12dbaedfe39cf2c59d56e4c078fd0d67f20b165e9d7a73e1fe2",
            csvLink: `${PINATA_GATEWAY}/bafkreiceeasgwffk27kvrgfh4dihiekb7iiznqyjpbabavjrucymv2pobe`,
            expectedMerkleRoot: "0x8f63a9d57072ae06cdf6bce272c86892ba31dc5bf2df4cf0743679748d2583d0",
            expectedContentHash: "bafkreiceeasgwffk27kvrgfh4dihiekb7iiznqyjpbabavjrucymv2pobe"
          },
          {
            orderHash: "0x14d9c48cdbaf5307a628a16532e80f4bb054bfdcf8fce383f308a5fc13abcaa5",
            csvLink: `${PINATA_GATEWAY}/bafkreidtqov24bkl6ylcjqbt2pjhx5ya7glezwnnnln7hwu7cyq6jhxnzi`,
            expectedMerkleRoot: "0xdbe4d64a9f4713de098a4fd2a9c747a907fd4256972ed0f3dc080cff3d65786d",
            expectedContentHash: "bafkreidtqov24bkl6ylcjqbt2pjhx5ya7glezwnnnln7hwu7cyq6jhxnzi"
          },
        ],
      },
      {
        address: "0xea9a6f77483a07bc287dfb8dad151042376eb153",
        claims: [
          {
            orderHash: "0x992364ccc51fd07cde7f1940a73740a13f27ca853250997e99147fac7f95f446",
            csvLink: `${PINATA_GATEWAY}/bafkreiea3bziwveo2nhbcui4jdxx4m42b3fs3ekyu45n7hdabhadqpf3ki`,
            expectedMerkleRoot: "0x092668a04aca58371b3d1c7fa603f62a14d63684ade4a6143094c24fb69e97f2",
            expectedContentHash: "bafkreiea3bziwveo2nhbcui4jdxx4m42b3fs3ekyu45n7hdabhadqpf3ki"
          },
        ],
      },
    ],
  },
  {
    name: "Gulf of Mexico-4",
    sftTokens: [
      {
        address: "0xae69a129b626b1e8fce196ef8e7d5faea3be753f",
        claims: [
          {
            orderHash: "0xa4d540c50f8409d2cafb6ae0cbff0bd8fb18c666981cf02269524215f16da4ac",
            csvLink: `${PINATA_GATEWAY}/bafkreihov36lw43igwx6fcy7iguconfi4vzjnbdppoqt4zb72ydygtvfey`,
            expectedMerkleRoot: "0x4da347e6e843edb490d901424ac7817869bf05301f70f35ef1bbe52e417dcecb",
            expectedContentHash: "bafkreihov36lw43igwx6fcy7iguconfi4vzjnbdppoqt4zb72ydygtvfey"
          },
        ],
      },
    ],
  },
  {
    name: "Permian Basin-3 Release 1",
    sftTokens: [
      {
        address: "0xc699575fe18f00104d926f0167cd858ce6d8b32e",
        claims: [
          {
            orderHash: "0x43ec2493caed6b56cfcbcf3b9279a01aedaafbce509598dfb324513e2d199977",
            csvLink: `${PINATA_GATEWAY}/bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu`,
            expectedMerkleRoot: "0x9106f7da38da159feb494ee5d31ad388f9004545914ceda12e062b458ce3b3fe",
            expectedContentHash: "bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu"
          },
        ],
      },
    ],
  },
];

// Test wallet addresses for mocking
export const TEST_WALLET_ADDRESSES = [
  "0x742d35Cc6834C532532C5c2BF03B4e99E6d7eA4C", // Test wallet 1
  "0x8ba1f109551bD432803012645Hac136c60343aD", // Test wallet 2
];

// Mock SFT data based on test energy fields
export const mockSftData: OffchainAssetReceiptVault[] = TEST_ENERGY_FIELDS.flatMap((field, fieldIndex) =>
  field.sftTokens.map((token, tokenIndex) => ({
    id: token.address.toLowerCase(),
    totalShares: "1000000000000000000000", // 1000 tokens
    address: token.address as any,
    deployer: "0x1234567890123456789012345678901234567890",
    admin: "0x1234567890123456789012345678901234567890",
    name: `${field.name} SFT`,
    symbol: `${field.name.replace(/\s+/g, "").toUpperCase()}SFT`,
    deployTimestamp: "1700000000",
    receiptContractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
    shareHolders: [
      { address: TEST_WALLET_ADDRESSES[0] },
      { address: TEST_WALLET_ADDRESSES[1] },
    ],
    tokenHolders: [
      { address: TEST_WALLET_ADDRESSES[0], balance: "50000000000000000000" }, // 50 tokens
      { address: TEST_WALLET_ADDRESSES[1], balance: "30000000000000000000" }, // 30 tokens
    ],
    activeAuthorizer: {
      id: `authorizer-${token.address}`,
      address: `0x${Math.random().toString(16).substr(2, 40)}` as any,
      isActive: true,
      roleHolders: [],
      roles: [],
      roleRevokes: [],
      rolesGranted: [],
    },
    authorizers: [],
    receiptVaultInformations: [],
    certifications: [],
    withdraws: [],
    deposits: [
      {
        id: `deposit-${tokenIndex}-1`,
        emitter: { address: TEST_WALLET_ADDRESSES[0] },
        transaction: { id: `0x${Math.random().toString(16).substr(2, 64)}` },
        receipt: {
          id: `receipt-${tokenIndex}-1`,
          receiptId: `${tokenIndex}-1`,
          receiptInformations: [],
        },
        amount: "50000000000000000000", // 50 tokens
        caller: { address: TEST_WALLET_ADDRESSES[0] },
        timestamp: "1700000000",
      },
      {
        id: `deposit-${tokenIndex}-2`,
        emitter: { address: TEST_WALLET_ADDRESSES[1] },
        transaction: { id: `0x${Math.random().toString(16).substr(2, 64)}` },
        receipt: {
          id: `receipt-${tokenIndex}-2`,
          receiptId: `${tokenIndex}-2`,
          receiptInformations: [],
        },
        amount: "30000000000000000000", // 30 tokens
        caller: { address: TEST_WALLET_ADDRESSES[1] },
        timestamp: "1700001000",
      },
    ],
    shareTransfers: [],
    receiptBalances: [],
    chainId: 8453, // Base chain
  }))
);

// Mock metadata based on test energy fields
export const mockMetadata: MetaV1S[] = TEST_ENERGY_FIELDS.flatMap((field) =>
  field.sftTokens.map((token) => ({
    id: `meta-${token.address}`,
    meta: `ipfs://QmTestMetadata${token.address.slice(-8)}`,
    sender: "0x0000000000000000000000000000000000000000",
    subject: `0x000000000000000000000000${token.address.slice(2)}`,
    metaHash: `0x${Math.random().toString(16).substr(2, 64)}`,
  }))
);

// Mock CSV data for each claim
export const mockCsvData: Record<string, any[]> = {};

// Generate CSV data for each claim
TEST_ENERGY_FIELDS.forEach((field) => {
  field.sftTokens.forEach((token) => {
    token.claims.forEach((claim, claimIndex) => {
      const csvData = [];
      // Generate sample CSV rows for test wallets
      TEST_WALLET_ADDRESSES.forEach((address, addressIndex) => {
        csvData.push({
          index: (claimIndex * 10 + addressIndex).toString(),
          address: address,
          amount: (Math.random() * 1000000000000000000 + 100000000000000000).toString(), // Random amount between 0.1 and 1 ETH
        });
      });
      mockCsvData[claim.expectedContentHash] = csvData;
    });
  });
});

// Mock IPFS metadata for each SFT
export const mockIpfsMetadata: Record<string, any> = {};

TEST_ENERGY_FIELDS.forEach((field, fieldIndex) => {
  field.sftTokens.forEach((token, tokenIndex) => {
    const metaKey = `QmTestMetadata${token.address.slice(-8)}`;
    mockIpfsMetadata[metaKey] = {
      name: `${field.name} Asset`,
      description: `Energy asset in ${field.name} field`,
      contractAddress: token.address,
      asset: {
        id: `${field.name.toLowerCase().replace(/\s+/g, "-")}-${tokenIndex}`,
        name: `${field.name} Asset ${tokenIndex + 1}`,
        operator: {
          name: "Test Energy Company",
          website: "https://testenergyco.com",
        },
        location: {
          country: "USA",
          state: fieldIndex === 0 ? "North Dakota" : fieldIndex === 1 ? "Louisiana" : "Texas",
          county: "Test County",
        },
        production: {
          status: "producing",
          startDate: "2023-01-01",
          expectedLifespan: "2033-12-31",
        },
        plannedProduction: {
          totalEstimate: 500000, // barrels
          projections: [
            { month: "2024-01", production: 5000, oilPrice: 75 },
            { month: "2024-02", production: 4800, oilPrice: 78 },
            { month: "2024-03", production: 4900, oilPrice: 76 },
          ],
        },
        monthlyReports: [
          { month: "2024-01", production: 4950, revenue: 371250, netIncome: 185625 },
          { month: "2024-02", production: 4750, revenue: 370500, netIncome: 185250 },
          { month: "2024-03", production: 4850, revenue: 368600, netIncome: 184300 },
        ],
        coverImage: `QmTestCover${token.address.slice(-8)}`,
      },
    };
  });
});

// Blockchain contract responses
export const mockContractResponses: Record<string, any> = {};

TEST_ENERGY_FIELDS.forEach((field) => {
  field.sftTokens.forEach((token) => {
    // Mock max shares supply for each authorizer
    mockContractResponses[`maxSharesSupply-${token.address}`] = "1000000000000000000000"; // 1000 tokens max
  });
});

class TestDataProvider {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    console.log("Initializing test data...");
    console.log(`Generated ${mockSftData.length} mock SFTs`);
    console.log(`Generated ${mockMetadata.length} mock metadata entries`);
    console.log(`Generated CSV data for ${Object.keys(mockCsvData).length} claims`);
    
    this.initialized = true;
  }

  getSftData() {
    return mockSftData;
  }

  getMetadata() {
    return mockMetadata;
  }

  getCsvData(contentHash: string) {
    return mockCsvData[contentHash] || [];
  }

  getIpfsMetadata(hash: string) {
    return mockIpfsMetadata[hash];
  }

  getContractResponse(key: string) {
    return mockContractResponses[key];
  }

  getTestWallets() {
    return TEST_WALLET_ADDRESSES;
  }

  getEnergyFields() {
    return TEST_ENERGY_FIELDS;
  }
}

export const testDataProvider = new TestDataProvider();