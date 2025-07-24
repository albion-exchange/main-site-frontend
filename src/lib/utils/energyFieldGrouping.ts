import { ENERGY_FEILDS, type EnergyField } from "$lib/network";
import type { Asset } from "$lib/types/uiTypes";
import type { TokenMetadata } from "$lib/types/MetaboardTypes";

export interface GroupedEnergyField {
  id: string; // URL-friendly identifier for the energy field
  name: string;
  tokens: TokenMetadata[];
  asset: Asset;
}

/**
 * Groups SFTs by energy field names based on the ENERGY_FEILDS configuration
 * Each group contains all TokenMetadata for that energy field and one Asset instance
 */
export function groupSftsByEnergyField(
  tokensWithAssets: Array<{ token: TokenMetadata; asset: Asset }>,
): GroupedEnergyField[] {
  const grouped: Record<string, GroupedEnergyField> = {};

  // Initialize groups based on ENERGY_FEILDS configuration
  ENERGY_FEILDS.forEach((field) => {
    const fieldId = field.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    grouped[field.name] = {
      id: fieldId,
      name: field.name,
      tokens: [],
      asset: null as any,
    };
  });

  // Group tokens by matching their contract addresses with the energy field tokens
  tokensWithAssets.forEach((item) => {
    const matchingField = ENERGY_FEILDS.find((field) =>
      field.sftTokens.some(
        (tokenAddress) =>
          tokenAddress.toLowerCase() ===
          item.token.contractAddress.toLowerCase(),
      ),
    );

    if (matchingField) {
      if (!grouped[matchingField.name]) {
        const fieldId = matchingField.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        grouped[matchingField.name] = {
          id: fieldId,
          name: matchingField.name,
          tokens: [],
          asset: null as any,
        };
      }
      grouped[matchingField.name].tokens.push(item.token);
    } else {
      // If no matching field found, create a default group
      const defaultGroupName = "Other Assets";
      if (!grouped[defaultGroupName]) {
        const fieldId = defaultGroupName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        grouped[defaultGroupName] = {
          id: fieldId,
          name: defaultGroupName,
          tokens: [],
          asset: null as any,
        };
      }
      grouped[defaultGroupName].tokens.push(item.token);
    }
  });

  // Set asset from the token with the latest updatedAt
  Object.values(grouped).forEach((group) => {
    if (group.tokens.length > 0) {
      // Find the token with the latest updatedAt
      const latestToken = group.tokens.reduce((latest, current) => {
        const latestDate = new Date(latest.metadata?.updatedAt || 0);
        const currentDate = new Date(current.metadata?.updatedAt || 0);
        return currentDate > latestDate ? current : latest;
      });

      // Find the corresponding asset for this token
      const latestTokenWithAsset = tokensWithAssets.find(
        (item) =>
          item.token.contractAddress.toLowerCase() ===
          latestToken.contractAddress.toLowerCase(),
      );

      if (latestTokenWithAsset) {
        group.asset = latestTokenWithAsset.asset;
      }
    }
  });

  // Convert to array and filter out empty groups
  return Object.values(grouped).filter((group) => group.tokens.length > 0);
}

// Get energy field ID from token address
export function getEnergyFieldId(tokenAddress: string): string {
  const matchingField = ENERGY_FEILDS.find((field) =>
    field.sftTokens.some(
      (tokenAddr) => tokenAddr.toLowerCase() === tokenAddress.toLowerCase(),
    ),
  );

  if (matchingField) {
    return matchingField.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  // Fallback to a default ID if no matching field found
  return "other-assets";
}
