<script lang="ts">
	import { onMount } from 'svelte';
	import { useConfigService } from '$lib/services';
	import SectionTitle from '$lib/components/atoms/SectionTitle.svelte';
	import { PageLayout, HeroSection, ContentSection } from '$lib/components/templates';
	
	let formData = {
		name: '',
		email: '',
		company: '',
		subject: '',
		message: ''
	};
	
	let isSubmitting = false;
	let submitStatus: 'idle' | 'success' | 'error' = 'idle';
	let companyInfo: any = {};
	const configService = useConfigService();
	
	onMount(() => {
		try {
			companyInfo = configService.getCompanyConfig();
		} catch (error) {
			console.error('Failed to load company info:', error);
		}
	});

	async function handleSubmit() {
		isSubmitting = true;
		
		// Simulate form submission
		setTimeout(() => {
			isSubmitting = false;
			submitStatus = 'success';
			
			// Reset form
			formData = {
				name: '',
				email: '',
				company: '',
				subject: '',
				message: ''
			};
			
			// Reset status after 3 seconds
			setTimeout(() => {
				submitStatus = 'idle';
			}, 3000);
		}, 1000);
	}
</script>

<svelte:head>
	<title>Contact - Albion</title>
	<meta name="description" content="Get in touch with the Albion team for investment inquiries and support" />
</svelte:head>

