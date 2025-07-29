export const BASE_SFT_SUBGRAPH_URL =
	'https://api.goldsky.com/api/public/project_cm153vmqi5gke01vy66p4ftzf/subgraphs/sft-offchainassetvaulttest-base/1.0.3/gn';
export const BASE_ORDERBOOK_SUBGRAPH_URL =
	'https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-base/2024-12-13-9c39/gn';
export const BASE_METADATA_SUBGRAPH_URL =
	'https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/metadata-base/2025-07-06-594f/gn';
export const TARGET_NETWORK = 'base';
export const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';


export type EnergyField = {
	name: string;
	sftTokens: string[];
}
export const ENERGY_FIELDS: EnergyField[] = [
	{
		name: 'Bakken Horizon Field',
		sftTokens: ['0xd5316Ca888491575bEFC0273a00dE2186C53f760'],
	}
]