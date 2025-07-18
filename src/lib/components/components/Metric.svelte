<script lang="ts">
	export let value: string | number;
	export let label: string;
	export let note: string = '';
	export let subtitle: string = '';
	export let variant: 'default' | 'positive' | 'negative' | 'primary' | 'available' | 'unclaimed' | 'payout' = 'default';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let clickable: boolean = false;
	export let centered: boolean = true;

	// Events
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick() {
		if (clickable) {
			dispatch('click');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (clickable && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			dispatch('click');
		}
	}
	
	// Size and variant mappings
	const sizeClasses = {
		small: {
			value: 'text-base md:text-sm',
			label: 'text-[0.65rem]'
		},
		medium: {
			value: 'text-2xl md:text-xl',
			label: 'text-[0.7rem]'
		},
		large: {
			value: 'text-3xl md:text-2xl',
			label: 'text-xs',
			note: 'text-xs'
		}
	};
	
	const variantClasses = {
		default: 'text-black',
		positive: 'text-primary',
		negative: 'text-red-600',
		primary: 'text-primary',
		available: 'text-primary',
		unclaimed: 'text-primary',
		payout: 'text-primary'
	};
	
	$: containerClasses = `flex flex-col gap-1 ${centered ? 'items-center text-center' : 'items-start'} ${clickable ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-light-gray hover:p-2 hover:rounded-lg focus:outline-primary focus:outline-2 focus:outline-offset-2 focus:rounded-lg' : ''}`;
	$: valueClasses = `font-extrabold leading-none mb-2 ${sizeClasses[size].value} ${variantClasses[variant]}`;
	$: labelClasses = `font-semibold text-black uppercase tracking-wide mb-1 ${sizeClasses[size].label}`;
	$: noteClasses = `text-[0.65rem] text-secondary font-medium ${size === 'large' ? 'text-xs' : ''} ${variant === 'positive' ? 'text-primary' : variant === 'negative' ? 'text-red-600' : ''}`;
	$: subtitleClasses = `text-[0.7rem] text-secondary font-medium mt-1 ${size === 'large' ? 'text-xs' : ''}`;
</script>

<div 
	class={containerClasses}
	on:click={handleClick}
	on:keydown={handleKeydown}
	role={clickable ? 'button' : undefined}
	{...(clickable ? { tabindex: 0 } : {})}
>
	<div class={valueClasses}>
		{value}
	</div>
	<div class={labelClasses}>{label}</div>
	{#if note}
		<div class={noteClasses}>
			{note}
		</div>
	{/if}
	{#if subtitle}
		<div class={subtitleClasses}>{subtitle}</div>
	{/if}
</div>

