<script lang="ts">
	export let src: string;
	export let alt: string;
	export let heightClass = 'h-[200px]';
	export let zoomOnHover = true;
	
	// Tailwind class mappings
	$: wrapperClasses = `overflow-hidden relative w-full ${heightClass}`;
	$: imageClasses = `w-full h-full object-cover transition-transform duration-300 ${zoomOnHover ? 'will-change-transform group-hover:scale-105 [@media(hover:none)]:group-hover:transform-none' : ''}`;
</script>

<div class={wrapperClasses}>
	<img 
		{src} 
		{alt} 
		class={imageClasses}
		loading="lazy"
	/>
</div>

