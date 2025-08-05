<script lang="ts">
	export let message: string = 'Loading...';
	export let showWrapper: boolean = true;
	
	import { ContentSection } from '$lib/components/layout';
</script>

{#if showWrapper}
	<ContentSection background="white" padding="standard" centered>
		<div class="text-center">
			<div class="w-8 h-8 border-4 border-light-gray border-t-primary animate-spin mx-auto mb-4"></div>
			<p>{message}</p>
		</div>
	</ContentSection>
{:else}
	<div class="text-center">
		<div class="w-8 h-8 border-4 border-light-gray border-t-primary animate-spin mx-auto mb-4"></div>
		<p>{message}</p>
	</div>
{/if}