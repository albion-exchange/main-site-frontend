<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	import { typography } from '$lib/styles/typography';
	import { layouts } from '$lib/styles/layouts';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	
	let platformStats: any = {};
	let loading = true;

	onMount(async () => {
		try {
			platformStats = dataStoreService.getPlatformStats();
			loading = false;
		} catch (error) {
			console.error('Error loading platform stats:', error);
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>About - Albion</title>
	<meta name="description" content="Learn about Albion's institutional-grade oil & gas tokenization platform" />
</svelte:head>

<main class="pt-0">
	<!-- Hero Section -->
	<section class="py-24 px-8 text-center bg-white border-b border-light-gray">
		<div class={layouts.pageContainer}>
			<SectionTitle level="h1" size="page" center>About Albion</SectionTitle>
			<p class="text-xl leading-relaxed text-black max-w-2xl mx-auto">Revolutionizing energy investment through blockchain technology and institutional-grade asset tokenization.</p>
		</div>
	</section>

	<!-- Mission Section -->
	<section class={layouts.pageSectionAlt}>
		<div class="{layouts.pageContainer} text-center">
			<SectionTitle level="h2" size="section" center className="mb-8">Our Mission</SectionTitle>
			<p class="text-lg leading-relaxed text-black">We democratize access to institutional-quality oil & gas investments by leveraging blockchain technology to create transparent, liquid, and accessible energy assets for investors worldwide.</p>
		</div>
	</section>

	<!-- How It Works -->
	<section class={layouts.pageSection}>
		<div class="{layouts.pageContainer} text-center">
			<SectionTitle level="h2" size="section" center className="mb-12">How Albion Works</SectionTitle>
			
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
				<div class="{layouts.card} text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">1</div>
					<h3 class="{typography.subsectionTitle} mb-4">Asset Acquisition</h3>
					<p class={typography.bodyTextSmall}>We acquire proven oil & gas assets with established production and clear revenue streams from institutional operators.</p>
				</div>
				
				<div class="{layouts.card} text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">2</div>
					<h3 class="{typography.subsectionTitle} mb-4">Tokenization</h3>
					<p class={typography.bodyTextSmall}>Assets are tokenized on blockchain, creating fractional ownership opportunities with transparent smart contract governance.</p>
				</div>
				
				<div class="{layouts.card} text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">3</div>
					<h3 class="{typography.subsectionTitle} mb-4">Investment Access</h3>
					<p class={typography.bodyTextSmall}>Investors can purchase royalty tokens representing fractional ownership in real oil & gas production revenue.</p>
				</div>
				
				<div class="{layouts.card} text-center">
					<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">4</div>
					<h3 class="{typography.subsectionTitle} mb-4">Revenue Distribution</h3>
					<p class={typography.bodyTextSmall}>Monthly payouts are automatically distributed to token holders based on actual production and oil prices.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Platform Benefits -->
	<section class="{layouts.pageSectionAlt} text-center">
		<SectionTitle level="h2" size="section" center className="mb-12">Platform Benefits</SectionTitle>
		
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 {layouts.pageContainer}">
			<div class="{layouts.card} text-center">
				<div class="text-5xl mb-4">🔒</div>
				<h3 class="{typography.subsectionTitle} mb-4">Institutional Grade</h3>
				<p class={typography.bodyTextSmall}>All assets are vetted by professional operators with proven track records and regulatory compliance.</p>
			</div>
			
			<div class="{layouts.card} text-center">
				<div class="text-5xl mb-4">💰</div>
				<h3 class="{typography.subsectionTitle} mb-4">Direct Revenue Share</h3>
				<p class={typography.bodyTextSmall}>Token holders receive proportional revenue from real oil & gas production with transparent accounting.</p>
			</div>
			
			<div class="{layouts.card} text-center">
				<div class="text-5xl mb-4">📊</div>
				<h3 class="{typography.subsectionTitle} mb-4">Real-Time Transparency</h3>
				<p class={typography.bodyTextSmall}>Live production data, financial reporting, and market metrics provide complete investment visibility.</p>
			</div>
			
			<div class="{layouts.card} text-center">
				<div class="text-5xl mb-4">🌐</div>
				<h3 class="{typography.subsectionTitle} mb-4">Global Access</h3>
				<p class={typography.bodyTextSmall}>Blockchain technology enables worldwide access to premium energy investments previously reserved for institutions.</p>
			</div>
		</div>
	</section>

	<!-- Team Section -->
	<section class="{layouts.pageSection} text-center">
		<div class={layouts.pageContainer}>
			<SectionTitle level="h2" size="section" center className="mb-12">Leadership Team</SectionTitle>
			
			<div class={layouts.gridThree}>
				<div class="{layouts.card} text-center">
					<div class="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">JD</div>
					<h3 class="{typography.subsectionTitle} mb-2">John Doe</h3>
					<p class="text-sm text-primary font-semibold mb-4">CEO & Founder</p>
					<p class={typography.bodyTextSmall}>Former energy sector executive with 15+ years experience in oil & gas operations and financial markets.</p>
				</div>
				
				<div class="{layouts.card} text-center">
					<div class="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">JS</div>
					<h3 class="{typography.subsectionTitle} mb-2">Jane Smith</h3>
					<p class="text-sm text-primary font-semibold mb-4">CTO</p>
					<p class={typography.bodyTextSmall}>Blockchain technology expert specializing in smart contract development and decentralized finance protocols.</p>
				</div>
				
				<div class="{layouts.card} text-center">
					<div class="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">MB</div>
					<h3 class="{typography.subsectionTitle} mb-2">Mike Brown</h3>
					<p class="text-sm text-primary font-semibold mb-4">Head of Operations</p>
					<p class={typography.bodyTextSmall}>Petroleum engineer with extensive experience in asset evaluation, production optimization, and regulatory compliance.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Company Stats -->
	<section class="py-16 px-8 bg-secondary text-white text-center">
		<SectionTitle level="h2" size="section" center className="mb-12 text-white">Platform Statistics</SectionTitle>
		
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 {layouts.pageContainer}">
			{#if loading}
				<div class="text-center py-8 col-span-full">Loading statistics...</div>
			{:else}
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.totalInvestmentVolume?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Total Investment Volume</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.activeInvestors?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Active Investors</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.activeAssets?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Active Assets</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-extrabold text-primary mb-2">{platformStats.averagePayout?.formatted || 'N/A'}</div>
					<div class="text-sm font-semibold opacity-90">Average Payout</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- Contact CTA -->
	<section class="{layouts.pageSection} text-center">
		<div class={layouts.pageContainer}>
			<SectionTitle level="h2" size="section" center className="mb-4">Ready to Start Investing?</SectionTitle>
			<p class="text-lg text-black mb-8">Join thousands of investors earning from institutional-grade energy assets.</p>
			<div class="flex md:flex-row flex-col gap-4 justify-center items-center">
				<a href="/assets" class="px-8 py-4 no-underline font-semibold text-sm uppercase tracking-wider transition-colors duration-200 inline-block bg-black text-white hover:bg-secondary">Browse Assets</a>
				<a href="/contact" class="px-8 py-4 no-underline font-semibold text-sm uppercase tracking-wider transition-colors duration-200 inline-block bg-white text-black border border-black hover:bg-black hover:text-white">Contact Us</a>
			</div>
		</div>
	</section>
</main>

