<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	
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
	
	// Tailwind class mappings
	$: pageClasses = 'pt-0';
	$: heroClasses = 'py-24 px-8 text-center bg-white border-b border-light-gray';
	$: heroContentClasses = 'max-w-6xl mx-auto';
	$: heroTitleClasses = 'text-6xl font-extrabold mb-8 text-black tracking-tight leading-tight';
	$: heroDescriptionClasses = 'text-xl leading-relaxed text-black max-w-2xl mx-auto';
	$: missionClasses = 'py-16 px-8 bg-light-gray text-center';
	$: missionContentClasses = 'max-w-6xl mx-auto';
	$: missionTitleClasses = 'text-3xl font-extrabold text-black mb-8';
	$: missionTextClasses = 'text-lg leading-relaxed text-black';
	$: howItWorksClasses = 'py-16 px-8 max-w-6xl mx-auto text-center';
	$: howItWorksTitleClasses = 'text-3xl font-extrabold text-black mb-12';
	$: processGridClasses = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8';
	$: processStepClasses = 'bg-white border border-light-gray p-8 text-center';
	$: stepNumberClasses = 'w-15 h-15 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6';
	$: stepTitleClasses = 'text-lg font-extrabold text-black mb-4';
	$: stepTextClasses = 'text-sm leading-normal text-black';
	$: benefitsClasses = 'py-16 px-8 bg-light-gray text-center';
	$: benefitsTitleClasses = 'text-3xl font-extrabold text-black mb-12';
	$: benefitsGridClasses = 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto';
	$: benefitClasses = 'bg-white border border-light-gray p-8 text-center';
	$: benefitIconClasses = 'text-5xl mb-4';
	$: benefitTitleClasses = 'text-lg font-extrabold text-black mb-4';
	$: benefitTextClasses = 'text-sm leading-normal text-black';
	$: teamClasses = 'py-16 px-8 max-w-6xl mx-auto text-center';
	$: teamTitleClasses = 'text-3xl font-extrabold text-black mb-12';
	$: teamGridClasses = 'grid grid-cols-1 lg:grid-cols-3 gap-8';
	$: teamMemberClasses = 'bg-white border border-light-gray p-8 text-center';
	$: memberAvatarClasses = 'w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4';
	$: memberNameClasses = 'text-lg font-extrabold text-black mb-2';
	$: memberTitleClasses = 'text-sm text-primary font-semibold mb-4';
	$: memberBioClasses = 'text-sm leading-normal text-black';
	$: statsClasses = 'py-16 px-8 bg-secondary text-white text-center';
	$: statsTitleClasses = 'text-3xl font-extrabold mb-12';
	$: statsGridClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto';
	$: statClasses = 'text-center';
	$: statValueClasses = 'text-4xl font-extrabold text-primary mb-2';
	$: statLabelClasses = 'text-sm font-semibold opacity-90';
	$: loadingClasses = 'text-center py-8';
	$: contactCtaClasses = 'py-16 px-8 bg-white text-center';
	$: ctaContentClasses = 'max-w-6xl mx-auto';
	$: ctaTitleClasses = 'text-3xl font-extrabold text-black mb-4';
	$: ctaDescriptionClasses = 'text-lg text-black mb-8';
	$: ctaButtonsClasses = 'flex gap-4 justify-center';
	$: btnPrimaryClasses = 'px-8 py-4 no-underline font-semibold text-sm uppercase tracking-wider transition-colors duration-200 inline-block bg-black text-white hover:bg-secondary';
	$: btnSecondaryClasses = 'px-8 py-4 no-underline font-semibold text-sm uppercase tracking-wider transition-colors duration-200 inline-block bg-white text-black border border-black hover:bg-black hover:text-white';
	
	// Mobile responsive classes
	$: mobileHeroTitleClasses = 'md:text-6xl text-4xl font-extrabold mb-8 text-black tracking-tight leading-tight';
	$: mobileProcessGridClasses = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8';
	$: mobileBenefitsGridClasses = 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto';
	$: mobileTeamGridClasses = 'grid grid-cols-1 lg:grid-cols-3 gap-8';
	$: mobileStatsGridClasses = 'grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto';
	$: mobileCtaButtonsClasses = 'flex md:flex-row flex-col gap-4 justify-center items-center';
</script>

<svelte:head>
	<title>About - Albion</title>
	<meta name="description" content="Learn about Albion's institutional-grade oil & gas tokenization platform" />
</svelte:head>

