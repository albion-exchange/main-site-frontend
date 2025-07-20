/**
 * Example usage of WalletDataService
 * This demonstrates all the available methods and their outputs
 */

import { walletDataService } from "./WalletDataService";
import { formatCurrency, formatPercentage } from "$lib/utils/formatters";

// Example 1: Get total invested amount
console.log("=== Total Investment ===");
const totalInvested = walletDataService.getTotalInvested();
console.log(
  `Total Invested: ${formatCurrency(totalInvested)}`,
);

// Example 2: Get total payouts earned
console.log("\n=== Total Payouts ===");
const totalEarned = walletDataService.getTotalPayoutsEarned();
console.log(`Total Earned: ${formatCurrency(totalEarned)}`);

// Example 3: Get unclaimed payouts
console.log("\n=== Unclaimed Payouts ===");
const unclaimed = walletDataService.getUnclaimedPayouts();
console.log(`Unclaimed Amount: ${formatCurrency(unclaimed)}`);

// Example 4: Get holdings by asset with payout info
console.log("\n=== Holdings by Asset ===");
const holdings = walletDataService.getHoldingsByAsset();
holdings.forEach((holding) => {
  console.log(`\nAsset: ${holding.assetName}`);
  console.log(
    `  Invested: ${formatCurrency(holding.totalInvested)}`,
  );
  console.log(
    `  Earned: ${formatCurrency(holding.totalEarned)}`,
  );
  console.log(`  ROI: ${formatPercentage(holding.roi)}`);
  console.log(
    `  Unclaimed: ${formatCurrency(holding.unclaimedAmount)}`,
  );
});

// Example 5: Get monthly payout history
console.log("\n=== Monthly Payout History ===");
const monthlyPayouts = walletDataService.getMonthlyPayoutHistory();
monthlyPayouts.forEach((payout) => {
  console.log(
    `${payout.month}: ${formatCurrency(payout.totalPayout)}`,
  );
});

// Example 6: Get token allocation
console.log("\n=== Token Allocation ===");
const allocation = walletDataService.getTokenAllocation();
allocation.forEach((token) => {
  console.log(
    `${token.tokenSymbol}: ${token.tokensOwned} tokens (${formatPercentage(token.percentageOfPortfolio)} of portfolio)`,
  );
});

// Example 7: Get wallet metrics
console.log("\n=== Wallet Metrics ===");
const metrics = walletDataService.getWalletMetrics();
console.log(
  `Total Portfolio Value: ${formatCurrency(metrics.totalValue)}`,
);
console.log(
  `Total ROI: ${formatPercentage(metrics.totalROI)}`,
);
console.log(
  `Average Monthly Income: ${formatCurrency(metrics.averageMonthlyIncome)}`,
);
console.log(
  `Portfolio Diversity Score: ${metrics.portfolioDiversity.toFixed(2)}`,
);
if (metrics.nextExpectedPayout) {
  console.log(
    `Next Expected Payout: ${formatCurrency(metrics.nextExpectedPayout.estimatedAmount)} on ${metrics.nextExpectedPayout.estimatedDate}`,
  );
}

// Example 8: Get unclaimed payouts by asset
console.log("\n=== Unclaimed Payouts by Asset ===");
const unclaimedByAsset = walletDataService.getUnclaimedPayoutsByAsset();
unclaimedByAsset.forEach((asset) => {
  console.log(`\n${asset.assetName}:`);
  console.log(
    `  Total Unclaimed: ${formatCurrency(asset.totalUnclaimed)}`,
  );
  asset.unclaimedPayouts.forEach((payout) => {
    console.log(
      `  - ${payout.month}: ${formatCurrency(payout.amount)}`,
    );
  });
});

// Example 9: Get asset performance comparison
console.log("\n=== Asset Performance Comparison ===");
const performance = walletDataService.getAssetPerformanceComparison();
performance.forEach((asset, index) => {
  console.log(`${index + 1}. ${asset.assetName}`);
  console.log(`   ROI: ${formatPercentage(asset.roi)}`);
  console.log(
    `   Total Earned: ${formatCurrency(asset.totalEarned)}`,
  );
  console.log(
    `   Avg Monthly: ${formatCurrency(asset.averageMonthlyPayout)}`,
  );
});

// Example 10: Get estimated annual income
console.log("\n=== Estimated Annual Income ===");
const annualIncome = walletDataService.getEstimatedAnnualIncome();
console.log(
  `Estimated Annual Income: ${formatCurrency(annualIncome)}`,
);

// Example 11: Get payout frequency analysis
console.log("\n=== Payout Frequency Analysis ===");
const frequency = walletDataService.getPayoutFrequency();
console.log(
  `Average Days Between Payouts: ${frequency.averageDaysBetweenPayouts}`,
);
console.log(
  `Payout Consistency: ${frequency.isConsistent ? "Consistent" : "Variable"}`,
);

// Example 12: Get detailed monthly payouts
console.log("\n=== Detailed Monthly Payouts ===");
const detailedPayouts = walletDataService.getDetailedMonthlyPayouts();
detailedPayouts.slice(-3).forEach((month) => {
  console.log(
    `\n${month.month}: ${formatCurrency(month.totalPayout)}`,
  );
  month.assetBreakdown.forEach((asset) => {
    console.log(
      `  - ${asset.assetName}: ${formatCurrency(asset.amount)} (${asset.status})`,
    );
  });
});
