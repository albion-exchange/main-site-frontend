import type { MetaV1S } from '$lib/types/sftMetadataTypes';
import { BASE_METADATA_SUBGRAPH_URL, ENERGY_FEILDS } from '$lib/network';

export const getSftMetadata = async (): Promise<MetaV1S[]> => {
	try {
		// Extract all SFT addresses from ENERGY_FEILDS
		const sftAddresses = ENERGY_FEILDS.flatMap(field => field.sftTokens);
		
		// Create the subjects array for the GraphQL query
		const subjects = sftAddresses.map(address => 
			`"0x000000000000000000000000${address.slice(2)}"`
		);

		const query = `
    {
  metaV1S(where: {
    subject_in: [${subjects.join(',')}]
  },
  orderBy: transaction__timestamp
  orderDirection: desc
   first: 1
  ) {
    id
    meta
    sender
    subject
    metaHash
  }
}
    `;

		const response = await fetch(BASE_METADATA_SUBGRAPH_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query })
		});

		const json = await response.json();

		return json.data.metaV1S as MetaV1S[];
	} catch (error) {
		console.error('Error fetching metadata:', error);
		throw error;
	}
};

// Helper function to get metadata for a specific vault address
export const getSftMetadataForVault = async (
	vaultAddress: string,
	subgraphUrl: string
): Promise<MetaV1S[]> => {
	try {
		const query = `
    {
  metaV1S(where: {
    subject: "0x000000000000000000000000${vaultAddress.slice(2)}"
  },
  orderBy: transaction__timestamp
  orderDirection: desc
  ) {
    id
    meta
    sender
    subject
    metaHash
  }
}
    `;

		const response = await fetch(subgraphUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query })
		});

		const json = await response.json();

		return json.data.metaV1S as MetaV1S[];
	} catch (error) {
		console.error('Error fetching metadata for vault:', error);
		throw error;
	}
};
