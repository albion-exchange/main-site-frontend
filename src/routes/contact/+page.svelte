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

<main class="contact-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1>Contact Us</h1>
			<p>Get in touch with our team for investment inquiries, platform support, or partnership opportunities.</p>
		</div>
	</section>

	<!-- Contact Form & Info -->
	<section class="contact-section">
		<div class="contact-grid">
			<!-- Contact Form -->
			<div class="contact-form">
				<h2>Send us a Message</h2>
				
				<form on:submit|preventDefault={handleSubmit}>
					<div class="form-row">
						<div class="form-group">
							<label for="name">Full Name</label>
							<input 
								id="name"
								type="text" 
								bind:value={formData.name}
								required
								placeholder="John Doe"
							/>
						</div>
						
						<div class="form-group">
							<label for="email">Email Address</label>
							<input 
								id="email"
								type="email" 
								bind:value={formData.email}
								required
								placeholder="john@example.com"
							/>
						</div>
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label for="company">Company (Optional)</label>
							<input 
								id="company"
								type="text" 
								bind:value={formData.company}
								placeholder="Acme Corp"
							/>
						</div>
						
						<div class="form-group">
							<label for="subject">Subject</label>
							<select id="subject" bind:value={formData.subject} required>
								<option value="">Select a topic</option>
								<option value="investment">Investment Inquiry</option>
								<option value="support">Platform Support</option>
								<option value="partnership">Partnership</option>
								<option value="media">Media Inquiry</option>
								<option value="other">Other</option>
							</select>
						</div>
					</div>
					
					<div class="form-group">
						<label for="message">Message</label>
						<textarea 
							id="message"
							bind:value={formData.message}
							required
							rows="6"
							placeholder="Tell us about your inquiry..."
						></textarea>
					</div>
					
					<button type="submit" class="submit-btn" disabled={isSubmitting}>
						{#if isSubmitting}
							Sending...
						{:else if submitStatus === 'success'}
							Message Sent!
						{:else}
							Send Message
						{/if}
					</button>
					
					{#if submitStatus === 'success'}
						<div class="success-message">
							Thank you for your message. We'll get back to you within 24 hours.
						</div>
					{/if}
				</form>
			</div>

			<!-- Contact Information -->
			<div class="contact-info">
				<h2>Get in Touch</h2>
				
				<div class="contact-methods">
					<div class="contact-method">
						<div class="method-icon">📧</div>
						<div class="method-details">
							<h3>Email</h3>
							<p>contact@albion.com</p>
							<span>We respond within 24 hours</span>
						</div>
					</div>
					
					<div class="contact-method">
						<div class="method-icon">💬</div>
						<div class="method-details">
							<h3>Live Chat</h3>
							<p>Available 24/7</p>
							<span>Instant support for platform users</span>
						</div>
					</div>
					
					<div class="contact-method">
						<div class="method-icon">📞</div>
						<div class="method-details">
							<h3>Phone</h3>
							<p>{companyInfo.contact?.phone || 'N/A'}</p>
							<span>Mon-Fri, 9AM-6PM EST</span>
						</div>
					</div>
					
					<div class="contact-method">
						<div class="method-icon">📍</div>
						<div class="method-details">
							<h3>Office</h3>
							<p>{companyInfo.contact?.address?.street || 'N/A'}<br>{companyInfo.contact?.address?.city || 'N/A'}, {companyInfo.contact?.address?.state || 'N/A'} {companyInfo.contact?.address?.zipCode || 'N/A'}</p>
							<span>By appointment only</span>
						</div>
					</div>
				</div>

			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="faq">
		<h2>Frequently Asked Questions</h2>
		
		<div class="faq-grid">
			<div class="faq-item">
				<h3>How do I start investing?</h3>
				<p>Create an account, complete KYC verification, connect your wallet, and browse available assets to make your first investment.</p>
			</div>
			
			<div class="faq-item">
				<h3>What is the minimum investment?</h3>
				<p>Minimum investments vary by asset, typically ranging from $1,000 to $5,000 depending on the tranche selected.</p>
			</div>
			
			<div class="faq-item">
				<h3>How often are payouts distributed?</h3>
				<p>Payouts are distributed monthly based on actual production revenue from the underlying oil & gas assets.</p>
			</div>
			
			<div class="faq-item">
				<h3>Can I sell my tokens?</h3>
				<p>Secondary market trading will be available in Q2 2024. Currently, tokens can be held until asset maturity.</p>
			</div>
		</div>
	</section>

	<!-- Support Resources -->
	<section class="support">
		<h2>Support Resources</h2>
		
		<div class="resources-grid">
			<div class="resource">
				<div class="resource-icon">📚</div>
				<h3>Knowledge Base</h3>
				<p>Comprehensive guides and tutorials</p>
				<a href="/help" class="resource-link">Browse Articles</a>
			</div>
			
			<div class="resource">
				<div class="resource-icon">🎥</div>
				<h3>Video Tutorials</h3>
				<p>Step-by-step platform walkthroughs</p>
				<a href="/tutorials" class="resource-link">Watch Videos</a>
			</div>
			
			<div class="resource">
				<div class="resource-icon">💬</div>
				<h3>Community Forum</h3>
				<p>Connect with other investors</p>
				<a href="/community" class="resource-link">Join Discussion</a>
			</div>
		</div>
	</section>
</main>

<style>
	.contact-page {
		padding-top: 0;
	}

	.hero {
		padding: 6rem 2rem;
		text-align: center;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-light-gray);
	}

	.hero-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero h1 {
		font-size: 3rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 2rem;
		color: var(--color-black);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.hero p {
		font-size: 1.25rem;
		line-height: 1.6;
		color: var(--color-black);
		max-width: 600px;
		margin: 0 auto;
	}

	.contact-section {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
	}

	.contact-form {
		background: var(--color-white);
		border: 1px solid var(--color-light-gray);
		padding: 3rem;
	}

	.contact-form h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 1.5rem;
	}

	.form-row .form-group {
		margin-bottom: 0;
	}

	label {
		font-weight: var(--font-weight-semibold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input,
	select,
	textarea {
		padding: 0.75rem;
		border: 1px solid var(--color-light-gray);
		font-family: var(--font-family);
		font-size: 0.9rem;
		background: var(--color-white);
		color: var(--color-black);
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-black);
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	.submit-btn {
		width: 100%;
		padding: 1rem;
		background: var(--color-black);
		color: var(--color-white);
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-extrabold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.submit-btn:hover:not(:disabled) {
		background: var(--color-secondary);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.success-message {
		background: var(--color-light-gray);
		border: 1px solid var(--color-primary);
		color: var(--color-primary);
		padding: 1rem;
		margin-top: 1rem;
		font-weight: var(--font-weight-semibold);
		text-align: center;
	}

	.contact-info {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 3rem;
	}

	.contact-info h2 {
		font-size: 1.5rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.contact-methods {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.contact-method {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.method-icon {
		width: 3rem;
		height: 3rem;
		background: var(--color-primary);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.method-details h3 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}

	.method-details p {
		color: var(--color-black);
		font-weight: var(--font-weight-semibold);
		margin-bottom: 0.25rem;
	}

	.method-details span {
		color: var(--color-black);
		opacity: 0.7;
		font-size: 0.85rem;
	}


	.faq {
		padding: 4rem 2rem;
		background: var(--color-white);
		text-align: center;
	}

	.faq h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 3rem;
	}

	.faq-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.faq-item {
		background: var(--color-light-gray);
		border: 1px solid var(--color-light-gray);
		padding: 2rem;
		text-align: left;
	}

	.faq-item h3 {
		font-weight: var(--font-weight-extrabold);
		color: var(--color-black);
		margin-bottom: 1rem;
		font-size: 1rem;
	}

	.faq-item p {
		color: var(--color-black);
		line-height: 1.5;
		font-size: 0.9rem;
	}

	.support {
		padding: 4rem 2rem;
		background: var(--color-secondary);
		color: var(--color-white);
		text-align: center;
	}

	.support h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 3rem;
	}

	.resources-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.resource {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 2rem;
		text-align: center;
	}

	.resource-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.resource h3 {
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.resource p {
		margin-bottom: 1.5rem;
		opacity: 0.9;
		font-size: 0.9rem;
	}

	.resource-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.resource-link:hover {
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2.5rem;
		}

		.contact-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.faq-grid {
			grid-template-columns: 1fr;
		}

		.resources-grid {
			grid-template-columns: 1fr;
		}

		.contact-form,
		.contact-info {
			padding: 2rem;
		}
	}
</style>