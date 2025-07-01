<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { 
		Globe, Menu, X, ChevronRight, Shield, ArrowUpRight, TrendingUp, 
		Calendar, MapPin, BarChart3, Activity, DollarSign, Zap, Clock, 
		AlertCircle, Download, RefreshCw, Search, Filter, Home, 
		Briefcase, User, BookOpen, Layers, Bell, Settings, LogOut,
		Plus, Minus, Eye, EyeOff, ChevronDown, Star, Award, Target,
		Users, Building, Percent, SlidersHorizontal, Grid3X3, List,
		Fuel, Droplets, Mountain, Waves, FileText, Camera, Play,
		ChevronLeft, Info, Thermometer, Gauge, Factory, Truck,
		CheckCircle, ExternalLink, History, Wallet, ArrowDown,
		Calculator, CreditCard, Lock, ShoppingCart
	} from 'lucide-svelte';

	interface Tranche {
		id: string;
		name: string;
		yield: number;
		minInvestment: number;
		available: number;
		sold: number;
		terms: string;
		riskLevel: string;
		description: string;
		selectable: boolean;
	}

	let isSidebarOpen = true;
	let unclaimedYield = 1247.82;
	let selectedTranche = 'A';
	let investmentAmount = 5000;
	let paymentMethod = 'usdt';
	let userBalance = 15420.75;
	let agreedToTerms = false;
	let currentStep = 1;
	let orderReview = false;
	let loading = false;
	let purchasing = false;
	let purchaseSuccess = false;
	let purchaseError: string | null = null;

	const navItems = [
		{ label: 'Home' },
		{ label: 'Assets' },
		{ label: 'Claim' },
		{ label: 'Portfolio' },
		{ label: 'New Order', active: true },
		{ label: 'Orders' },
		{ label: 'Vaults' }
	];

	const assetData = {
		name: 'Europa Wressle Release 1',
		location: 'North Sea Sector 7B',
		operator: 'Europa Oil & Gas Holdings PLC',
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
		investorCount: 247,
		icon: Waves
	};

	const tranches: Tranche[] = [
		{
			id: 'A',
			name: 'Tranche A - Priority',
			yield: 14.8,
			minInvestment: 1000,
			available: 50000,
			sold: 43750,
			terms: 'First priority on distributions, premium yield',
			riskLevel: 'AA-',
			description: 'Highest yield with priority distribution rights',
			selectable: true
		},
		{
			id: 'B',
			name: 'Tranche B - Standard',
			yield: 12.5,
			minInvestment: 2500,
			available: 75000,
			sold: 56250,
			terms: 'Standard distribution priority, base yield',
			riskLevel: 'A+',
			description: 'Balanced risk-return profile with standard terms',
			selectable: false
		},
		{
			id: 'C',
			name: 'Tranche C - Volume',
			yield: 11.2,
			minInvestment: 5000,
			available: 25000,
			sold: 18750,
			terms: 'Volume discount, lower minimum yield',
			riskLevel: 'A',
			description: 'Lower yield but higher volume allocation',
			selectable: false
		}
	];

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function getSelectedTrancheData(): Tranche {
		return tranches.find(t => t.id === selectedTranche) || tranches[0];
	}

	function calculateOrder() {
		const tranche = getSelectedTrancheData();
		const tokens = Math.floor(investmentAmount / 10); // $10 per token
		const annualYield = (investmentAmount * tranche.yield) / 100;
		const monthlyYield = annualYield / 12;
		const platformFee = investmentAmount * 0.005; // 0.5% platform fee
		const gasFee = 25.00; // Estimated gas fee
		const totalCost = investmentAmount + platformFee + gasFee;
		
		return {
			tokens,
			annualYield,
			monthlyYield,
			platformFee,
			gasFee,
			totalCost,
			tranche
		};
	}

	$: order = calculateOrder();

	function handlePurchase() {
		if (currentStep < 3) {
			currentStep = currentStep + 1;
		} else {
			// Execute purchase
			purchasing = true;
			purchaseError = null;
			purchaseSuccess = false;

			setTimeout(() => {
				purchasing = false;
				purchaseSuccess = true;
			}, 3000);
		}
	}

	function canProceed(): boolean {
		if (currentStep === 1) {
			return investmentAmount >= order.tranche.minInvestment;
		} else if (currentStep === 2) {
			return userBalance >= order.totalCost;
		} else if (currentStep === 3) {
			return agreedToTerms;
		}
		return false;
	}
