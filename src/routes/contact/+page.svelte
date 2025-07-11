<script lang="ts">
	import { onMount } from 'svelte';
	import dataStoreService from '$lib/services/DataStoreService';
	
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
	
	onMount(() => {
		companyInfo = dataStoreService.getCompanyInfo();
	});
	
	// Tailwind class mappings
	$: pageClasses = 'pt-0';
	$: heroClasses = 'py-24 px-8 text-center bg-white border-b border-light-gray';
	$: heroContentClasses = 'max-w-6xl mx-auto';
	$: heroTitleClasses = 'text-5xl font-extrabold mb-8 text-black tracking-tight leading-tight';
	$: heroDescriptionClasses = 'text-xl leading-relaxed text-black max-w-2xl mx-auto';
	$: contactSectionClasses = 'py-16 px-8 max-w-6xl mx-auto';
	$: contactGridClasses = 'grid grid-cols-1 lg:grid-cols-2 gap-16';
	$: contactFormClasses = 'bg-white border border-light-gray p-12';
	$: contactFormTitleClasses = 'text-2xl font-extrabold text-black mb-8 uppercase tracking-wider';
	$: formRowClasses = 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6';
	$: formGroupClasses = 'flex flex-col mb-6';
	$: formRowGroupClasses = 'flex flex-col';
	$: labelClasses = 'font-semibold text-black mb-2 text-sm uppercase tracking-wider';
	$: inputClasses = 'px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black transition-colors duration-200 focus:outline-none focus:border-black';
	$: textareaClasses = 'px-3 py-3 border border-light-gray font-figtree text-sm bg-white text-black resize-vertical min-h-[120px] transition-colors duration-200 focus:outline-none focus:border-black';
	$: submitBtnClasses = 'w-full px-4 py-4 bg-black text-white border-none font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed';
	$: successMessageClasses = 'bg-light-gray border border-primary text-primary px-4 py-4 mt-4 font-semibold text-center';
	$: contactInfoClasses = 'bg-light-gray border border-light-gray p-12';
	$: contactInfoTitleClasses = 'text-2xl font-extrabold text-black mb-8 uppercase tracking-wider';
	$: contactMethodsClasses = 'flex flex-col gap-8 mb-12';
	$: contactMethodClasses = 'flex items-start gap-4';
	$: methodIconClasses = 'w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-xl flex-shrink-0';
	$: methodDetailsClasses = 'flex-1';
	$: methodTitleClasses = 'font-extrabold text-black mb-2 text-base';
	$: methodTextClasses = 'text-black font-semibold mb-1';
	$: methodSubtextClasses = 'text-black opacity-70 text-sm';
	$: faqClasses = 'py-16 px-8 bg-white text-center';
	$: faqTitleClasses = 'text-3xl font-extrabold text-black mb-12';
	$: faqGridClasses = 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto';
	$: faqItemClasses = 'bg-light-gray border border-light-gray p-8 text-left';
	$: faqItemTitleClasses = 'font-extrabold text-black mb-4 text-base';
	$: faqItemTextClasses = 'text-black leading-normal text-sm';
	$: supportClasses = 'py-16 px-8 bg-secondary text-white text-center';
	$: supportTitleClasses = 'text-3xl font-extrabold mb-12';
	$: resourcesGridClasses = 'grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto';
	$: resourceClasses = 'bg-white/10 border border-white/20 p-8 text-center';
	$: resourceIconClasses = 'text-5xl mb-4';
	$: resourceTitleClasses = 'font-extrabold mb-4 text-lg';
	$: resourceTextClasses = 'mb-6 opacity-90 text-sm';
	$: resourceLinkClasses = 'text-primary no-underline font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity duration-200';
	
	// Mobile responsive classes
	$: mobileHeroTitleClasses = 'md:text-5xl text-4xl font-extrabold mb-8 text-black tracking-tight leading-tight';
	$: mobileContactGridClasses = 'grid grid-cols-1 lg:grid-cols-2 md:gap-16 gap-8';
	$: mobileFormRowClasses = 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6';
	$: mobileContactFormClasses = 'bg-white border border-light-gray md:p-12 p-8';
	$: mobileContactInfoClasses = 'bg-light-gray border border-light-gray md:p-12 p-8';
	$: mobileFaqGridClasses = 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto';
	$: mobileResourcesGridClasses = 'grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto';

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