<main class={pageClasses}>
	<!-- Hero Section -->
	<section class={heroClasses}>
		<div class={heroContentClasses}>
			<h1 class={mobileHeroTitleClasses}>About Albion</h1>
			<p class={heroDescriptionClasses}>Revolutionizing energy investment through blockchain technology and institutional-grade asset tokenization.</p>
		</div>
	</section>

	<!-- Mission Section -->
	<section class={missionClasses}>
		<div class={missionContentClasses}>
			<h2 class={missionTitleClasses}>Our Mission</h2>
			<p class={missionTextClasses}>We democratize access to institutional-quality oil & gas investments by leveraging blockchain technology to create transparent, liquid, and accessible energy assets for investors worldwide.</p>
		</div>
	</section>

	<!-- How It Works -->
	<section class={howItWorksClasses}>
		<h2 class={howItWorksTitleClasses}>How Albion Works</h2>
		
		<div class={mobileProcessGridClasses}>
			<div class={processStepClasses}>
				<div class={stepNumberClasses}>1</div>
				<h3 class={stepTitleClasses}>Asset Acquisition</h3>
				<p class={stepTextClasses}>We acquire proven oil & gas assets with established production and clear revenue streams from institutional operators.</p>
			</div>
			
			<div class={processStepClasses}>
				<div class={stepNumberClasses}>2</div>
				<h3 class={stepTitleClasses}>Tokenization</h3>
				<p class={stepTextClasses}>Assets are tokenized on blockchain, creating fractional ownership opportunities with transparent smart contract governance.</p>
			</div>
			
			<div class={processStepClasses}>
				<div class={stepNumberClasses}>3</div>
				<h3 class={stepTitleClasses}>Investment Access</h3>
				<p class={stepTextClasses}>Investors can purchase royalty tokens representing fractional ownership in real oil & gas production revenue.</p>
			</div>
			
			<div class={processStepClasses}>
				<div class={stepNumberClasses}>4</div>
				<h3 class={stepTitleClasses}>Revenue Distribution</h3>
				<p class={stepTextClasses}>Monthly payouts are automatically distributed to token holders based on actual production and oil prices.</p>
			</div>
		</div>
	</section>

	<!-- Platform Benefits -->
	<section class={benefitsClasses}>
		<h2 class={benefitsTitleClasses}>Platform Benefits</h2>
		
		<div class={mobileBenefitsGridClasses}>
			<div class={benefitClasses}>
				<div class={benefitIconClasses}>🔒</div>
				<h3 class={benefitTitleClasses}>Institutional Grade</h3>
				<p class={benefitTextClasses}>All assets are vetted by professional operators with proven track records and regulatory compliance.</p>
			</div>
			
			<div class={benefitClasses}>
				<div class={benefitIconClasses}>💰</div>
				<h3 class={benefitTitleClasses}>Direct Revenue Share</h3>
				<p class={benefitTextClasses}>Token holders receive proportional revenue from real oil & gas production with transparent accounting.</p>
			</div>
			
			<div class={benefitClasses}>
				<div class={benefitIconClasses}>📊</div>
				<h3 class={benefitTitleClasses}>Real-Time Transparency</h3>
				<p class={benefitTextClasses}>Live production data, financial reporting, and market metrics provide complete investment visibility.</p>
			</div>
			
			<div class={benefitClasses}>
				<div class={benefitIconClasses}>🌐</div>
				<h3 class={benefitTitleClasses}>Global Access</h3>
				<p class={benefitTextClasses}>Blockchain technology enables worldwide access to premium energy investments previously reserved for institutions.</p>
			</div>
		</div>
	</section>

	<!-- Team Section -->
	<section class={teamClasses}>
		<h2 class={teamTitleClasses}>Leadership Team</h2>
		
		<div class={mobileTeamGridClasses}>
			<div class={teamMemberClasses}>
				<div class={memberAvatarClasses}>JD</div>
				<h3 class={memberNameClasses}>John Doe</h3>
				<p class={memberTitleClasses}>CEO & Founder</p>
				<p class={memberBioClasses}>Former energy sector executive with 15+ years experience in oil & gas operations and financial markets.</p>
			</div>
			
			<div class={teamMemberClasses}>
				<div class={memberAvatarClasses}>JS</div>
				<h3 class={memberNameClasses}>Jane Smith</h3>
				<p class={memberTitleClasses}>CTO</p>
				<p class={memberBioClasses}>Blockchain technology expert specializing in smart contract development and decentralized finance protocols.</p>
			</div>
			
			<div class={teamMemberClasses}>
				<div class={memberAvatarClasses}>MB</div>
				<h3 class={memberNameClasses}>Mike Brown</h3>
				<p class={memberTitleClasses}>Head of Operations</p>
				<p class={memberBioClasses}>Petroleum engineer with extensive experience in asset evaluation, production optimization, and regulatory compliance.</p>
			</div>
		</div>
	</section>

	<!-- Company Stats -->
	<section class={statsClasses}>
		<h2 class={statsTitleClasses}>Platform Statistics</h2>
		
		<div class={mobileStatsGridClasses}>
			{#if loading}
				<div class={loadingClasses}>Loading statistics...</div>
			{:else}
				<div class={statClasses}>
					<div class={statValueClasses}>{platformStats.totalInvestmentVolume?.formatted || 'N/A'}</div>
					<div class={statLabelClasses}>Total Investment Volume</div>
				</div>
				<div class={statClasses}>
					<div class={statValueClasses}>{platformStats.activeInvestors?.formatted || 'N/A'}</div>
					<div class={statLabelClasses}>Active Investors</div>
				</div>
				<div class={statClasses}>
					<div class={statValueClasses}>{platformStats.activeAssets?.formatted || 'N/A'}</div>
					<div class={statLabelClasses}>Active Assets</div>
				</div>
				<div class={statClasses}>
					<div class={statValueClasses}>{platformStats.averagePayout?.formatted || 'N/A'}</div>
					<div class={statLabelClasses}>Average Payout</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- Contact CTA -->
	<section class={contactCtaClasses}>
		<div class={ctaContentClasses}>
			<h2 class={ctaTitleClasses}>Ready to Start Investing?</h2>
			<p class={ctaDescriptionClasses}>Join thousands of investors earning from institutional-grade energy assets.</p>
			<div class={mobileCtaButtonsClasses}>
				<a href="/assets" class={btnPrimaryClasses}>Browse Assets</a>
				<a href="/contact" class={btnSecondaryClasses}>Contact Us</a>
			</div>
		</div>
	</section>
</main>

