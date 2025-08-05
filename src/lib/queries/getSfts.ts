import { BASE_SFT_SUBGRAPH_URL } from "$lib/network";

// Fallback URLs for redundancy
const SFT_FALLBACK_URLS = [
  BASE_SFT_SUBGRAPH_URL,
  // Add fallback subgraph URLs here when available
];

interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < retryOptions.maxRetries) {
        const delay = retryOptions.retryDelay * Math.pow(retryOptions.backoffMultiplier, attempt);
        console.warn(`SFT fetch attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

export const getSfts = async (): Promise<any> => {
  const query = `
    {
 offchainAssetReceiptVaults {

    withdraws {
      id
       emitter {
        address
      }
      transaction {
        id
      }
      
      receipt {
        id
        receiptId
        receiptInformations {
        payload
          schema
          information
            payload
            schema
          emitter {
            address
          }
        }
      }
      amount
      caller {
        address
      }
      timestamp
    }
    deposits {
      id
       emitter {
        address
      }
      transaction {
        id
      }
      receipt {
        id
        receiptId
        receiptInformations {
          payload
          schema
          information
          emitter {
            address
          }
        }
      }
      amount
      caller {
        address
      }
      timestamp
    }
    activeAuthorizer {
      address
      rolesGranted(orderBy: timestamp, orderDirection: desc) {
        role {
          roleName
        }
        sender {
          address
        }
        account {
          address
        }
        timestamp
        transaction {
          id
        }
      }
      roleHolders {
        role {
          roleName
          roleHash
        }
        account {
          address
        }
      }
      roles(orderBy: roleName) {
        roleName
        roleHolders {
          account {
            address
          }
        }
        roleHash
      }
      roleRevokes {
        role {
          roleName
        }
        sender {
          address
        }
        account {
          address
        }
        timestamp
        transaction {
          id
        }
      }
    }
    
    id
    totalShares
    address
    deployer
    admin
    name
    symbol
    deployTimestamp
    receiptContractAddress
    shareHolders {
      address
    }
    
    tokenHolders {
      address
      balance
    }
    
    shareTransfers {
      id
      timestamp
      from {
        address
      }
      to {
        address
      }
      value
    }
    receiptBalances {
      receipt {
        shares
        id
        receiptId
        balances {
          valueExact
          value
          account {
            address
          }
        }
          deposits {
          amount
          receipt {
            receiptId
          }
          timestamp
        }
        receiptInformations(orderDirection: desc, orderBy: timestamp) {
          information
          id
          transaction {
            blockNumber
            id
          }
          timestamp
          emitter {
            address
          }
          receipt {
            deposits {
              amount
            }
          }
        }
      }
    }
    certifications(orderBy: timestamp, orderDirection: desc) {
      timestamp
      id
      certifier {
        address
      }
      certifiedUntil
      totalShares
      transaction {
        id
        blockNumber
      }
      data
      information
    }
    receiptVaultInformations(orderBy: timestamp, orderDirection: desc) {
      information
      id
      timestamp
      caller {
        address
      }
      transaction {
        blockNumber
      }
    }
  }
          }
    `;

  const requestOptions: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  };

  let lastError: Error;

  // Try each fallback URL
  for (const url of SFT_FALLBACK_URLS) {
    try {
      console.log(`Fetching SFTs from: ${url}`);
      const response = await fetchWithRetry(url, requestOptions);
      const json = await response.json();

      if (json.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
      }

      if (!json.data?.offchainAssetReceiptVaults) {
        throw new Error('Invalid response structure: missing offchainAssetReceiptVaults data');
      }

      console.log(`Successfully fetched ${json.data.offchainAssetReceiptVaults.length} SFT vaults`);
      return json.data.offchainAssetReceiptVaults;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to fetch SFTs from ${url}:`, lastError.message);
      
      // Continue to next fallback URL
      continue;
    }
  }

  // All fallback URLs failed
  console.error("All SFT endpoints failed:", lastError);
  throw new Error(`Failed to fetch SFTs from all available sources. Last error: ${lastError.message}`);
};