<main class={pageClasses}>
	<!-- Hero Section -->
	<section class={heroClasses}>
		<div class={heroContentClasses}>
			<h1 class={mobileHeroTitleClasses}>Contact Us</h1>
			<p class={heroDescriptionClasses}>Get in touch with our team for investment inquiries, platform support, or partnership opportunities.</p>
		</div>
	</section>

	<!-- Contact Form & Info -->
	<section class={contactSectionClasses}>
		<div class={mobileContactGridClasses}>
			<!-- Contact Form -->
			<div class={mobileContactFormClasses}>
				<h2 class={contactFormTitleClasses}>Send us a Message</h2>
				
				<form on:submit|preventDefault={handleSubmit}>
					<div class={mobileFormRowClasses}>
						<div class={formRowGroupClasses}>
							<label for="name" class={labelClasses}>Full Name</label>
							<input 
								id="name"
								type="text" 
								bind:value={formData.name}
								required
								placeholder="John Doe"
								class={inputClasses}
							/>
						</div>
						
						<div class={formRowGroupClasses}>
							<label for="email" class={labelClasses}>Email Address</label>
							<input 
								id="email"
								type="email" 
								bind:value={formData.email}
								required
								placeholder="john@example.com"
								class={inputClasses}
							/>
						</div>
					</div>
					
					<div class={mobileFormRowClasses}>
						<div class={formRowGroupClasses}>
							<label for="company" class={labelClasses}>Company (Optional)</label>
							<input 
								id="company"
								type="text" 
								bind:value={formData.company}
								placeholder="Acme Corp"
								class={inputClasses}
							/>
						</div>
						
						<div class={formRowGroupClasses}>
							<label for="subject" class={labelClasses}>Subject</label>
							<select id="subject" bind:value={formData.subject} required class={inputClasses}>
								<option value="">Select a topic</option>
								<option value="investment">Investment Inquiry</option>
								<option value="support">Platform Support</option>
								<option value="partnership">Partnership</option>
								<option value="media">Media Inquiry</option>
								<option value="other">Other</option>
							</select>
						</div>
					</div>
					
					<div class={formGroupClasses}>
						<label for="message" class={labelClasses}>Message</label>
						<textarea 
							id="message"
							bind:value={formData.message}
							required
							rows="6"
							placeholder="Tell us about your inquiry..."
							class={textareaClasses}
						></textarea>
					</div>
					
					<button type="submit" class={submitBtnClasses} disabled={isSubmitting}>
						{#if isSubmitting}
							Sending...
						{:else if submitStatus === 'success'}
							Message Sent!
						{:else}
							Send Message
						{/if}
					</button>
					
					{#if submitStatus === 'success'}
						<div class={successMessageClasses}>
							Thank you for your message. We'll get back to you within 24 hours.
						</div>
					{/if}
				</form>
			</div>

			<!-- Contact Information -->
			<div class={mobileContactInfoClasses}>
				<h2 class={contactInfoTitleClasses}>Get in Touch</h2>
				
				<div class={contactMethodsClasses}>
					<div class={contactMethodClasses}>
						<div class={methodIconClasses}>📧</div>
						<div class={methodDetailsClasses}>
							<h3 class={methodTitleClasses}>Email</h3>
							<p class={methodTextClasses}>contact@albion.com</p>
							<span class={methodSubtextClasses}>We respond within 24 hours</span>
						</div>
					</div>
					
					<div class={contactMethodClasses}>
						<div class={methodIconClasses}>💬</div>
						<div class={methodDetailsClasses}>
							<h3 class={methodTitleClasses}>Live Chat</h3>
							<p class={methodTextClasses}>Available 24/7</p>
							<span class={methodSubtextClasses}>Instant support for platform users</span>
						</div>
					</div>
					
					<div class={contactMethodClasses}>
						<div class={methodIconClasses}>📞</div>
						<div class={methodDetailsClasses}>
							<h3 class={methodTitleClasses}>Phone</h3>
							<p class={methodTextClasses}>{companyInfo.contact?.phone || 'N/A'}</p>
							<span class={methodSubtextClasses}>Mon-Fri, 9AM-6PM EST</span>
						</div>
					</div>
					
					<div class={contactMethodClasses}>
						<div class={methodIconClasses}>📍</div>
						<div class={methodDetailsClasses}>
							<h3 class={methodTitleClasses}>Office</h3>
							<p class={methodTextClasses}>{companyInfo.contact?.address?.street || 'N/A'}<br>{companyInfo.contact?.address?.city || 'N/A'}, {companyInfo.contact?.address?.state || 'N/A'} {companyInfo.contact?.address?.zipCode || 'N/A'}</p>
							<span class={methodSubtextClasses}>By appointment only</span>
						</div>
					</div>
				</div>

			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class={faqClasses}>
		<h2 class={faqTitleClasses}>Frequently Asked Questions</h2>
		
		<div class={mobileFaqGridClasses}>
			<div class={faqItemClasses}>
				<h3 class={faqItemTitleClasses}>How do I start investing?</h3>
				<p class={faqItemTextClasses}>Create an account, complete KYC verification, connect your wallet, and browse available assets to make your first investment.</p>
			</div>
			
			<div class={faqItemClasses}>
				<h3 class={faqItemTitleClasses}>What is the minimum investment?</h3>
				<p class={faqItemTextClasses}>Minimum investments vary by asset, typically ranging from $1,000 to $5,000 depending on the tranche selected.</p>
			</div>
			
			<div class={faqItemClasses}>
				<h3 class={faqItemTitleClasses}>How often are payouts distributed?</h3>
				<p class={faqItemTextClasses}>Payouts are distributed monthly based on actual production revenue from the underlying oil & gas assets.</p>
			</div>
			
			<div class={faqItemClasses}>
				<h3 class={faqItemTitleClasses}>Can I sell my tokens?</h3>
				<p class={faqItemTextClasses}>Secondary market trading will be available in Q2 2024. Currently, tokens can be held until asset maturity.</p>
			</div>
		</div>
	</section>

	<!-- Support Resources -->
	<section class={supportClasses}>
		<h2 class={supportTitleClasses}>Support Resources</h2>
		
		<div class={mobileResourcesGridClasses}>
			<div class={resourceClasses}>
				<div class={resourceIconClasses}>📚</div>
				<h3 class={resourceTitleClasses}>Knowledge Base</h3>
				<p class={resourceTextClasses}>Comprehensive guides and tutorials</p>
				<a href="/help" class={resourceLinkClasses}>Browse Articles</a>
			</div>
			
			<div class={resourceClasses}>
				<div class={resourceIconClasses}>🎥</div>
				<h3 class={resourceTitleClasses}>Video Tutorials</h3>
				<p class={resourceTextClasses}>Step-by-step platform walkthroughs</p>
				<a href="/tutorials" class={resourceLinkClasses}>Watch Videos</a>
			</div>
			
			<div class={resourceClasses}>
				<div class={resourceIconClasses}>💬</div>
				<h3 class={resourceTitleClasses}>Community Forum</h3>
				<p class={resourceTextClasses}>Connect with other investors</p>
				<a href="/community" class={resourceLinkClasses}>Join Discussion</a>
			</div>
		</div>
	</section>
</main>

