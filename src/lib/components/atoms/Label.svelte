<!--
@fileoverview Base Label Component (Atom)

A foundational label component that provides consistent styling and behavior
for form labels across the application.

@component Label
@example
<Label for="email" required>Email Address</Label>
-->

<script lang="ts">
	// Props with clear types and defaults
	export let htmlFor: string | undefined = undefined;
	export let required = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let weight: 'normal' | 'medium' | 'semibold' | 'bold' = 'medium';
	export let color: 'default' | 'muted' | 'error' | 'success' = 'default';
	
	// Computed classes based on props
	$: baseClasses = 'block';
	
	$: sizeClasses = {
		small: 'text-sm',
		medium: 'text-base',
		large: 'text-lg'
	}[size];
	
	$: weightClasses = {
		normal: 'font-normal',
		medium: 'font-medium',
		semibold: 'font-semibold',
		bold: 'font-bold'
	}[weight];
	
	$: colorClasses = {
		default: 'text-gray-700',
		muted: 'text-gray-500',
		error: 'text-red-700',
		success: 'text-green-700'
	}[color];
	
	$: labelClasses = `${baseClasses} ${sizeClasses} ${weightClasses} ${colorClasses}`;
</script>

<label 
	for={htmlFor} 
	class={labelClasses}
>
	<slot />
	{#if required}
		<span class="text-red-500 ml-1" aria-label="required">*</span>
	{/if}
</label>