<PageLayout>
	<!-- Hero Section -->
	<HeroSection 
		title="Contact Us"
		subtitle="Get in touch with our team for investment inquiries, platform support, or partnership opportunities."
		showBorder={true}
	/>

	<!-- Contact Form & Info -->
	<ContentSection background="white" padding="standard">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- Contact Form -->
			<div class="bg-white border border-light-gray p-8 shadow-sm hover:shadow-md transition-shadow duration-200 md:p-12">
				<SectionTitle level="h2" size="card" className="mb-8">Send us a Message</SectionTitle>
				
				<form on:submit|preventDefault={handleSubmit}>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<div class="flex flex-col">
							<label for="name" class="text-xs font-bold text-black uppercase tracking-wider mb-2">Full Name</label>
							<input 
								id="name"
								type="text" 
								bind:value={formData.name}
								required
								placeholder="John Doe"
								class="px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black transition-colors duration-200 focus:outline-none focus:border-black"
							/>
						</div>
						
						<div class="flex flex-col">
							<label for="email" class="text-xs font-bold text-black uppercase tracking-wider mb-2">Email Address</label>
							<input 
								id="email"
								type="email" 
								bind:value={formData.email}
								required
								placeholder="john@example.com"
								class="px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black transition-colors duration-200 focus:outline-none focus:border-black"
							/>
						</div>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<div class="flex flex-col">
							<label for="company" class="text-xs font-bold text-black uppercase tracking-wider mb-2">Company (Optional)</label>
							<input 
								id="company"
								type="text" 
								bind:value={formData.company}
								placeholder="Acme Corp"
								class="px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black transition-colors duration-200 focus:outline-none focus:border-black"
							/>
						</div>
						
						<div class="flex flex-col">
							<label for="subject" class="text-xs font-bold text-black uppercase tracking-wider mb-2">Subject</label>
							<select id="subject" bind:value={formData.subject} required class="px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black transition-colors duration-200 focus:outline-none focus:border-black">
								<option value="">Select a topic</option>
								<option value="investment">Investment Inquiry</option>
								<option value="support">Platform Support</option>
								<option value="partnership">Partnership</option>
								<option value="media">Media Inquiry</option>
								<option value="other">Other</option>
							</select>
						</div>
					</div>
					
					<div class="flex flex-col mb-6">
						<label for="message" class="text-xs font-bold text-black uppercase tracking-wider mb-2">Message</label>
						<textarea 
							id="message"
							bind:value={formData.message}
							required
							rows="6"
							placeholder="Tell us about your inquiry..."
							class="px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black resize-vertical min-h-[120px] transition-colors duration-200 focus:outline-none focus:border-black"
						></textarea>
					</div>
					
					<button type="submit" class="w-full px-4 py-4 bg-black text-white border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed" disabled={isSubmitting}>
						{#if isSubmitting}
							Sending...
						{:else if submitStatus === 'success'}
							Message Sent!
						{:else}
							Send Message
						{/if}
					</button>
					
					{#if submitStatus === 'success'}
						<div class="bg-light-gray border border-primary text-primary px-4 py-4 mt-4 font-semibold text-center">
							Thank you for your message. We'll get back to you within 24 hours.
						</div>
					{/if}
				</form>
			</div>

			<!-- Contact Information -->
			<div class="bg-light-gray border border-light-gray md:p-12 p-8">
				<SectionTitle level="h2" size="card" className="mb-8">Get in Touch</SectionTitle>
				
				<div class="flex flex-col gap-8 mb-12">
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-xl flex-shrink-0">📧</div>
						<div class="flex-1">
							<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">Email</h3>
							<p class="text-black font-semibold mb-1">contact@albion.com</p>
							<span class="text-xs text-black opacity-70">We respond within 24 hours</span>
						</div>
					</div>
					
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-xl flex-shrink-0">💬</div>
						<div class="flex-1">
							<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">Live Chat</h3>
							<p class="text-black font-semibold mb-1">Available 24/7</p>
							<span class="text-xs text-black opacity-70">Instant support for platform users</span>
						</div>
					</div>
					
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-xl flex-shrink-0">📞</div>
						<div class="flex-1">
							<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">Phone</h3>
							<p class="text-black font-semibold mb-1">{companyInfo.contact?.phone || 'N/A'}</p>
							<span class="text-xs text-black opacity-70">Mon-Fri, 9AM-6PM EST</span>
						</div>
					</div>
					
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-xl flex-shrink-0">📍</div>
						<div class="flex-1">
							<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-2">Office</h3>
							<p class="text-black font-semibold mb-1">{companyInfo.contact?.address?.street || 'N/A'}<br>{companyInfo.contact?.address?.city || 'N/A'}, {companyInfo.contact?.address?.state || 'N/A'} {companyInfo.contact?.address?.zipCode || 'N/A'}</p>
							<span class="text-xs text-black opacity-70">By appointment only</span>
						</div>
					</div>
				</div>

			</div>
		</div>
	</ContentSection>

	<!-- FAQ Section -->
	<ContentSection background="white" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12">Frequently Asked Questions</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div class="bg-white p-8 text-left">
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">How do I start investing?</h3>
				<p class="text-sm text-black">Create an account, complete KYC verification, connect your wallet, and browse available assets to make your first investment.</p>
			</div>
			
			<div class="bg-white p-8 text-left">
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">What is the minimum investment?</h3>
				<p class="text-sm text-black">Minimum investments vary by asset, typically ranging from $1,000 to $5,000 depending on the tranche selected.</p>
			</div>
			
			<div class="bg-white p-8 text-left">
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">How often are payouts distributed?</h3>
				<p class="text-sm text-black">Payouts are distributed monthly based on actual production revenue from the underlying oil & gas assets.</p>
			</div>
			
			<div class="bg-white p-8 text-left">
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4">Can I sell my tokens?</h3>
				<p class="text-sm text-black">Secondary market trading will be available in Q2 2024. Currently, tokens can be held until asset maturity.</p>
			</div>
		</div>
	</ContentSection>

	<!-- Support Resources -->
	<ContentSection background="secondary" padding="standard" centered>
		<SectionTitle level="h2" size="section" center className="mb-12 text-white">Support Resources</SectionTitle>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="bg-white/10 border border-white/20 p-8 text-center">
				<div class="text-5xl mb-4">📚</div>
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4 text-white">Knowledge Base</h3>
				<p class="mb-6 opacity-90 text-sm">Comprehensive guides and tutorials</p>
				<a href="/help" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Browse Articles</a>
			</div>
			
			<div class="bg-white/10 border border-white/20 p-8 text-center">
				<div class="text-5xl mb-4">🎥</div>
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4 text-white">Video Tutorials</h3>
				<p class="mb-6 opacity-90 text-sm">Step-by-step platform walkthroughs</p>
				<a href="/tutorials" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Watch Videos</a>
			</div>
			
			<div class="bg-white/10 border border-white/20 p-8 text-center">
				<div class="text-5xl mb-4">💬</div>
				<h3 class="text-lg font-extrabold text-black uppercase tracking-wider mb-4 text-white">Community Forum</h3>
				<p class="mb-6 opacity-90 text-sm">Connect with other investors</p>
				<a href="/community" class="text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200">Join Discussion</a>
			</div>
		</div>
	</ContentSection>
</PageLayout>

