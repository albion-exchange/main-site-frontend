<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Globe, Menu, X, ChevronRight, Shield, ArrowUpRight, TrendingUp, 
		Calendar, MapPin, BarChart3, Activity, DollarSign, Zap, Clock, 
		AlertCircle, Download, RefreshCw, Search, Filter, Home, 
		Briefcase, User, BookOpen, Layers, Bell, Settings, LogOut,
		Plus, Minus, Eye, EyeOff, ChevronDown, Star, Award, Target,
		Users, Building, Percent, SlidersHorizontal, Grid3X3, List,
		Fuel, Droplets, Mountain, Waves, FileText, Camera, Play,
		ChevronLeft, Info, Thermometer, Gauge, Factory, Truck,
		CheckCircle, ExternalLink, History, Wallet, ArrowDown
	} from 'lucide-svelte';

	interface Asset {
		id: number;
		name: string;
		location: string;
		unclaimedAmount: number;
		totalEarned: number;
		lastPayout: string;
		nextPayout: string;
		tokensOwned: number;
		currentYield: number;
		status: string;
		icon: any;
	}

	interface ClaimHistory {
		date: string;
		amount: number;
		asset: string;
		txHash: string;
		status: string;
	}

	let isSidebarOpen = true;
	let unclaimedYield = 1247.82;
	let totalEarned = 8472.15;
	let totalClaimed = 7224.33;
	let isAccruing = true;
	let selectedAssets: number[] = [];
	let claimMethod = 'wallet';
	let loading = true;
	let isConnected = true; // Auto-connected for demo
	let claiming = false;
	let claimSuccess = false;
	let claimError: string | null = null;

	let assets: Asset[] = [];
	let claimHistory: ClaimHistory[] = [];

	// Simulate yield accrual
	onMount(() => {
		// Initialize mock data
		assets = [
			{
				id: 1,
				name: 'Europa Wressle Release 1',
				location: 'North Sea Sector 7B',
				unclaimedAmount: 487.32,
				totalEarned: 2847.15,
				lastPayout: '2024-12-15',
				nextPayout: '2025-01-15',
				tokensOwned: 18750,
				currentYield: 14.8,
				status: 'producing',
				icon: Waves
			},
			{
				id: 2,
				name: 'Bakken Horizon Field',
				location: 'North Dakota, USA',
				unclaimedAmount: 342.18,
				totalEarned: 2156.47,
				lastPayout: '2024-12-10',
				nextPayout: '2025-01-10',
				tokensOwned: 12500,
				currentYield: 12.4,
				status: 'producing',
				icon: Mountain
			},
			{
				id: 3,
				name: 'Permian Basin Venture',
				location: 'Texas, USA',
				unclaimedAmount: 286.74,
				totalEarned: 1847.21,
				lastPayout: '2024-12-20',
				nextPayout: '2025-01-20',
				tokensOwned: 8750,
				currentYield: 13.9,
				status: 'producing',
				icon: Fuel
			},
			{
				id: 4,
				name: 'Gulf of Mexico Deep Water',
				location: 'Gulf of Mexico',
				unclaimedAmount: 131.58,
				totalEarned: 1621.32,
				lastPayout: '2024-12-05',
				nextPayout: '2025-01-05',
				tokensOwned: 6250,
				currentYield: 15.2,
				status: 'producing',
				icon: Droplets
			}
		];

		claimHistory = [
			{ date: '2024-12-15', amount: 487.32, asset: 'Europa Wressle Release 1', txHash: '0x7d8f...a2b1', status: 'completed' },
			{ date: '2024-12-10', amount: 342.18, asset: 'Bakken Horizon Field', txHash: '0x9c3e...f5d2', status: 'completed' },
			{ date: '2024-11-15', amount: 456.89, asset: 'Europa Wressle Release 1', txHash: '0x2f1a...c7e3', status: 'completed' },
			{ date: '2024-11-10', amount: 298.45, asset: 'Bakken Horizon Field', txHash: '0x8b4d...x9f4', status: 'completed' },
			{ date: '2024-10-20', amount: 312.67, asset: 'Permian Basin Venture', txHash: '0x5e2c...b8a5', status: 'completed' }
		];

		loading = false;

		// Start yield accrual simulation
		let interval: ReturnType<typeof setInterval>;
		if (isAccruing) {
			interval = setInterval(() => {
				unclaimedYield += (Math.random() * 0.05 + 0.02);
				totalEarned += (Math.random() * 0.05 + 0.02);
			}, 2000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	const navItems = [
		{ label: 'Home' },
		{ label: 'Assets' },
		{ label: 'Claim', active: true },
		{ label: 'Portfolio' },
		{ label: 'New Order' },
		{ label: 'Orders' },
		{ label: 'Vaults' }
	];

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function handleAssetSelect(assetId: number) {
		if (selectedAssets.includes(assetId)) {
			selectedAssets = selectedAssets.filter(id => id !== assetId);
		} else {
			selectedAssets = [...selectedAssets, assetId];
		}
	}

	function handleSelectAll() {
		if (selectedAssets.length === assets.length) {
			selectedAssets = [];
		} else {
			selectedAssets = assets.map(asset => asset.id);
		}
	}

	function getSelectedAmount(): number {
		return assets
			.filter(asset => selectedAssets.includes(asset.id))
			.reduce((sum, asset) => sum + asset.unclaimedAmount, 0);
	}

	async function handleClaim() {
		// Simulate claim transaction
		claiming = true;
		claimError = null;
		claimSuccess = false;

		try {
			await new Promise(resolve => setTimeout(resolve, 3000));
			
			// Simulate successful claim
			const claimedAmount = getSelectedAmount() || unclaimedYield;
			totalClaimed += claimedAmount;
			unclaimedYield = Math.max(0, unclaimedYield - claimedAmount);
			
			// Reset selected assets
			selectedAssets = [];
			claimSuccess = true;
			
		} catch (error) {
			claimError = 'Failed to claim rewards. Please try again.';
			console.error('Claim error:', error);
		} finally {
			claiming = false;
		}
	}

	function connectWallet() {
		isConnected = true;
	}
</script>

<svelte:head>
	<title>Claim Yield - Albion</title>
	<meta name="description" content="Claim your asset income distributions" />
</svelte:head>

<div class="min-h-screen bg-white text-black font-sans overflow-x-hidden">
	<!-- Sidebar -->
	<div class={`fixed left-0 top-0 h-full bg-black border-r border-gray-800 transition-all duration-300 z-50 ${
		isSidebarOpen ? 'w-64' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-16'
	}`}>
		<div class="p-4 border-b border-gray-800">
			<div class="flex items-center space-x-3">
				<div class="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0">
					<div class="w-6 h-6 bg-black rounded-sm"></div>
				</div>
				<div class="min-w-0">
					<h1 class="text-lg font-black text-white truncate">ALBION EXCHANGE</h1>
					<p class="text-xs text-gray-400">Energy DeFi Platform</p>
				</div>
			</div>
		</div>
		
		<nav class="mt-6 px-2">
			{#each navItems as item, index}
				<div class={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-all text-sm ${
					item.active ? 'bg-blue-900 text-white font-semibold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
				}`}>
					<span class="truncate">{item.label}</span>
				</div>
			{/each}
		</nav>
	</div>

	<!-- Main Content -->
	<div class="ml-64 transition-all duration-300 min-h-screen">
		<!-- Header -->
		<header class="bg-white border-b border-black px-4 py-4 sticky top-0 z-30">
			<div class="flex items-center justify-between max-w-full">
				<div class="flex items-center space-x-4 min-w-0">
					<button 
						on:click={() => isSidebarOpen = !isSidebarOpen} 
						class="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 border border-black"
					>
						<Menu class="w-5 h-5" />
					</button>
					<div class="flex items-center space-x-2">
						<h2 class="text-xl font-black text-black">CLAIM YIELD</h2>
					</div>
				</div>
				<div class="flex items-center space-x-4 flex-shrink-0">
					<button 
						on:click={() => isAccruing = !isAccruing}
						class={`px-4 py-2 rounded-lg text-sm font-black border-2 transition-all ${
							isAccruing 
								? 'bg-green-500 text-white border-green-500' 
								: 'bg-gray-500 text-white border-gray-500'
						}`}
					>
						{isAccruing ? 'ACCRUING' : 'PAUSED'}
					</button>
					<button class="px-4 py-2 border-2 border-black text-black rounded-lg font-black text-sm hover:bg-black hover:text-white transition-all">
						BUY TOKENS
					</button>
					<div class="bg-black text-white px-4 py-2 rounded-lg text-sm font-black border-2 border-black">
						CONNECTED: 0x7d8f...a2b1
					</div>
				</div>
			</div>
		</header>

		{#if loading}
			<div class="text-center p-6">
				<p>Loading your claims...</p>
			</div>
		{:else}
			<div class="max-w-full p-6">
				<!-- Status Messages -->
				{#if claimSuccess}
					<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
						<h3 class="font-black text-green-800">Claims Successful!</h3>
						<p class="text-green-600">Your income has been successfully transferred to your wallet.</p>
					</div>
				{/if}

				{#if claimError}
					<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
						<h3 class="font-black text-red-800">Claim Failed</h3>
						<p class="text-red-600">{claimError}</p>
					</div>
				{/if}

				<!-- Yield Overview -->
				<div class="bg-gradient-to-br from-green-900/5 via-white to-white border-2 border-gray-300 rounded-lg p-8 mb-6">
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div class="lg:col-span-2">
							<h1 class="text-4xl font-black text-black mb-6">YIELD DASHBOARD</h1>
							
							<div class="grid grid-cols-3 gap-6 mb-6">
								<div class="text-center border-r border-gray-300 pr-6">
									<div class="text-3xl font-black text-green-600">{formatCurrency(totalEarned)}</div>
									<div class="text-sm font-black text-gray-600">TOTAL EARNED</div>
									<div class="text-xs text-green-600 mt-1">All time</div>
								</div>
								<div class="text-center border-r border-gray-300 pr-6">
									<div class="text-3xl font-black text-black">{formatCurrency(totalClaimed)}</div>
									<div class="text-sm font-black text-gray-600">TOTAL CLAIMED</div>
									<div class="text-xs text-blue-600 mt-1">Withdrawn</div>
								</div>
								<div class="text-center">
									<div class="text-3xl font-black text-orange-600">{formatCurrency(unclaimedYield)}</div>
									<div class="text-sm font-black text-gray-600">UNCLAIMED</div>
									<div class="text-xs text-orange-600 mt-1">Available now</div>
								</div>
							</div>

							<div class="flex items-center space-x-4">
								<div class="flex items-center space-x-2">
									<Activity class={`w-4 h-4 ${isAccruing ? 'text-green-500' : 'text-gray-400'}`} />
									<span class="font-black text-sm">{isAccruing ? 'ACCRUING LIVE' : 'PAUSED'}</span>
								</div>
								<div class="text-sm text-gray-600 font-semibold">
									Last updated: {new Date().toLocaleTimeString()}
								</div>
							</div>
						</div>

						<!-- Quick Claim Panel -->
						<div class="bg-white border-2 border-gray-300 rounded-lg p-6">
							<h3 class="text-xl font-black mb-4 text-black">QUICK CLAIM</h3>
							
							<div class="text-center mb-6">
								<div class="text-3xl font-black text-orange-600">{formatCurrency(unclaimedYield)}</div>
								<div class="text-sm font-black text-gray-600">TOTAL AVAILABLE</div>
							</div>

							<div class="space-y-3 mb-6">
								<button 
									on:click={handleClaim}
									class="w-full bg-green-800 text-white py-4 rounded-lg font-black text-sm hover:bg-green-900 transition-all border-2 border-green-800"
									disabled={claiming}
								>
									{#if claiming}
										CLAIMING...
									{:else}
										CLAIM ALL {formatCurrency(unclaimedYield)}
									{/if}
								</button>
								<button class="w-full bg-gray-600 text-white py-3 rounded-lg font-black text-sm hover:bg-gray-700 transition-all border-2 border-gray-600">
									CLAIM & REINVEST
								</button>
								<button class="w-full bg-black text-white py-3 rounded-lg font-black text-sm hover:bg-gray-900 transition-all border-2 border-black">
									CLAIM & BUY $ALBION
								</button>
							</div>

							<div class="bg-gray-50 border border-gray-300 rounded-lg p-4">
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-black text-gray-600">Gas Estimate</span>
									<span class="font-black text-black">~$12.50</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm font-black text-gray-600">Net Amount</span>
									<span class="font-black text-green-600">{formatCurrency(unclaimedYield - 12.50)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Asset-by-Asset Claiming -->
				<div class="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-2xl font-black text-black">CLAIM BY ASSET</h2>
						<div class="flex items-center space-x-4">
							<button 
								on:click={handleSelectAll}
								class="px-4 py-2 border-2 border-black text-black rounded-lg font-black text-sm hover:bg-black hover:text-white transition-all"
							>
								{selectedAssets.length === assets.length ? 'DESELECT ALL' : 'SELECT ALL'}
							</button>
							{#if selectedAssets.length > 0}
								<button 
									on:click={handleClaim}
									class="bg-green-800 text-white px-6 py-2 rounded-lg font-black text-sm hover:bg-green-900 transition-all"
									disabled={claiming}
								>
									{#if claiming}
										CLAIMING...
									{:else}
										CLAIM SELECTED {formatCurrency(getSelectedAmount())}
									{/if}
								</button>
							{/if}
						</div>
					</div>

					<div class="space-y-4">
						{#each assets as asset}
							<div class="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-all">
								<div class="grid grid-cols-12 gap-4 items-center">
									<div class="col-span-1">
										<input 
											type="checkbox" 
											class="w-5 h-5"
											checked={selectedAssets.includes(asset.id)}
											on:change={() => handleAssetSelect(asset.id)}
										/>
									</div>
									
									<div class="col-span-4 flex items-center space-x-3">
										<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
											<svelte:component this={asset.icon} class="w-6 h-6 text-blue-600" />
										</div>
										<div>
											<h4 class="font-black text-black">{asset.name}</h4>
											<div class="text-sm text-gray-600">{asset.location}</div>
										</div>
									</div>

									<div class="col-span-2 text-center">
										<div class="text-xl font-black text-orange-600">{formatCurrency(asset.unclaimedAmount)}</div>
										<div class="text-xs text-gray-600">Unclaimed</div>
									</div>

									<div class="col-span-2 text-center">
										<div class="text-lg font-black text-green-600">{formatCurrency(asset.totalEarned)}</div>
										<div class="text-xs text-gray-600">Total Earned</div>
									</div>

									<div class="col-span-1 text-center">
										<div class="text-lg font-black text-black">{asset.tokensOwned.toLocaleString()}</div>
										<div class="text-xs text-gray-600">Tokens</div>
									</div>

									<div class="col-span-1 text-center">
										<div class="text-lg font-black text-green-600">{asset.currentYield}%</div>
										<div class="text-xs text-gray-600">Yield</div>
									</div>

									<div class="col-span-1">
										<button 
											on:click={() => handleAssetSelect(asset.id)}
											class="bg-black text-white px-3 py-2 rounded font-black text-xs hover:bg-gray-900 transition-all w-full"
										>
											CLAIM
										</button>
									</div>
								</div>

								<div class="mt-4 pt-4 border-t border-gray-200">
									<div class="grid grid-cols-2 gap-4 text-sm">
										<div class="flex justify-between">
											<span class="text-gray-600 font-semibold">Last Payout:</span>
											<span class="font-black text-black">{asset.lastPayout}</span>
										</div>
										<div class="flex justify-between">
											<span class="text-gray-600 font-semibold">Next Payout:</span>
											<span class="font-black text-black">{asset.nextPayout}</span>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Claim Settings -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<div class="bg-white border-2 border-gray-300 rounded-lg p-6">
						<h3 class="text-xl font-black mb-4 text-black">CLAIM SETTINGS</h3>
						
						<div class="space-y-4">
							<div>
								<label class="block text-sm font-black text-gray-600 mb-2">CLAIM METHOD</label>
								<div class="space-y-2">
									<label class="flex items-center space-x-3 cursor-pointer">
										<input 
											type="radio" 
											name="claimMethod" 
											value="wallet"
											bind:group={claimMethod}
											class="w-4 h-4"
										/>
										<div>
											<div class="font-black text-black text-sm">Direct to Wallet</div>
											<div class="text-xs text-gray-600">Instant transfer to connected wallet</div>
										</div>
									</label>
									<label class="flex items-center space-x-3 cursor-pointer">
										<input 
											type="radio" 
											name="claimMethod" 
											value="reinvest"
											bind:group={claimMethod}
											class="w-4 h-4"
										/>
										<div>
											<div class="font-black text-black text-sm">Auto-Reinvest</div>
											<div class="text-xs text-gray-600">Automatically purchase more tokens</div>
										</div>
									</label>
									<label class="flex items-center space-x-3 cursor-pointer">
										<input 
											type="radio" 
											name="claimMethod" 
											value="albion"
											bind:group={claimMethod}
											class="w-4 h-4"
										/>
										<div>
											<div class="font-black text-black text-sm">Buy $ALBION Token</div>
											<div class="text-xs text-gray-600">Convert to platform governance token</div>
										</div>
									</label>
								</div>
							</div>

							<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
								<div class="flex items-start space-x-2">
									<AlertCircle class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
									<div>
										<div class="font-black text-black text-sm">Gas Optimization</div>
										<div class="text-xs text-gray-600 mt-1">
											Batch multiple claims to save on gas fees. Current network fee: ~$12.50 per transaction.
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="bg-white border-2 border-gray-300 rounded-lg p-6">
						<h3 class="text-xl font-black mb-4 text-black">YIELD STATISTICS</h3>
						
						<div class="space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div class="text-center border border-gray-300 rounded-lg p-4">
									<div class="text-2xl font-black text-green-600">13.2%</div>
									<div class="text-xs font-black text-gray-600">AVG PORTFOLIO YIELD</div>
								</div>
								<div class="text-center border border-gray-300 rounded-lg p-4">
									<div class="text-2xl font-black text-black">{formatCurrency(totalEarned / 12)}</div>
									<div class="text-xs font-black text-gray-600">AVG MONTHLY INCOME</div>
								</div>
							</div>

							<div class="space-y-3">
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Total Claims This Year</span>
									<span class="font-black text-black">24</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Average Claim Amount</span>
									<span class="font-black text-black">{formatCurrency(totalClaimed / 24)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Days Since Last Claim</span>
									<span class="font-black text-black">3</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Next Scheduled Payout</span>
									<span class="font-black text-black">Jan 5, 2025</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Claim History -->
				<div class="bg-white border-2 border-gray-300 rounded-lg p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-2xl font-black text-black">CLAIM HISTORY</h2>
						<div class="flex space-x-2">
							<button class="px-4 py-2 bg-black text-white rounded-lg font-black text-sm">RECENT</button>
							<button class="px-4 py-2 border-2 border-black text-black rounded-lg font-black text-sm hover:bg-black hover:text-white transition-all">ALL TIME</button>
							<button class="flex items-center space-x-2 border-2 border-gray-300 px-3 py-2 rounded-lg font-black hover:bg-gray-100 transition-all">
								<Download class="w-4 h-4" />
								<span>EXPORT</span>
							</button>
						</div>
					</div>
					
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead>
								<tr class="border-b-2 border-gray-300">
									<th class="text-left py-4 px-4 font-black text-black">DATE</th>
									<th class="text-left py-4 px-4 font-black text-black">ASSET</th>
									<th class="text-right py-4 px-4 font-black text-black">AMOUNT</th>
									<th class="text-left py-4 px-4 font-black text-black">TRANSACTION</th>
									<th class="text-center py-4 px-4 font-black text-black">STATUS</th>
								</tr>
							</thead>
							<tbody>
								{#each claimHistory as claim}
									<tr class="border-b border-gray-200 hover:bg-gray-50">
										<td class="py-4 px-4 font-semibold text-black">{claim.date}</td>
										<td class="py-4 px-4">
											<div class="font-black text-black text-sm">{claim.asset}</div>
										</td>
										<td class="py-4 px-4 text-right font-black text-green-600">
											{formatCurrency(claim.amount)}
										</td>
										<td class="py-4 px-4">
											<div class="flex items-center space-x-2">
												<span class="font-mono text-sm text-gray-600">{claim.txHash}</span>
												<ExternalLink class="w-4 h-4 text-gray-400 hover:text-black cursor-pointer" />
											</div>
										</td>
										<td class="py-4 px-4 text-center">
											<div class="flex items-center justify-center space-x-2">
												<CheckCircle class="w-4 h-4 text-green-500" />
												<span class="text-green-600 font-black text-sm">COMPLETED</span>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<footer class="bg-gray-900 text-white py-8 border-t border-gray-800">
		<div class="max-w-7xl mx-auto px-6">
			<div class="grid grid-cols-4 gap-8 mb-6">
				<div>
					<h4 class="font-black text-white mb-3">PLATFORM</h4>
					<ul class="space-y-2">
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Assets</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Portfolio</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Claim Yield</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Orders</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-black text-white mb-3">RESOURCES</h4>
					<ul class="space-y-2">
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Documentation</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">API Reference</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Risk Disclosures</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Audit Reports</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-black text-white mb-3">LEGAL</h4>
					<ul class="space-y-2">
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Terms of Service</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Compliance</a></li>
						<li><a href="#" class="text-gray-300 hover:text-white text-sm transition-colors">Contact</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-black text-white mb-3">ALBION EXCHANGE</h4>
					<p class="text-gray-300 text-sm mb-3">
						Institutional-grade oil & gas investments through blockchain technology.
					</p>
					<div class="flex items-center space-x-2">
						<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<span class="text-green-400 text-sm font-black">OPERATIONAL</span>
					</div>
				</div>
			</div>
			<div class="border-t border-gray-800 pt-6 text-center">
				<p class="text-gray-400 text-sm">
					© 2025 Albion Exchange. All rights reserved. | Licensed & Regulated Investment Platform
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	/* Custom styles for FigTree font and Albion design system */
	:global(body) {
		font-family: 'FigTree', sans-serif;
	}
	
	/* Utility classes matching Albion design system */
	.font-black {
		font-weight: 900;
	}
	
	/* Animation for accruing indicator */
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	
	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>