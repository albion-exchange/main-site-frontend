<script lang="ts">
	import { onMount } from 'svelte';

	let viewMode = 'grid'; // grid or list
	let sortBy = 'yield';
	let filterLocation = 'all';
	let filterYield = 'all';
	let filterStatus = 'all';
	let searchTerm = '';
	let loading = true;

	const allAssets = [
		{
			id: 1,
			name: 'Europa Wressle Release 1',
			location: 'North Sea Sector 7B',
			country: 'United Kingdom',
			operator: 'Europa Oil & Gas',
			currentYield: 14.8,
			baseYield: 12.5,
			totalValue: 2400000,
			minInvestment: 1000,
			riskLevel: 'AA-',
			daysToFunding: 15,
			productionCapacity: '2,400 bbl/day',
			reserves: '45.2M bbl',
			operatingCosts: 18.50,
			breakeven: 32.10,
			status: 'funding',
			tokensAvailable: 150000,
			tokensSold: 118750,
			investorCount: 247
		},
		{
			id: 2,
			name: 'Bakken Horizon Field',
			location: 'North Dakota, USA',
			country: 'United States',
			operator: 'Continental Resources',
			currentYield: 12.4,
			baseYield: 10.8,
			totalValue: 5200000,
			minInvestment: 2500,
			riskLevel: 'A+',
			daysToFunding: 23,
			productionCapacity: '4,100 bbl/day',
			reserves: '78.5M bbl',
			operatingCosts: 22.30,
			breakeven: 38.75,
			status: 'producing',
			tokensAvailable: 260000,
			tokensSold: 234200,
			investorCount: 412
		},
		{
			id: 3,
			name: 'Permian Basin Venture',
			location: 'Texas, USA',
			country: 'United States',
			operator: 'Pioneer Natural Resources',
			currentYield: 13.9,
			baseYield: 11.2,
			totalValue: 3800000,
			minInvestment: 5000,
			riskLevel: 'A',
			daysToFunding: 8,
			productionCapacity: '3,200 bbl/day',
			reserves: '62.3M bbl',
			operatingCosts: 19.80,
			breakeven: 35.60,
			status: 'funding',
			tokensAvailable: 190000,
			tokensSold: 143250,
			investorCount: 328
		},
		{
			id: 4,
			name: 'Gulf of Mexico Deep Water',
			location: 'Gulf of Mexico',
			country: 'United States',
			operator: 'Shell Exploration',
			currentYield: 15.2,
			baseYield: 13.8,
			totalValue: 8900000,
			minInvestment: 10000,
			riskLevel: 'A-',
			daysToFunding: 31,
			productionCapacity: '6,800 bbl/day',
			reserves: '125.7M bbl',
			operatingCosts: 28.90,
			breakeven: 45.20,
			status: 'producing',
			tokensAvailable: 445000,
			tokensSold: 401500,
			investorCount: 678
		},
		{
			id: 5,
			name: 'Norwegian Sea Platform',
			location: 'Norwegian Sea',
			country: 'Norway',
			operator: 'Equinor ASA',
			currentYield: 11.7,
			baseYield: 10.5,
			totalValue: 6700000,
			minInvestment: 7500,
			riskLevel: 'AA',
			daysToFunding: 19,
			productionCapacity: '5,100 bbl/day',
			reserves: '89.4M bbl',
			operatingCosts: 24.60,
			breakeven: 40.30,
			status: 'producing',
			tokensAvailable: 335000,
			tokensSold: 301500,
			investorCount: 523
		},
		{
			id: 6,
			name: 'Alberta Oil Sands Project',
			location: 'Alberta, Canada',
			country: 'Canada',
			operator: 'Suncor Energy',
			currentYield: 10.3,
			baseYield: 9.1,
			totalValue: 4300000,
			minInvestment: 3000,
			riskLevel: 'A+',
			daysToFunding: 12,
			productionCapacity: '3,900 bbl/day',
			reserves: '156.8M bbl',
			operatingCosts: 31.20,
			breakeven: 48.50,
			status: 'funding',
			tokensAvailable: 215000,
			tokensSold: 129000,
			investorCount: 289
		}
	];

	onMount(() => {
		setTimeout(() => {
			loading = false;
		}, 500);
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	// Filter and sort assets
	$: filteredAssets = allAssets.filter(asset => {
		const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 asset.operator.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesLocation = filterLocation === 'all' || asset.country === filterLocation;
		const matchesYield = filterYield === 'all' || 
							(filterYield === '10-12' && asset.currentYield >= 10 && asset.currentYield < 12) ||
							(filterYield === '12-15' && asset.currentYield >= 12 && asset.currentYield < 15) ||
							(filterYield === '15+' && asset.currentYield >= 15);
		const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
		
		return matchesSearch && matchesLocation && matchesYield && matchesStatus;
	}).sort((a, b) => {
		switch(sortBy) {
			case 'yield': return b.currentYield - a.currentYield;
			case 'value': return b.totalValue - a.totalValue;
			case 'name': return a.name.localeCompare(b.name);
			case 'funding': return a.daysToFunding - b.daysToFunding;
			default: return 0;
		}
	});

	function clearAllFilters() {
		searchTerm = '';
		filterLocation = 'all';
		filterYield = 'all';
		filterStatus = 'all';
	}
</script>

<svelte:head>
	<title>Assets - Albion</title>
	<meta name="description" content="Browse available oil field assets for investment" />
</svelte:head>

<main class="assets-page">
	<header class="page-header">
		<h1>Available Assets</h1>
		<p>Discover tokenized oil field investments</p>
	</header>

	{#if loading}
		<div class="loading-state">
			<p>Loading assets...</p>
		</div>
	{:else}
		<!-- Search and Filter Bar -->
		<div class="filter-section">
			<div class="search-bar">
				<input 
					type="text" 
					placeholder="Search assets by name, location, or operator..."
					bind:value={searchTerm}
					class="search-input"
				/>
			</div>
			<div class="filters">
				<select bind:value={filterLocation} class="filter-select">
					<option value="all">All Locations</option>
					<option value="United States">United States</option>
					<option value="United Kingdom">United Kingdom</option>
					<option value="Norway">Norway</option>
					<option value="Canada">Canada</option>
				</select>
				<select bind:value={filterYield} class="filter-select">
					<option value="all">All Yields</option>
					<option value="10-12">10-12%</option>
					<option value="12-15">12-15%</option>
					<option value="15+">15%+</option>
				</select>
				<select bind:value={filterStatus} class="filter-select">
					<option value="all">All Status</option>
					<option value="producing">Producing</option>
					<option value="funding">Funding</option>
				</select>
			</div>
		</div>

		<!-- Sort and View Controls -->
		<div class="controls-section">
			<div class="sort-controls">
				<span class="control-label">Sort By:</span>
				<select bind:value={sortBy} class="sort-select">
					<option value="yield">Highest Yield</option>
					<option value="value">Highest Value</option>
					<option value="name">Name A-Z</option>
					<option value="funding">Funding Soon</option>
				</select>
				<span class="asset-count">
					{filteredAssets.length} of {allAssets.length} assets
				</span>
			</div>
			<div class="view-controls">
				<span class="control-label">View:</span>
				<button 
					class="view-btn"
					class:active={viewMode === 'grid'}
					on:click={() => viewMode = 'grid'}
				>
					Grid
				</button>
				<button 
					class="view-btn"
					class:active={viewMode === 'list'}
					on:click={() => viewMode = 'list'}
				>
					List
				</button>
			</div>
		</div>

		<!-- Assets Display -->
		{#if filteredAssets.length === 0}
			<div class="empty-state">
				<h3>No Assets Found</h3>
				<p>Try adjusting your search criteria or filters to find assets.</p>
				<button class="btn-primary" on:click={clearAllFilters}>
					Clear All Filters
				</button>
			</div>
		{:else if viewMode === 'grid'}
			<div class="assets-grid">
				{#each filteredAssets as asset}
					<article class="asset-card">
						<div class="asset-header">
							<div class="asset-info">
								<h3>{asset.name}</h3>
								<p class="asset-location">{asset.location}</p>
								<p class="asset-operator">{asset.operator}</p>
							</div>
							<div class="asset-badges">
								<span class="risk-badge">{asset.riskLevel}</span>
								<span class="status-badge" class:producing={asset.status === 'producing'} class:funding={asset.status === 'funding'}>
									{asset.status.toUpperCase()}
								</span>
							</div>
						</div>
						
						<div class="asset-metrics">
							<div class="metric">
								<div class="metric-value">{asset.currentYield}%</div>
								<div class="metric-label">Current Yield</div>
							</div>
							<div class="metric">
								<div class="metric-value">${(asset.totalValue / 1000000).toFixed(1)}M</div>
								<div class="metric-label">Total Value</div>
							</div>
							<div class="metric">
								<div class="metric-value">{asset.investorCount}</div>
								<div class="metric-label">Investors</div>
							</div>
						</div>

						<div class="asset-details">
							<div class="detail-row">
								<span>Production:</span>
								<span>{asset.productionCapacity}</span>
							</div>
							<div class="detail-row">
								<span>Reserves:</span>
								<span>{asset.reserves}</span>
							</div>
							<div class="detail-row">
								<span>Min Investment:</span>
								<span>{formatCurrency(asset.minInvestment)}</span>
							</div>
							<div class="detail-row">
								<span>Breakeven:</span>
								<span>${asset.breakeven}</span>
							</div>
						</div>
						
						<!-- Token Progress -->
						<div class="token-progress">
							<div class="progress-header">
								<span>Token Sale Progress</span>
								<span>{((asset.tokensSold / asset.tokensAvailable) * 100).toFixed(1)}%</span>
							</div>
							<div class="progress-bar">
								<div 
									class="progress-fill" 
									style="width: {(asset.tokensSold / asset.tokensAvailable) * 100}%"
								></div>
							</div>
						</div>
						
						<div class="asset-actions">
							<a href="/buy-token?asset={asset.id}" class="btn-primary">Invest Now</a>
							<a href="/assets/{asset.id}" class="btn-secondary">View Details</a>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="assets-list">
				{#each filteredAssets as asset}
					<article class="asset-list-item">
						<div class="list-asset-info">
							<h4>{asset.name}</h4>
							<p>{asset.location}</p>
						</div>
						<div class="list-yield">
							<div class="metric-value">{asset.currentYield}%</div>
							<div class="metric-label">Yield</div>
						</div>
						<div class="list-value">
							<div class="metric-value">${(asset.totalValue / 1000000).toFixed(1)}M</div>
							<div class="metric-label">Value</div>
						</div>
						<div class="list-risk">
							<span class="risk-badge">{asset.riskLevel}</span>
						</div>
						<div class="list-status">
							<span class="status-badge" class:producing={asset.status === 'producing'} class:funding={asset.status === 'funding'}>
								{asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
							</span>
						</div>
						<div class="list-actions">
							<a href="/buy-token?asset={asset.id}" class="btn-primary-small">Invest</a>
							<a href="/assets/{asset.id}" class="btn-secondary-small">View</a>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	{/if}
</main>

<style>
	.assets-page {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.page-header p {
		font-size: 1.25rem;
		color: var(--color-black);
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-black);
	}

	.filter-section {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.search-bar {
		margin-bottom: 1.5rem;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-light-gray);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
		background: var(--color-white);
		color: var(--color-black);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-black);
	}

	.filters {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.filter-select {
		padding: 0.75rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
	}

	.filter-select:focus {
		outline: none;
		border-color: var(--color-black);
	}

	.controls-section {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem 2rem;
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sort-controls,
	.view-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.control-label {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sort-select {
		padding: 0.5rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
	}

	.asset-count {
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
		font-size: 0.9rem;
	}

	.view-btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
		color: var(--color-black);
		font-family: var(--font-family);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-btn:hover {
		border-color: var(--color-black);
	}

	.view-btn.active {
		background: var(--color-black);
		color: var(--color-white);
		border-color: var(--color-black);
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		border: 1px solid var(--color-light-gray);
		background: var(--color-white);
	}

	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-black);
	}

	.empty-state p {
		margin-bottom: 2rem;
		color: var(--color-black);
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.asset-card {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		transition: border-color 0.2s ease;
	}

	.asset-card:hover {
		border-color: var(--color-primary);
	}

	.asset-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.asset-info h3 {
		font-size: 1.1rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.asset-location {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.asset-operator {
		font-size: 0.7rem;
		color: var(--color-black);
		font-weight: var(--font-weight-medium);
	}

	.asset-badges {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}

	.risk-badge {
		background: var(--color-black);
		color: var(--color-white);
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
	}

	.status-badge {
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
	}

	.status-badge.producing {
		background: var(--color-light-gray);
		color: var(--color-primary);
	}

	.status-badge.funding {
		background: var(--color-light-gray);
		color: var(--color-secondary);
	}

	.asset-metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.metric {
		text-align: center;
	}

	.metric-value {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-primary);
		margin-bottom: 0.25rem;
	}

	.metric-label {
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.asset-details {
		margin-bottom: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-light-gray);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		font-size: 0.8rem;
	}

	.detail-row span:first-child {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
	}

	.detail-row span:last-child {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
	}

	.token-progress {
		margin-bottom: 2rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: var(--color-light-gray);
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.asset-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.assets-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.asset-list-item {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 1.5rem;
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
		gap: 2rem;
		align-items: center;
		transition: border-color 0.2s ease;
	}

	.asset-list-item:hover {
		border-color: var(--color-primary);
	}

	.list-asset-info h4 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.25rem;
		font-size: 1rem;
	}

	.list-asset-info p {
		font-size: 0.8rem;
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
	}

	.list-yield,
	.list-value {
		text-align: center;
	}

	.list-risk,
	.list-status {
		text-align: center;
	}

	.list-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		display: inline-block;
	}

	.btn-primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary:hover {
		background: var(--color-secondary);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.btn-secondary:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.btn-primary-small,
	.btn-secondary-small {
		padding: 0.5rem 1rem;
		text-align: center;
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.2s ease;
		display: inline-block;
	}

	.btn-primary-small {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary-small:hover {
		background: var(--color-secondary);
	}

	.btn-secondary-small {
		background: var(--color-white);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.btn-secondary-small:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	@media (max-width: 768px) {
		.assets-page {
			padding: 2rem 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.controls-section {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.sort-controls,
		.view-controls {
			justify-content: center;
		}

		.filters {
			flex-direction: column;
		}

		.assets-grid {
			grid-template-columns: 1fr;
		}

		.asset-list-item {
			grid-template-columns: 1fr;
			gap: 1rem;
			text-align: center;
		}

		.list-actions {
			justify-content: center;
		}
	}
</style>