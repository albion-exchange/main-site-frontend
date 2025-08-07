import { BASE_ORDERBOOK_SUBGRAPH_URL } from "$lib/network";
import { graphqlWithRetry } from "$lib/utils/fetchWithRetry";

export const getOrder = async (orderHash: string): Promise<any> => {
  // Clean and validate the orderHash
  const cleanOrderHash = orderHash.trim().toLowerCase();
  if (!cleanOrderHash.startsWith("0x") || cleanOrderHash.length !== 66) {
    console.error("Invalid orderHash format:", orderHash);
    return null;
  }

  const query = `
   {
  orders(
    where: {
        orderHash: "${cleanOrderHash}"
    }
  ) {
      orderBytes
      orderHash
      orderbook{
      id
    }
  }
}

    `;

  try {
    const result = await graphqlWithRetry<{ orders: any[] }>(
      BASE_ORDERBOOK_SUBGRAPH_URL,
      query,
      undefined,
      { 
        maxRetries: 3, 
        onRetry: (attempt, delay) => 
          console.log(`Retrying getOrder (attempt ${attempt}) after ${delay}ms`) 
      }
    );

    return result.orders || [];
  } catch {
    return null;
  }
};
