import { MAGIC_NUMBERS } from './helpers';
import { cborDecode, bytesToMeta } from './helpers';
import type { OffchainAssetReceiptVault } from '$lib/types/offchainAssetReceiptVaultTypes';
import type { Asset, PlannedProduction, Token } from '$lib/types/uiTypes';
import type { ISODateTimeString } from '$lib/types/sharedTypes';
import { PINATA_GATEWAY } from '$lib/network';

export const addSchemaToReceipts = (vault: OffchainAssetReceiptVault) => {
	let tempSchema: { displayName: string; hash: string }[] = [];

	const receiptVaultInformations = vault.receiptVaultInformations;

	if (receiptVaultInformations.length) {
		receiptVaultInformations.map(async (data) => {
			const cborDecodedInformation = cborDecode(data.information.slice(18));
			if (cborDecodedInformation && cborDecodedInformation[0]?.get(1) === MAGIC_NUMBERS.OA_SCHEMA) {
				const schemaHash = cborDecodedInformation[1].get(0);
				if (schemaHash && !schemaHash.includes(',')) {
					const structure = bytesToMeta(cborDecodedInformation[0].get(0), 'json');

					tempSchema = [
						...tempSchema,
						{
							...structure,
							displayName: structure.displayName,
							timestamp: receiptVaultInformations[0].timestamp,
							id: receiptVaultInformations[0].id,
							hash: schemaHash
						}
					];
					tempSchema = tempSchema.filter(
						(d: { displayName?: string; hash?: string }) => d.displayName && d.hash
					);
					return tempSchema;
				}
			}
		});
	}
	return tempSchema;
};

export function generateTokenInstanceFromSft(sft: OffchainAssetReceiptVault, pinnedMetadata: any, sftMaxSharesSupply: string): Token {

	const tokenInstance: Token = {
		contractAddress: sft.id,
		name: sft.name,
		symbol: sft.symbol,
		decimals: 18, // All SFTs have default 18 decimals
		tokenType: 'royalty', // SFTs are always royalty tokens, payment tokens are USDC, USDT or any other value token
		assetId: sft.id, // SFT contract itself is unique
		isActive: true, // SFTs are always active
		supply: {
			maxSupply: sftMaxSharesSupply.toString(), // Needs to be edited.
			mintedSupply: sft.totalShares
		},
		holders: sft.tokenHolders.map((holder) => ({
			address: holder.address,
			balance: holder.balance
		})),
		payoutHistory: [], // Unclear what this is yet.
		sharePercentage: pinnedMetadata.sharePercentage, // Unclear what this is yet.
		firstPaymentDate: undefined, // Unclear what this is yet.
		metadata: {
			createdAt: new Date(Number(sft.deployTimestamp) * 1000).toISOString() as ISODateTimeString,
			updatedAt: new Date(Number(sft.deployTimestamp) * 1000).toISOString() as ISODateTimeString
		}
	}

	return tokenInstance

}

export function generateAssetInstanceFromSftMeta(sft: OffchainAssetReceiptVault, pinnedMetadata: any ): Asset {
   

    const assetPlannedProduction: PlannedProduction = {
        oilPriceAssumption: pinnedMetadata.asset.plannedProduction.oilPriceAssumption,
        oilPriceAssumptionCurrency: pinnedMetadata.asset.plannedProduction.oilPriceAssumptionCurrency,
        projections: pinnedMetadata.asset.plannedProduction.projections
    };
	const assetInstance: Asset = {
		id: sft.id,
		name: sft.name,
		description: pinnedMetadata.asset.description,
		coverImage: `${PINATA_GATEWAY}/${pinnedMetadata.asset.coverImage}`,
		images: pinnedMetadata.asset.galleryImages.map((image: any) => ({
			title: image.title,
			url: `${PINATA_GATEWAY}/${image.url}`,
			caption: image.caption
		})),
		location: {
			state: pinnedMetadata.asset.location.state,
			county: pinnedMetadata.asset.location.county,
			country: pinnedMetadata.asset.location.country,
			coordinates: {
				lat: pinnedMetadata.asset.location.coordinates.lat,
				lng: pinnedMetadata.asset.location.coordinates.lng
			},
			waterDepth: null
		},
		operator: {
			name: pinnedMetadata.asset.operator.name,
			website: pinnedMetadata.asset.operator.website,
			experience: pinnedMetadata.asset.operator.experience
		},
		technical: {
			fieldType: pinnedMetadata.asset.technical.fieldType,
			depth: pinnedMetadata.asset.technical.depth,
			license: pinnedMetadata.asset.technical.license,
			estimatedLife: pinnedMetadata.asset.technical.estimatedLife,
			firstOil: pinnedMetadata.asset.technical.firstOil,
			infrastructure: pinnedMetadata.asset.technical.infrastructure,
			environmental: pinnedMetadata.asset.technical.environmental,
			expectedEndDate: pinnedMetadata.asset.technical.expectedEndDate,
			crudeBenchmark: pinnedMetadata.asset.technical.crudeBenchmark,
			pricing: {
				benchmarkPremium: pinnedMetadata.asset.technical.pricing.benchmarkPremium,
				transportCosts: pinnedMetadata.asset.technical.pricing.transportCosts
			}
		},
		production: {
			current: pinnedMetadata.asset.production.current,
			status: pinnedMetadata.asset.production.status,
			units: {
				production: pinnedMetadata.asset.production.units.production,
				revenue: pinnedMetadata.asset.production.units.revenue
			}
		},
		assetTerms: {
			interestType: pinnedMetadata.asset.assetTerms.interestType,
			amount: pinnedMetadata.asset.assetTerms.amount,
			paymentFrequency: pinnedMetadata.asset.assetTerms.paymentFrequency
		},
		tokenContracts: [sft.id],
		monthlyReports: pinnedMetadata.asset.receiptsData.map((report: any, i: number) => ({
			month: report.month, // YYYY-MM format
			production: report.assetData.production, // barrels
			revenue: report.assetData.revenue, // USD
			expenses: report.assetData.expenses, // USD
			netIncome: report.assetData.netIncome, // USD
			payoutPerToken: pinnedMetadata.payoutData[i].tokenPayout.payoutPerToken, // USD per token (optional for royalty assets)
		})),
        plannedProduction: assetPlannedProduction,
		metadata: {
			createdAt: new Date(Number(sft.deployTimestamp) * 1000).toISOString() as ISODateTimeString,
			updatedAt: new Date(Number(sft.deployTimestamp) * 1000).toISOString() as ISODateTimeString
		}
	}

	return assetInstance
}

export function getCalculatedRemainingProduction(asset: Asset): string {
    if (!asset?.plannedProduction?.projections) {
      return 'TBD';
    }

    // Sum all production from planned production projections
    const totalProduction = asset.plannedProduction.projections.reduce(
      (sum, projection) => sum + projection.production, 
      0
    );

    // Convert to mboe (thousand barrels)
    const productionInMboe = totalProduction / 1000;

    // Format with appropriate precision
    if (productionInMboe >= 10) {
      return `${Math.round(productionInMboe * 10) / 10} mboe`;
    } else {
      return `${Math.round(productionInMboe * 100) / 100} mboe`;
    }
  }