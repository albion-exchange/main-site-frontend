<script lang="ts">
  export let title: string;
  export let open = false; // initial open state
  export let className = '';
  let isOpen = open;

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<!-- Mobile-first collapsible (visible by default, override with utility classes) -->
<div class={`border border-light-gray rounded-lg ${className}`}>
  <button
    class="w-full flex justify-between items-center p-4 bg-white font-semibold text-left cursor-pointer select-none"
    on:click={toggle}
    aria-expanded={isOpen}
  >
    <span>{title}</span>
    <svg
      class="w-4 h-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {#if isOpen}
    <div class="p-4 border-t border-light-gray bg-white">
      <slot />
    </div>
  {/if}
</div>

<style>
  /* Ensure svg rotates smoothly */
  svg.rotate-180 {
    transform: rotate(180deg);
  }
</style>