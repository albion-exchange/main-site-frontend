<script lang="ts">
	export let size: 'small' | 'base' | 'large' = 'base';
	export let color: 'default' | 'muted' | 'primary' | 'white' = 'default';
	export let align: 'left' | 'center' | 'right' = 'left';
	export let maxWidth: 'none' | 'prose' | 'narrow' = 'none';
	export let className = '';
	
	const sizeClasses = {
		small: 'text-sm',
		base: 'text-base',
		large: 'text-lg md:text-xl'
	};
	
	const colorClasses = {
		default: 'text-black',
		muted: 'text-black opacity-70',
		primary: 'text-primary',
		white: 'text-white'
	};
	
	const alignClasses = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	};
	
	const maxWidthClasses = {
		none: '',
		prose: 'max-w-3xl',
		narrow: 'max-w-2xl'
	};
	
	$: classes = `${sizeClasses[size]} ${colorClasses[color]} ${alignClasses[align]} ${maxWidthClasses[maxWidth]} leading-relaxed font-figtree ${align === 'center' && maxWidth !== 'none' ? 'mx-auto' : ''} ${className}`;
</script>

<p class={classes}>
	<slot />
</p>