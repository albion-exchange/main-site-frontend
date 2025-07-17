<script lang="ts">
	import { page } from '$app/stores';
	import { 
		useAssetData, 
		useDataExport, 
		useTooltip, 
		useEmailNotification,
		useChartData 
	} from '$lib/composables';
	import { Card, CardContent, PrimaryButton, SecondaryButton, Chart } from '$lib/components/ui';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import MetricDisplay from '$lib/components/ui/MetricDisplay.svelte';
	import TabButton from '$lib/components/ui/TabButton.svelte';
	import { PageLayout, ContentSection } from '$lib/components/layout';
	import { formatCurrency, formatEndDate } from '$lib/utils/formatters';
	
	// Composables
	const { state, hasAvailableTokens, productionMetrics, revenueMetrics, latestReport, getRevenueChartData } = useAssetData($page.params.id);
	const { exportData } = useDataExport();
	const { state: tooltipState, show: showTooltip, hide: hideTooltip } = useTooltip();
	const { state: emailState, setEmail, submit: submitEmail } = useEmailNotification();
	const chartData = useChartData();
	
	// Component state
	let activeTab = 'overview';
	let showPurchaseWidget = false;
	let selectedTokenAddress: string | null = null;
	
	// Reactive data
	$: asset = $state.asset;
	$: tokens = $state.tokens;
	$: loading = $state.loading;
	$: error = $state.error;
	$: metrics = { production: $productionMetrics, revenue: $revenueMetrics, latestReport: $latestReport };
	
	// Chart data
	$: productionChartData = asset && asset.monthlyReports ? chartData.getProductionChartData(asset.monthlyReports) : [];
	$: financialChartData = asset && asset.monthlyReports ? chartData.getFinancialChartData(asset.monthlyReports) : [];
	$: payoutChartData = asset && asset.monthlyReports ? chartData.getPayoutChartData(asset.monthlyReports) : [];
	
	// Export handlers
	function handleExportProduction() {
		if (asset) {
			exportData('production', asset);
		}
	}
	
	function handleExportPayments() {
		if (tokens.length > 0) {
			exportData('payments', tokens);
		}
	}
	
	// Email notification handler
	async function handleEmailSubmit() {
		const email = $emailState.email;
		await submitEmail({
			email,
			assetId: asset?.id,
			notificationType: 'asset-updates'
		});
	}
	
	// Purchase handler
	function handleBuyTokens(tokenAddress: string) {
		selectedTokenAddress = tokenAddress;
		showPurchaseWidget = true;
	}
</script>

