import type { MetaV1S } from "$lib/types/sftMetadataTypes";
import { BASE_METADATA_SUBGRAPH_URL, ENERGY_FIELDS } from "$lib/network";

// Fallback URLs for redundancy
const METADATA_FALLBACK_URLS = [
  BASE_METADATA_SUBGRAPH_URL,
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
        console.warn(`Metadata fetch attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

export const getSftMetadata = async (): Promise<MetaV1S[]> => {
  // Extract all SFT addresses from ENERGY_FIELDS
  const sftAddresses = ENERGY_FIELDS.flatMap((field) =>
    field.sftTokens.map((token) => token.address),
  );

  // Create the subjects array for the GraphQL query
  const subjects = sftAddresses.map(
    (address) => `"0x000000000000000000000000${address.slice(2)}"`,
  );

  const query = `
    {
      metaV1S(where: {
        subject_in: [${subjects.join(",")}]
      },
      orderBy: transaction__timestamp
      orderDirection: desc
      first: ${subjects.length}
      ) {
        id
        meta
        sender
        subject
        metaHash
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
  for (const url of METADATA_FALLBACK_URLS) {
    try {
      console.log(`Fetching SFT metadata from: ${url}`);
      const response = await fetchWithRetry(url, requestOptions);
      const json = await response.json();

      if (json.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
      }

      if (!json.data?.metaV1S) {
        throw new Error('Invalid response structure: missing metaV1S data');
      }

      console.log(`Successfully fetched ${json.data.metaV1S.length} metadata entries`);
      return json.data.metaV1S as MetaV1S[];
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to fetch metadata from ${url}:`, lastError.message);
      
      // Continue to next fallback URL
      continue;
    }
  }

  // All fallback URLs failed
  console.error("All metadata endpoints failed:", lastError);
  throw new Error(`Failed to fetch SFT metadata from all available sources. Last error: ${lastError.message}`);
};