</script>

<svelte:head>
	<title>Buy Yield - Albion</title>
	<meta name="description" content="Purchase asset tokens for yield generation" />
</svelte:head>

{#if purchaseSuccess}
	<div class="min-h-screen bg-white text-black font-sans overflow-x-hidden flex items-center justify-center">
		<div class="text-center p-8 max-w-md">
			<CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
			<h1 class="text-3xl font-black mb-4">Purchase Successful!</h1>
			<p class="text-gray-600 mb-6">You have successfully purchased {order.tokens.toLocaleString()} tokens of {assetData.name}.</p>
			<div class="space-y-3">
				<a href="/portfolio" class="block w-full bg-black text-white py-3 rounded-lg font-black text-sm hover:bg-gray-900 transition-all">
					VIEW PORTFOLIO
				</a>
				<button 
					on:click={() => purchaseSuccess = false}
					class="w-full border-2 border-black text-black py-3 rounded-lg font-black text-sm hover:bg-black hover:text-white transition-all"
				>
					BUY MORE TOKENS
				</button>
			</div>
		</div>
	</div>
{:else}
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
							<button class="flex items-center space-x-2 text-gray-600 hover:text-black font-semibold">
								<ChevronLeft class="w-4 h-4" />
								<span>BACK TO ASSETS</span>
							</button>
							<ChevronRight class="w-4 h-4 text-gray-400" />
							<h2 class="text-xl font-black text-black">BUY YIELD</h2>
						</div>
					</div>
					<div class="flex items-center space-x-4 flex-shrink-0">
						<div class="bg-gray-100 px-4 py-2 rounded-lg text-sm font-black border border-gray-300">
							BALANCE: {formatCurrency(userBalance)}
						</div>
						<button class="bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-black border-2 border-green-800 hover:bg-green-900 transition-all">
							CLAIM {formatCurrency(unclaimedYield)}
						</button>
						<div class="bg-black text-white px-4 py-2 rounded-lg text-sm font-black border-2 border-black">
							CONNECTED: 0x7d8f...a2b1
						</div>
					</div>
				</div>
			</header>

			<div class="max-w-full p-6">
				{#if purchaseError}
					<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
						<h3 class="font-black text-red-800">Purchase Failed</h3>
						<p class="text-red-600">{purchaseError}</p>
					</div>
				{/if}

				<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<!-- Main Purchase Form -->
					<div class="lg:col-span-2 space-y-6">
						<!-- Asset Header -->
						<div class="bg-gradient-to-br from-blue-900/5 via-white to-white border-2 border-gray-300 rounded-lg p-6">
							<div class="flex items-start space-x-4">
								<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<svelte:component this={assetData.icon} class="w-6 h-6 text-blue-600" />
								</div>
								<div class="flex-1">
									<h2 class="text-2xl font-black text-black mb-2">{assetData.name}</h2>
									<div class="flex items-center space-x-4 text-sm text-gray-600 mb-4">
										<div class="flex items-center">
											<MapPin class="w-4 h-4 mr-1" />
											{assetData.location}
										</div>
										<span>•</span>
										<span>Operated by {assetData.operator}</span>
									</div>
									<div class="grid grid-cols-4 gap-4">
										<div class="text-center">
											<div class="text-lg font-black text-green-600">{assetData.currentYield}%</div>
											<div class="text-xs font-black text-gray-600">CURRENT YIELD</div>
										</div>
										<div class="text-center">
											<div class="text-lg font-black text-black">{assetData.productionCapacity}</div>
											<div class="text-xs font-black text-gray-600">PRODUCTION</div>
										</div>
										<div class="text-center">
											<div class="text-lg font-black text-black">{assetData.riskLevel}</div>
											<div class="text-xs font-black text-gray-600">RISK RATING</div>
										</div>
										<div class="text-center">
											<div class="text-lg font-black text-black">{assetData.daysToFunding}</div>
											<div class="text-xs font-black text-gray-600">DAYS TO CLOSE</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Step 1: Investment Selection -->
						{#if currentStep === 1}
							<div class="bg-white border-2 border-gray-300 rounded-lg p-6">
								<h3 class="text-xl font-black mb-6 text-black">STEP 1: SELECT INVESTMENT</h3>
								
								<!-- Tranche Selection -->
								<div class="mb-6">
									<label class="block text-sm font-black text-gray-600 mb-4">CHOOSE TRANCHE</label>
									<div class="space-y-3">
										{#each tranches as tranche}
											<div 
												class={`border-2 rounded-lg p-4 transition-all ${
													tranche.selectable 
														? selectedTranche === tranche.id 
															? 'border-black bg-gray-50 cursor-pointer' 
															: 'border-gray-300 hover:border-gray-400 cursor-pointer'
														: 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
												}`} 
												on:click={() => tranche.selectable && (selectedTranche = tranche.id)}
												on:keydown={() => tranche.selectable && (selectedTranche = tranche.id)}
												role="button"
												tabindex="0"
											>
												<div class="flex items-center justify-between">
													<div class="flex items-center space-x-3">
														<input 
															type="radio" 
															name="tranche" 
															value={tranche.id}
															checked={selectedTranche === tranche.id}
															on:change={() => tranche.selectable && (selectedTranche = tranche.id)}
															disabled={!tranche.selectable}
															class={`w-4 h-4 ${!tranche.selectable ? 'opacity-50' : ''}`}
														/>
														<div>
															<div class={`font-black ${tranche.selectable ? 'text-black' : 'text-gray-400'}`}>{tranche.name}</div>
															<div class={`text-sm ${tranche.selectable ? 'text-gray-600' : 'text-gray-400'}`}>{tranche.description}</div>
														</div>
													</div>
													<div class="text-right">
														<div class={`text-xl font-black ${tranche.selectable ? 'text-green-600' : 'text-gray-400'}`}>{tranche.yield}%</div>
														<div class={`text-xs ${tranche.selectable ? 'text-gray-600' : 'text-gray-400'}`}>APY</div>
													</div>
												</div>
												<div class="mt-3 grid grid-cols-3 gap-4 text-sm">
													<div>
														<span class={`${tranche.selectable ? 'text-gray-600' : 'text-gray-400'} font-semibold`}>Min Investment:</span>
														<span class={`font-black ml-1 ${tranche.selectable ? 'text-black' : 'text-gray-400'}`}>{formatCurrency(tranche.minInvestment)}</span>
													</div>
													<div>
														<span class={`${tranche.selectable ? 'text-gray-600' : 'text-gray-400'} font-semibold`}>Available:</span>
														<span class={`font-black ml-1 ${tranche.selectable ? 'text-black' : 'text-gray-400'}`}>{(tranche.available - tranche.sold).toLocaleString()} tokens</span>
													</div>
													<div>
														<span class={`${tranche.selectable ? 'text-gray-600' : 'text-gray-400'} font-semibold`}>Risk Level:</span>
														<span class={`font-black ml-1 ${tranche.selectable ? 'text-black' : 'text-gray-400'}`}>{tranche.riskLevel}</span>
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>

								<!-- Investment Amount -->
								<div class="mb-6">
									<label for="investment-amount" class="block text-sm font-black text-gray-600 mb-3">INVESTMENT AMOUNT</label>
									<div class="relative">
										<input 
											id="investment-amount"
											type="number" 
											bind:value={investmentAmount}
											class="w-full px-4 py-4 border-2 border-gray-300 rounded-lg font-black text-xl focus:border-black"
											min={order.tranche.minInvestment}
											placeholder={formatCurrency(order.tranche.minInvestment)}
										/>
										<div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
											USD
										</div>
									</div>
									<div class="flex justify-between text-sm mt-2">
										<span class="text-gray-600">Minimum: {formatCurrency(order.tranche.minInvestment)}</span>
										<span class="text-gray-600">You'll receive: {order.tokens.toLocaleString()} tokens</span>
									</div>
								</div>

								<!-- Quick Amount Buttons -->
								<div class="grid grid-cols-4 gap-3 mb-6">
									{#each [1000, 5000, 10000, 25000] as amount}
										<button
											on:click={() => investmentAmount = amount}
											class={`py-3 rounded-lg font-black text-sm transition-all ${
												investmentAmount === amount
													? 'bg-black text-white'
													: 'border-2 border-gray-300 hover:border-black'
											}`}
										>
											{formatCurrency(amount)}
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Step 2: Payment Method -->
						{#if currentStep === 2}
							<div class="bg-white border-2 border-gray-300 rounded-lg p-6">
								<h3 class="text-xl font-black mb-6 text-black">STEP 2: PAYMENT METHOD</h3>
								
								<div class="space-y-4">
									<div class="border-2 border-black bg-gray-50 rounded-lg p-4">
										<div class="flex items-center justify-between">
											<div class="flex items-center space-x-3">
												<div class="w-4 h-4 bg-black rounded-full flex items-center justify-center">
													<div class="w-2 h-2 bg-white rounded-full"></div>
												</div>
												<div>
													<div class="font-black text-black">USDT (Tether)</div>
													<div class="text-sm text-gray-600">Pay with USDT stable coin</div>
												</div>
											</div>
											<div class="text-right">
												<div class="font-black text-black">{formatCurrency(userBalance)}</div>
												<div class="text-xs text-gray-600">Available</div>
											</div>
										</div>
									</div>
								</div>

								{#if userBalance < order.totalCost}
									<div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
										<div class="flex items-start space-x-2">
											<AlertCircle class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
											<div>
												<div class="font-black text-black text-sm">Insufficient Balance</div>
												<div class="text-xs text-gray-600 mt-1">
													You need {formatCurrency(order.totalCost - userBalance)} more to complete this purchase.
												</div>
												<button class="mt-2 px-3 py-1 bg-black text-white rounded text-xs font-black hover:bg-gray-900">
													BUY MORE USDT
												</button>
											</div>
										</div>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Step 3: Review & Confirm -->
						{#if currentStep === 3}
							<div class="bg-white border-2 border-gray-300 rounded-lg p-6">
								<h3 class="text-xl font-black mb-6 text-black">STEP 3: REVIEW & CONFIRM</h3>
								
								<div class="space-y-6">
									<!-- Investment Summary -->
									<div class="bg-gray-50 border border-gray-300 rounded-lg p-4">
										<h4 class="font-black text-black mb-3">INVESTMENT SUMMARY</h4>
										<div class="grid grid-cols-2 gap-4">
											<div>
												<div class="text-sm text-gray-600 font-semibold">Asset</div>
												<div class="font-black text-black">{assetData.name}</div>
											</div>
											<div>
												<div class="text-sm text-gray-600 font-semibold">Tranche</div>
												<div class="font-black text-black">{order.tranche.name}</div>
											</div>
											<div>
												<div class="text-sm text-gray-600 font-semibold">Investment Amount</div>
												<div class="font-black text-black">{formatCurrency(investmentAmount)}</div>
											</div>
											<div>
												<div class="text-sm text-gray-600 font-semibold">Tokens Received</div>
												<div class="font-black text-black">{order.tokens.toLocaleString()}</div>
											</div>
											<div>
												<div class="text-sm text-gray-600 font-semibold">Annual Yield</div>
												<div class="font-black text-green-600">{order.tranche.yield}%</div>
											</div>
											<div>
												<div class="text-sm text-gray-600 font-semibold">Est. Monthly Income</div>
												<div class="font-black text-green-600">{formatCurrency(order.monthlyYield)}</div>
											</div>
										</div>
									</div>

									<!-- Legal Agreement -->
									<div class="border border-gray-300 rounded-lg p-4">
										<h4 class="font-black text-black mb-3">LEGAL AGREEMENT</h4>
										<div class="space-y-3">
											<label class="flex items-start space-x-3 cursor-pointer">
												<input 
													type="checkbox" 
													bind:checked={agreedToTerms}
													class="w-4 h-4 mt-1"
												/>
												<div class="text-sm">
													<span class="text-gray-600">I have read and agree to the </span>
													<a href="#" class="text-black font-black underline">Terms of Service</a>
													<span class="text-gray-600">, </span>
													<a href="#" class="text-black font-black underline">Investment Agreement</a>
													<span class="text-gray-600">, and </span>
													<a href="#" class="text-black font-black underline">Risk Disclosures</a>
													<span class="text-gray-600">.</span>
												</div>
											</label>
											<div class="text-xs text-gray-500 pl-7">
												By proceeding, you acknowledge that you understand the risks associated with oil & gas investments and that past performance does not guarantee future results.
											</div>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Order Summary Sidebar -->
					<div class="bg-white border-2 border-gray-300 rounded-lg p-6 h-fit sticky top-24">
						<h3 class="text-xl font-black mb-6 text-black">ORDER SUMMARY</h3>
						
						<div class="space-y-4 mb-6">
							<div class="flex justify-between">
								<span class="text-sm font-black text-gray-600">Investment Amount</span>
								<span class="font-black text-black">{formatCurrency(investmentAmount)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm font-black text-gray-600">Platform Fee (0.5%)</span>
								<span class="font-black text-black">{formatCurrency(order.platformFee)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm font-black text-gray-600">Gas Fee (Est.)</span>
								<span class="font-black text-black">{formatCurrency(order.gasFee)}</span>
							</div>
							<div class="border-t border-gray-300 pt-4">
								<div class="flex justify-between">
									<span class="font-black text-black">Total Cost</span>
									<span class="font-black text-xl text-black">{formatCurrency(order.totalCost)}</span>
								</div>
							</div>
						</div>

						<div class="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
							<h4 class="font-black text-black mb-3">PROJECTED RETURNS</h4>
							<div class="space-y-2">
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Tokens Received</span>
									<span class="font-black text-black">{order.tokens.toLocaleString()}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Annual Yield</span>
									<span class="font-black text-green-600">{order.tranche.yield}%</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Monthly Est.</span>
									<span class="font-black text-green-600">{formatCurrency(order.monthlyYield)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm font-black text-gray-600">Annual Est.</span>
									<span class="font-black text-green-600">{formatCurrency(order.annualYield)}</span>
								</div>
							</div>
						</div>

						<button 
							on:click={handlePurchase}
							disabled={!canProceed() || purchasing}
							class={`w-full py-4 rounded-lg font-black text-lg transition-all border-2 ${
								canProceed() && !purchasing
									? 'bg-black text-white border-black hover:bg-gray-900'
									: 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
							}`}
						>
							{#if purchasing}
								PROCESSING...
							{:else if currentStep === 1}
								BUY NOW {formatCurrency(order.totalCost)}
							{:else if currentStep === 2}
								REVIEW ORDER
							{:else if currentStep === 3}
								BUY NOW {formatCurrency(order.totalCost)}
							{/if}
						</button>

						{#if currentStep > 1}
							<button 
								on:click={() => currentStep = currentStep - 1}
								class="w-full mt-3 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-black text-sm hover:border-black hover:text-black transition-all"
							>
								BACK
							</button>
						{/if}

						<div class="mt-6 text-center">
							<div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
								<Lock class="w-4 h-4" />
								<span>Secure transaction</span>
							</div>
						</div>
					</div>
				</div>
			</div>
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
{/if}

<style>
	/* Custom styles for FigTree font and Albion design system */
	:global(body) {
		font-family: 'FigTree', sans-serif;
	}
	
	/* Utility classes matching Albion design system */
	.font-black {
		font-weight: 900;
	}
	
	/* Animation for status indicator */
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