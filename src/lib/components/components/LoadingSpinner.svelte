<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let className: string = '';
	
	$: sizeClasses = {
		small: 'w-4 h-4 border-2',
		medium: 'w-8 h-8 border-4', 
		large: 'w-12 h-12 border-4'
	};
</script>

<div class="{sizeClasses[size]} border-light-gray border-t-primary animate-spin {className}"></div>