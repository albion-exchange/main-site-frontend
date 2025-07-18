<script lang="ts">
	export let paddingClass = 'p-8';
	
	// Tailwind class mapping
	$: contentClasses = `relative ${paddingClass}`;
</script>

<div class={contentClasses}>
	<slot />
</div>