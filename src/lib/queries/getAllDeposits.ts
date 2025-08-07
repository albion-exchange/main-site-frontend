import {
    BASE_SFT_SUBGRAPH_URL,
    ENERGY_FIELDS,
  } from "$lib/network";
import { graphqlWithRetry } from "$lib/utils/fetchWithRetry";
  
  export const getAllDeposits = async (
    ownerAddress: string,
  ): Promise<any> => {
    const sftAddresses = ENERGY_FIELDS.flatMap((field) =>
        field.sftTokens.map((token) => token.address),
    );
  
    const query = `
     {
    depositWithReceipts(where: {
      and: [
        {caller_: {address: "${ownerAddress.toLowerCase()}"}}
        {offchainAssetReceiptVault_:{id_in: [${sftAddresses.map((s) => `"${s.toString().toLowerCase()}"`).join(",")}]}}
      ]
    }) {
      id
      caller {
        address
      }
      amount
      offchainAssetReceiptVault{
        id
      }
      
    }
}
  
      `;
  
    try {
      const result = await graphqlWithRetry<{ depositWithReceipts: any[] }>(
        BASE_SFT_SUBGRAPH_URL,
        query,
        undefined,
        { 
          maxRetries: 3, 
          onRetry: (attempt, delay) => 
            console.log(`Retrying getAllDeposits (attempt ${attempt}) after ${delay}ms`) 
        }
      );
  
      return result.depositWithReceipts || [];
    } catch {
      return null;
    }
  };
  