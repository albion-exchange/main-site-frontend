<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { AssetOverview } from '$lib/types/assets';
	import { modalState } from '$lib/stores/ui';
	import { Button } from '$lib/components/atoms';
	import { MetricCard } from '$lib/components/molecules';

	// Mock data for featured assets
	let featuredAssets: AssetOverview[] = [
		{
			id: '1',
			name: 'Permian Basin Well #247',
			location: 'Texas, USA',
			totalValue: 2500000,
			tokenPrice: 50,
			tokensAvailable: 45000,
			totalTokens: 50000,
			expectedReturn: 0.12,
			productionStart: new Date('2024-03-15'),
			images: ['/assets/well-1.jpg', '/assets/well-1-aerial.jpg'],
			status: 'active' as const,
			riskLevel: 'medium' as const,
			estimatedProduction: 150000,
			operator: 'Eagle Energy Partners'
		},
		{
			id: '2', 
			name: 'Eagle Ford Shale Project',
			location: 'Texas, USA',
			totalValue: 1800000,
			tokenPrice: 25,
			tokensAvailable: 12000,
			totalTokens: 72000,
			expectedReturn: 0.15,
			productionStart: new Date('2024-04-01'),
			images: ['/assets/well-2.jpg'],
			status: 'active' as const,
			riskLevel: 'medium' as const,
			estimatedProduction: 120000,
			operator: 'Lone Star Drilling'
		},
		{
			id: '3',
			name: 'Bakken Formation Site',
			location: 'North Dakota, USA', 
			totalValue: 3200000,
			tokenPrice: 75,
			tokensAvailable: 8500,
			totalTokens: 42667,
			expectedReturn: 0.18,
			productionStart: new Date('2024-05-15'),
			images: ['/assets/well-3.jpg'],
			status: 'funding' as const,
			riskLevel: 'high' as const,
			estimatedProduction: 200000,
			operator: 'Northern Plains Energy'
		}
	];

	// Platform statistics
	let platformStats = {
		totalValue: 52000000,
		activeInvestors: 1247,
		averageReturn: 0.145,
		totalWells: 23
	};

	function handleGetStarted() {
		goto('/assets');
	}

	function handleLearnMore() {
		goto('/about');
	}

	onMount(() => {
		// Any initialization logic
	});
</script>

<div class="flex flex-col min-h-screen bg-gray-50">
	<!-- Hero Section -->
	<section class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
		<div class="max-w-4xl mx-auto text-center px-4">
			<h1 class="text-4xl md:text-6xl font-bold mb-6">
				Invest in 
				<span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
					Oil & Gas
				</span>
				Projects
			</h1>
			<p class="text-xl md:text-2xl mb-8 text-blue-100">
				Democratizing access to institutional-grade energy investments through blockchain technology
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button variant="primary" size="large" on:click={handleGetStarted}>Explore Investments</Button>
				<Button variant="secondary" size="large" on:click={handleLearnMore}>Learn How It Works</Button>
			</div>
		</div>
	</section>

	<!-- Platform Stats -->
	<section class="py-16 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">Platform Overview</h2>
				<p class="text-lg text-gray-600 max-w-2xl mx-auto">
					Join thousands of investors who trust Albion for their energy investment needs
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
				<MetricCard
					title="Total Value Locked"
					value="${(platformStats.totalValue / 1000000).toFixed(1)}M"
					trend={{ value: 8.2, direction: 'up' }}
					icon="DollarSign"
				/>
				<MetricCard
					title="Active Investors"
					value="{platformStats.activeInvestors.toLocaleString()}"
					trend={{ value: 12.5, direction: 'up' }}
					icon="Users"
				/>
				<MetricCard
					title="Average Return"
					value="{(platformStats.averageReturn * 100).toFixed(1)}%"
					trend={{ value: 2.1, direction: 'up' }}
					icon="TrendingUp"
				/>
				<MetricCard
					title="Active Wells"
					value="{platformStats.totalWells}"
					trend={{ value: 4, direction: 'up' }}
					icon="Zap"
				/>
			</div>
		</div>
	</section>

	<!-- Featured Assets -->
	<section class="py-16 bg-gray-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Investment Opportunities</h2>
				<p class="text-lg text-gray-600 max-w-2xl mx-auto">
					Discover our most promising oil and gas projects available for tokenized investment
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				{#each featuredAssets as asset}
					<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
						<div class="relative">
							<img 
								src={asset.images[0] || '/assets/placeholder-well.jpg'} 
								alt={asset.name}
								class="w-full h-48 object-cover"
							/>
							<div class="absolute top-4 left-4">
								<span class="px-3 py-1 rounded-full text-sm font-medium
									{asset.status === 'active' ? 'bg-green-100 text-green-800' : 
									 asset.status === 'funding' ? 'bg-blue-100 text-blue-800' : 
									 'bg-gray-100 text-gray-800'}"
								>
									{asset.status === 'active' ? 'Active' : 
									 asset.status === 'funding' ? 'Funding' : 
									 'Completed'}
								</span>
							</div>
						</div>
						
						<div class="p-6">
							<h3 class="text-xl font-bold text-gray-900 mb-2">{asset.name}</h3>
							<p class="text-gray-600 mb-4">{asset.location}</p>
							
							<div class="grid grid-cols-2 gap-4 mb-6">
								<div>
									<div class="text-sm text-gray-500">Expected Return</div>
									<div class="text-lg font-semibold text-green-600">
										{(asset.expectedReturn * 100).toFixed(1)}%
									</div>
								</div>
								<div>
									<div class="text-sm text-gray-500">Token Price</div>
									<div class="text-lg font-semibold text-gray-900">
										${asset.tokenPrice}
									</div>
								</div>
							</div>
							
							<div class="flex gap-3">
								<Button variant="primary" size="small" fullWidth>
									Buy Tokens
								</Button>
								<Button variant="secondary" size="small" fullWidth>
									View Details
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
			
			<div class="text-center mt-12">
				<Button variant="secondary" size="large" href="/assets">View All Assets</Button>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="py-16 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
				<p class="text-lg text-gray-600 max-w-2xl mx-auto">
					Simple, transparent, and secure energy investments through blockchain technology
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="text-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-4">1. Browse Assets</h3>
					<p class="text-gray-600">
						Explore our curated selection of oil and gas projects with detailed performance data and geological reports.
					</p>
				</div>

				<div class="text-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-4">2. Purchase Tokens</h3>
					<p class="text-gray-600">
						Buy fractional ownership tokens representing shares in productive oil and gas wells using cryptocurrency.
					</p>
				</div>

				<div class="text-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-4">3. Earn Returns</h3>
					<p class="text-gray-600">
						Receive proportional payouts from oil and gas production directly to your wallet on a monthly basis.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Call to Action -->
	<section class="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
		<div class="max-w-4xl mx-auto text-center px-4">
			<h2 class="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
			<p class="text-xl mb-8 text-blue-100">
				Join the future of energy investments with institutional-grade opportunities accessible to everyone
			</p>
			<Button variant="secondary" size="large" class="bg-white text-blue-600 hover:bg-gray-100">
				Get Started Now
			</Button>
		</div>
	</section>
</div>