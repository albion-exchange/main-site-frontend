<script lang="ts">
	import { getImageUrl } from '$lib/utils/imagePath';
	
	export let src: string;
	export let alt: string;
	export let heightClass = 'h-[200px]';
	export let zoomOnHover = true;
	
	// Ensure proper image URL
	$: imageSrc = getImageUrl(src);
	
	// Tailwind class mappings
	$: wrapperClasses = `overflow-hidden relative w-full ${heightClass}`;
	$: imageClasses = `w-full h-full object-cover transition-transform duration-300 ${zoomOnHover ? 'will-change-transform group-hover:scale-105 [@media(hover:none)]:group-hover:transform-none' : ''}`;
</script>

<div class={wrapperClasses}>
	{#if imageSrc}
		<img 
			src={imageSrc} 
			{alt} 
			class={imageClasses}
			loading="lazy"
		/>
	{:else}
		<div class="w-full h-full bg-gray-200 flex items-center justify-center">
			<span class="text-gray-400">No image</span>
		</div>
	{/if}
</div>