{#if loading}
	<PageLayout>
		<ContentSection>
			<div class="text-center py-12">
				<p class="text-gray-500">Loading asset details...</p>
			</div>
		</ContentSection>
	</PageLayout>
{:else if error}
	<PageLayout>
		<ContentSection>
			<div class="text-center py-12">
				<p class="text-red-500">{error}</p>
				<PrimaryButton href="/assets">Back to Assets</PrimaryButton>
			</div>
		</ContentSection>
	</PageLayout>
{:else if asset}
	<PageLayout>
		<!-- Hero Section -->
		<ContentSection background="gray" padding="large">
			<div class="flex justify-between items-start mb-8">
				<div>
					<h1 class="text-4xl font-extrabold mb-2">{asset.name}</h1>
					<p class="text-xl text-gray-600">{asset.location.state}, {asset.location.country}</p>
				</div>
				<div class="text-right">
					<p class="text-sm text-gray-500 mb-1">Operated by</p>
					<p class="text-lg font-semibold">{asset.operator.name}</p>
				</div>
			</div>
			
			<!-- Key Metrics -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
				<MetricDisplay
					label="Status"
					value={asset.production.status}
					variant={asset.production.status === 'producing' ? 'success' : 'default'}
				/>
				<MetricDisplay
					label="Last Payment"
					value={metrics.latestReport ? formatCurrency(metrics.latestReport.netIncome || 0) : 'N/A'}
					variant="primary"
				/>
				<MetricDisplay
					label="Revenue Share"
					value={asset.assetTerms.amount}
				/>
				<MetricDisplay
					label="Est. End Date"
					value={formatEndDate(asset.production.expectedEndDate || '')}
				/>
			</div>
		</ContentSection>
		
		<!-- Tab Navigation -->
		<ContentSection>
			<div class="flex gap-4 mb-6 border-b">
				<TabButton 
					active={activeTab === 'overview'} 
					on:click={() => activeTab = 'overview'}
				>
					Overview
				</TabButton>
				<TabButton 
					active={activeTab === 'production'} 
					on:click={() => activeTab = 'production'}
				>
					Production
				</TabButton>
				<TabButton 
					active={activeTab === 'financials'} 
					on:click={() => activeTab = 'financials'}
				>
					Financials
				</TabButton>
				<TabButton 
					active={activeTab === 'documents'} 
					on:click={() => activeTab = 'documents'}
				>
					Documents
				</TabButton>
			</div>
			
			<!-- Tab Content -->
			{#if activeTab === 'overview'}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<!-- Asset Details -->
					<Card>
						<CardContent>
							<SectionTitle level="h3" size="small" className="mb-4">Asset Details</SectionTitle>
							<dl class="space-y-3">
								<div class="flex justify-between">
									<dt class="text-gray-600">Interest Type</dt>
									<dd class="font-semibold">{asset.assetTerms.interestType}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-gray-600">Depth</dt>
									<dd class="font-semibold">{asset.technical.depth}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-gray-600">Type</dt>
									<dd class="font-semibold">{asset.technical.fieldType}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-gray-600">Water Depth</dt>
									<dd class="font-semibold">{asset.location.waterDepth || 'Onshore'}</dd>
								</div>
							</dl>
						</CardContent>
					</Card>
					
					<!-- Production Metrics -->
					{#if metrics.production}
						<Card>
							<CardContent>
								<SectionTitle level="h3" size="small" className="mb-4">Production Metrics</SectionTitle>
								<dl class="space-y-3">
									<div class="flex justify-between">
										<dt class="text-gray-600">Total Production</dt>
										<dd class="font-semibold">{metrics.production.totalProduction.toLocaleString()} BBL</dd>
									</div>
									<div class="flex justify-between">
										<dt class="text-gray-600">Avg Monthly</dt>
										<dd class="font-semibold">{Math.round(metrics.production.avgProduction).toLocaleString()} BBL</dd>
									</div>
									<div class="flex justify-between">
										<dt class="text-gray-600">Growth Rate</dt>
										<dd class="font-semibold">{metrics.production.growthRate.toFixed(1)}%</dd>
									</div>
									<div class="flex justify-between">
										<dt class="text-gray-600">Reports</dt>
										<dd class="font-semibold">{metrics.production.reportCount}</dd>
									</div>
								</dl>
							</CardContent>
						</Card>
					{/if}
				</div>
			{:else if activeTab === 'production'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<SectionTitle level="h3" size="small">Production History</SectionTitle>
						<SecondaryButton size="small" on:click={handleExportProduction}>
							Export CSV
						</SecondaryButton>
					</div>
					
					{#if productionChartData.length > 0}
						<Card>
							<CardContent>
								<Chart 
									data={productionChartData}
									type="line"
									xKey="date"
									yKeys={['production']}
									height={300}
								/>
							</CardContent>
						</Card>
					{:else}
						<p class="text-gray-500">No production data available</p>
					{/if}
				</div>
			{:else if activeTab === 'financials'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<SectionTitle level="h3" size="small">Financial Performance</SectionTitle>
						<SecondaryButton size="small" on:click={handleExportPayments}>
							Export Payments
						</SecondaryButton>
					</div>
					
					{#if financialChartData.length > 0}
						<Card>
							<CardContent>
								<Chart 
									data={financialChartData}
									type="bar"
									xKey="date"
									yKeys={['revenue', 'expenses', 'netIncome']}
									height={300}
								/>
							</CardContent>
						</Card>
					{/if}
					
					{#if metrics.revenue}
						<Card>
							<CardContent>
								<SectionTitle level="h4" size="small" className="mb-4">Revenue Summary</SectionTitle>
								<dl class="grid grid-cols-2 gap-4">
									<div>
										<dt class="text-gray-600 text-sm">Total Revenue</dt>
										<dd class="font-semibold text-lg">{formatCurrency(metrics.revenue.totalRevenue)}</dd>
									</div>
									<div>
										<dt class="text-gray-600 text-sm">Total Net Income</dt>
										<dd class="font-semibold text-lg">{formatCurrency(metrics.revenue.totalNetIncome)}</dd>
									</div>
									<div>
										<dt class="text-gray-600 text-sm">Avg Monthly Revenue</dt>
										<dd class="font-semibold text-lg">{formatCurrency(metrics.revenue.avgMonthlyRevenue)}</dd>
									</div>
									<div>
										<dt class="text-gray-600 text-sm">Profit Margin</dt>
										<dd class="font-semibold text-lg">{metrics.revenue.profitMargin.toFixed(1)}%</dd>
									</div>
								</dl>
							</CardContent>
						</Card>
					{/if}
				</div>
			{/if}
		</ContentSection>
		
		<!-- Token Purchase Section -->
		{#if $hasAvailableTokens && tokens.length > 0}
			<ContentSection background="gray">
				<div class="text-center">
					<SectionTitle level="h2" size="section" className="mb-4">Invest in {asset.name}</SectionTitle>
					<p class="text-gray-600 mb-6">Tokens available for purchase</p>
					<div class="flex justify-center gap-4">
						{#each tokens as token}
							<PrimaryButton on:click={() => handleBuyTokens(token.contractAddress)}>
								Buy {token.symbol} Tokens
							</PrimaryButton>
						{/each}
					</div>
				</div>
			</ContentSection>
		{/if}
		
		<!-- Email Notification -->
		<ContentSection>
			<Card>
				<CardContent className="text-center py-8">
					<h3 class="text-xl font-semibold mb-4">Stay Updated</h3>
					<p class="text-gray-600 mb-6">Get notified about production updates and payment distributions</p>
					<SecondaryButton on:click={() => emailState.showPopup = true}>
						Subscribe to Updates
					</SecondaryButton>
				</CardContent>
			</Card>
		</ContentSection>
	</PageLayout>
{/if}

<!-- Tooltips -->
{#if tooltipState.visible}
	<div class="tooltip">
		<!-- Tooltip content based on visible ID -->
	</div>
{/if}

<!-- Email Modal -->
{#if $emailState.showPopup}
	<div class="modal-backdrop" on:click={() => emailState.showPopup = false}>
		<div class="modal-content" on:click|stopPropagation>
			<h3 class="text-xl font-semibold mb-4">Subscribe to Updates</h3>
			<input
				type="email"
				placeholder="Enter your email"
				bind:value={$emailState.email}
				on:input={(e) => setEmail(e.target.value)}
				class="w-full p-2 border rounded mb-4"
			/>
			{#if $emailState.error}
				<p class="text-red-500 text-sm mb-4">{$emailState.error}</p>
			{/if}
			{#if $emailState.isSubmitted}
				<p class="text-green-500 text-sm mb-4">Successfully subscribed!</p>
			{/if}
			<div class="flex gap-4">
				<PrimaryButton 
					on:click={handleEmailSubmit}
					disabled={$emailState.isSubmitting}
				>
					{$emailState.isSubmitting ? 'Subscribing...' : 'Subscribe'}
				</PrimaryButton>
				<SecondaryButton on:click={() => emailState.showPopup = false}>
					Cancel
				</SecondaryButton>
			</div>
		</div>
	</div>
{/if}

<!-- Purchase Widget -->
{#if showPurchaseWidget && selectedTokenAddress}
	<!-- Token purchase widget component -->
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}
	
	.modal-content {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		max-width: 400px;
		width: 90%;
	}
	
	.tooltip {
		position: absolute;
		background: black;
		color: white;
		padding: 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		z-index: 100;
	}
</style>