<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let title = 'Albion Marketplace';

	onMount(() => {
		console.log('Albion Marketplace initialized');
	});

	function navigateToMarketplace() {
		goto('/marketplace');
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Albion royalty token marketplace" />
</svelte:head>

<section class="hero">
	<div class="hero-content">
		<h1>Welcome to {title}</h1>
		<p>Discover and invest in tokenized oil field assets</p>
		<button class="cta-button" on:click={navigateToMarketplace}>
			Explore Marketplace
		</button>
	</div>
	
	<div class="hero-features">
		<div class="feature">
			<h3>Tokenized Assets</h3>
			<p>Own fractions of productive oil fields through blockchain technology</p>
		</div>
		<div class="feature">
			<h3>Monthly Distributions</h3>
			<p>Receive regular payments based on field performance</p>
		</div>
		<div class="feature">
			<h3>Transparent Reporting</h3>
			<p>Track production, revenue, and distributions in real-time</p>
		</div>
	</div>
</section>

<style>
	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 4rem 2rem;
		background: var(--color-white);
		color: var(--color-black);
	}

	.hero-content {
		margin-bottom: 6rem;
		max-width: 600px;
	}

	h1 {
		font-size: 3.5rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1.5rem;
		letter-spacing: -0.02em;
	}

	.hero-content p {
		font-size: 1.25rem;
		margin-bottom: 3rem;
		color: var(--color-black);
		font-weight: var(--font-weight-regular);
	}

	.cta-button {
		background: var(--color-primary);
		color: var(--color-white);
		border: none;
		padding: 1rem 2.5rem;
		font-size: 1rem;
		font-weight: var(--font-weight-semibold);
		border-radius: 0;
		cursor: pointer;
		transition: background-color 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.cta-button:hover {
		background: var(--color-secondary);
	}

	.hero-features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 3rem;
		max-width: 1000px;
		width: 100%;
	}

	.feature {
		background: var(--color-white);
		padding: 2.5rem 2rem;
		border: 1px solid var(--color-light-gray);
		border-radius: 0;
	}

	.feature h3 {
		font-size: 1.25rem;
		font-weight: var(--font-weight-extrabold);
		margin-bottom: 1rem;
		color: var(--color-secondary);
	}

	.feature p {
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
		color: var(--color-black);
	}

	@media (max-width: 768px) {
		.hero {
			padding: 3rem 1.5rem;
		}

		h1 {
			font-size: 2.5rem;
		}

		.hero-content p {
			font-size: 1.125rem;
		}

		.hero-features {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.feature {
			padding: 2rem 1.5rem;
		}
	}
</style>