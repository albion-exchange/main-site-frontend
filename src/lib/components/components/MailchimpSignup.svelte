<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import PrimaryButton from './PrimaryButton.svelte';
	
	export let placeholder = 'Enter your email address';
	export let buttonText = 'Subscribe';
	export let disabled = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let layout: 'horizontal' | 'vertical' = 'horizontal';
	export let showLabel = false;
	export let label = 'Email Address';
	export let fullWidth = true;
	export let isSubmitting = false;
	export let submitStatus: 'idle' | 'success' | 'error' = 'idle';
	export let errorMessage = '';
	export let successMessage = 'Successfully subscribed!';
	
	let email = '';
	
	const dispatch = createEventDispatcher<{
		submit: { email: string };
	}>();
	
	$: inputClasses = getInputClasses(size, fullWidth);
	$: buttonClasses = getButtonClasses(size);
	$: containerClasses = getContainerClasses(layout);
	
	function getInputClasses(size: string, fullWidth: boolean) {
		const baseClasses = 'border border-light-gray bg-white text-black placeholder-black placeholder-opacity-50 focus:outline-none focus:border-primary disabled:opacity-50';
		const sizeClasses = {
			small: 'px-3 py-2 text-sm',
			medium: 'px-4 py-3 text-base',
			large: 'px-5 py-4 text-lg'
		};
		const widthClass = fullWidth ? 'w-full' : '';
		
		return `${baseClasses} ${sizeClasses[size]} ${widthClass}`;
	}
	
	function getButtonClasses(size: string) {
		const sizeClasses = {
			small: 'text-sm px-4 py-2',
			medium: 'text-base px-6 py-3',
			large: 'text-lg px-8 py-4'
		};
		
		return sizeClasses[size];
	}
	
	function getContainerClasses(layout: string) {
		return layout === 'horizontal' 
			? 'flex gap-2 sm:gap-3 items-start'
			: 'space-y-3';
	}
	
	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email || isSubmitting || disabled) return;
		
		dispatch('submit', { email });
	}
	
	function isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}
	
	$: isFormValid = email && isValidEmail(email);
</script>

<form class={containerClasses} on:submit={handleSubmit}>
	<div class={layout === 'horizontal' ? 'flex-1' : 'w-full'}>
		{#if showLabel}
			<label for="mailchimp-email" class="block text-sm font-medium text-black mb-2">
				{label}
			</label>
		{/if}
		<input
			id="mailchimp-email"
			type="email"
			class={inputClasses}
			placeholder={placeholder}
			bind:value={email}
			required
			disabled={isSubmitting || disabled}
			aria-describedby={submitStatus === 'error' ? 'mailchimp-error' : undefined}
		/>
	</div>
	
	<div class={layout === 'horizontal' ? 'flex-shrink-0' : 'w-full'}>
		<PrimaryButton 
			type="submit" 
			disabled={!isFormValid || isSubmitting || disabled}
			size={size === 'small' ? 'small' : 'medium'}
			fullWidth={layout === 'vertical'}
		>
			{isSubmitting ? 'Submitting...' : buttonText}
		</PrimaryButton>
	</div>
</form>

{#if submitStatus === 'success'}
	<div class="mt-3 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">
		{successMessage}
	</div>
{:else if submitStatus === 'error'}
	<div id="mailchimp-error" class="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
		{errorMessage || 'Subscription failed. Please try again.'}
	</div>
{/if}

<style>
	/* Additional styling for better form appearance */
	input:focus {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
</style>