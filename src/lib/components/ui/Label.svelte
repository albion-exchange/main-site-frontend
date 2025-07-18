<script lang="ts">
	export let variant: 'default' | 'muted' | 'strong' = 'default';
	export let size: 'xs' | 'sm' | 'base' = 'xs';
	export let uppercase = true;
	export let className = '';
	
	const variantClasses = {
		default: 'text-black',
		muted: 'text-black opacity-70',
		strong: 'text-black'
	};
	
	const sizeClasses = {
		xs: 'text-xs font-bold',
		sm: 'text-sm font-bold',
		base: 'text-base font-extrabold'
	};
	
	$: classes = `${sizeClasses[size]} ${variantClasses[variant]} ${uppercase ? 'uppercase' : ''} tracking-wider font-figtree ${className}`;
</script>

<span class={classes}>
	<slot />
</span>