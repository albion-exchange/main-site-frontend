<!--
   @fileoverview PageTemplate Component (Template)
   
   A page template that provides consistent layout structure for all pages.
   This template handles the overall page layout, navigation, and content areas.
   
   @component PageTemplate
   @example
   <PageTemplate title="Dashboard" breadcrumb={breadcrumbItems}>
     <svelte:fragment slot="header-actions">
       <Button>Action</Button>
     </svelte:fragment>
     
     <main>Page content here</main>
   </PageTemplate>
-->

<script lang="ts">
	import { Icon, Button } from '../atoms';
	
	// Type definitions
	interface BreadcrumbItem {
		label: string;
		href?: string;
		current?: boolean;
	}
	
	// Props
	export let title: string;
	export let subtitle: string | null = null;
	export let breadcrumb: BreadcrumbItem[] = [];
	export let loading = false;
	export let error: string | null = null;
	export let maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' = 'full';
	export let padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
	
	// Computed classes
	$: maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-4xl',
		xl: 'max-w-6xl',
		'2xl': 'max-w-7xl',
		full: 'max-w-none'
	}[maxWidth];
	
	$: paddingClasses = {
		none: 'p-0',
		small: 'p-4',
		medium: 'p-6',
		large: 'p-8'
	}[padding];
	
	$: containerClasses = `mx-auto ${maxWidthClasses} ${paddingClasses}`;
</script>

<svelte:head>
	<title>{title} - Albion</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Page Header -->
	<header class="bg-white shadow-sm border-b border-gray-200">
		<div class={containerClasses}>
			<div class="py-6">
				<!-- Breadcrumb -->
				{#if breadcrumb.length > 0}
					<nav class="flex mb-4" aria-label="Breadcrumb">
						<ol class="inline-flex items-center space-x-1 md:space-x-3">
							{#each breadcrumb as item, index}
								<li class="inline-flex items-center">
									{#if index > 0}
										<Icon name="ChevronRight" size="xs" color="gray" />
									{/if}
									
									{#if item.href && !item.current}
										<a 
											href={item.href}
											class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
										>
											{item.label}
										</a>
									{:else}
										<span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">
											{item.label}
										</span>
									{/if}
								</li>
							{/each}
						</ol>
					</nav>
				{/if}
				
				<!-- Page Title and Actions -->
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 class="text-2xl font-bold text-gray-900">
							{title}
						</h1>
						{#if subtitle}
							<p class="mt-1 text-sm text-gray-600">
								{subtitle}
							</p>
						{/if}
					</div>
					
					<!-- Header Actions Slot -->
					<div class="flex items-center gap-2">
						<slot name="header-actions" />
					</div>
				</div>
			</div>
		</div>
	</header>
	
	<!-- Main Content -->
	<main class={containerClasses}>
		{#if loading}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-12">
				<div class="flex items-center space-x-2 text-gray-600">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
					<span class="text-lg">Loading...</span>
				</div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="rounded-md bg-red-50 p-4 mt-6">
				<div class="flex">
					<div class="flex-shrink-0">
						<Icon name="AlertCircle" size="medium" color="red" />
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">
							Error
						</h3>
						<div class="mt-2 text-sm text-red-700">
							<p>{error}</p>
						</div>
						<div class="mt-4">
							<Button 
								variant="danger" 
								size="small"
								on:click={() => window.location.reload()}
							>
								<Icon name="RefreshCw" size="xs" />
								Retry
							</Button>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Page Content -->
			<div class="py-6">
				<slot />
			</div>
		{/if}
	</main>
	
	<!-- Footer Slot -->
	<footer class={containerClasses}>
		<slot name="footer" />
	</footer>
</div>