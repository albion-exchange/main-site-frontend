<script lang="ts">
	import { onMount } from 'svelte';
	import { useConfigService } from '$lib/services';
	import SectionTitle from '$lib/components/components/SectionTitle.svelte';
	import PrimaryButton from '$lib/components/components/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/components/SecondaryButton.svelte';
	import Card from '$lib/components/components/Card.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/layout';
	
	let platformStats: any = {};
	let loading = true;
	const configService = useConfigService();

	onMount(async () => {
		try {
			platformStats = configService.getPlatformStats();
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

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="About Albion"
		subtitle="Revolutionizing energy investment through blockchain technology and institutional-grade asset tokenization."
		showBorder={false}
	/>

	<!-- Mission Section -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-8">Our Mission</SectionTitle>
		<p class="text-lg leading-relaxed text-black">We democratize access to institutional-quality oil & gas investments by leveraging blockchain technology to create transparent, liquid, and accessible energy assets for investors worldwide.</p>
	</ContentSection>

	<!-- How It Works -->
	<ContentSection background="white" padding="standard" centered>
			<SectionTitle level="h2" size="section" center className="mb-12">How Albion Works</SectionTitle>
			
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">1</div>
						<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Asset Acquisition</h3>
						<p class="text-sm text-black">We acquire proven oil & gas assets with established production and clear revenue streams from institutional operators.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">2</div>
						<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Tokenization</h3>
						<p class="text-sm text-black">Assets are tokenized on blockchain, creating fractional ownership opportunities with transparent smart contract governance.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">3</div>
						<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Investment Access</h3>
						<p class="text-sm text-black">Investors can purchase royalty tokens representing fractional ownership in real oil & gas production revenue.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6">4</div>
						<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Revenue Distribution</h3>
						<p class="text-sm text-black">Monthly payouts are automatically distributed to token holders based on actual production and oil prices.</p>
					</div>
				</Card>
		</div>
	</ContentSection>

	<!-- Platform Benefits -->
	<ContentSection background="gray" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Platform Benefits</SectionTitle>
		
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">🔒</div>
					<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Institutional Grade</h3>
					<p class="text-sm text-black">All assets are vetted by professional operators with proven track records and regulatory compliance.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">💰</div>
					<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Direct Revenue Share</h3>
					<p class="text-sm text-black">Token holders receive proportional revenue from real oil & gas production with transparent accounting.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">📊</div>
					<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Real-Time Transparency</h3>
					<p class="text-sm text-black">Live production data, financial reporting, and market metrics provide complete investment visibility.</p>
				</div>
			</Card>
			
			<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
				<div class="text-center">
					<div class="text-5xl mb-4">🌐</div>
					<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Global Access</h3>
					<p class="text-sm text-black">Blockchain technology enables worldwide access to premium energy investments previously reserved for institutions.</p>
				</div>
			</Card>
		</div>
	</ContentSection>

	<!-- Team Section -->
	<ContentSection background="white" padding="standard" centered>
			<SectionTitle level="h2" size="section" center className="mb-12">Leadership Team</SectionTitle>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">JD</div>
						<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">John Doe</h3>
						<p class="text-sm text-primary font-semibold mb-4">CEO & Founder</p>
						<p class="text-sm text-black">Former energy sector executive with 15+ years experience in oil & gas operations and financial markets.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">JS</div>
						<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">Jane Smith</h3>
						<p class="text-sm text-primary font-semibold mb-4">CTO</p>
						<p class="text-sm text-black">Blockchain technology expert specializing in smart contract development and decentralized finance protocols.</p>
					</div>
				</Card>
				
				<Card hoverable={false} paddingClass="p-8" roundedClass="rounded-lg">
					<div class="text-center">
						<div class="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">MB</div>
						<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">Mike Brown</h3>
						<p class="text-sm text-primary font-semibold mb-4">Head of Operations</p>
						<p class="text-sm text-black">Petroleum engineer with extensive experience in asset evaluation, production optimization, and regulatory compliance.</p>
					</div>
				</Card>
		</div>
	</ContentSection>

	<!-- Company Stats -->
	<ContentSection background="secondary" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12 text-white">Platform Statistics</SectionTitle>
		
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
	</ContentSection>

	<!-- Contact CTA -->
	<ContentSection background="white" padding="standard" centered>
			<SectionTitle level="h2" size="section" center className="mb-4">Ready to Start Investing?</SectionTitle>
			<p class="text-lg text-black mb-8">Join thousands of investors earning from institutional-grade energy assets.</p>
			<div class="flex md:flex-row flex-col gap-4 justify-center items-center">
				<PrimaryButton href="/assets" size="large">Browse Assets</PrimaryButton>
				<SecondaryButton href="/contact" size="large">Contact Us</SecondaryButton>
		</div>
	</ContentSection>
</PageLayout>

