// Centralized RPC Endpoints Configuration
// This file serves as a single source of truth for all RPC endpoints

export const BASE_RPC_ENDPOINTS = [
  "https://mainnet.base.org",                    // Official Base RPC
  "https://base-rpc.publicnode.com",             // PublicNode
  "https://base.llamarpc.com",                   // LlamaRPC
  "https://0xrpc.io/base",                       // 0xRPC
  "https://base.drpc.org",                       // DRPC
  "https://base-mainnet.gateway.tatum.io",       // Tatum
  "https://base.blockpi.network/v1/rpc/public",  // BlockPI
  "https://1rpc.io/base",                        // 1RPC
  "https://base.meowrpc.com"                     // MeowRPC
] as const;

// Helper function to generate CSP connect-src directive
export function generateCSPConnectSrc(): string {
  const baseConnectSrc = [
    "'self'",
    "https://*.walletconnect.com",
    "wss://*.walletconnect.com", 
    "https://api.goldsky.com",
    "https://gateway.pinata.cloud",
    "https://*.mypinata.cloud",
    "https://*.pinata.cloud"
  ];
  
  const rpcConnectSrc = BASE_RPC_ENDPOINTS.map(endpoint => {
    // Extract domain from URL for CSP
    const url = new URL(endpoint);
    return `https://${url.hostname}`;
  });
  
  return [...baseConnectSrc, ...rpcConnectSrc].join(' ');
}

// Get primary RPC endpoint
export function getPrimaryRPCEndpoint(): string {
  return BASE_RPC_ENDPOINTS[0];
}

// Get all RPC endpoints
export function getAllRPCEndpoints(): readonly string[] {
  return BASE_RPC_ENDPOINTS;
}

// Get fallback RPC endpoints (all except primary)
export function getFallbackRPCEndpoints(): readonly string[] {
  return BASE_RPC_ENDPOINTS.slice(1);
} 