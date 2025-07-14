// Reusable button class combinations
export const buttons = {
  // Base button styles
  base: 'font-figtree font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all duration-200',
  
  // Primary buttons (already have component)
  primary: 'bg-black text-white border-none px-8 py-4 hover:bg-secondary',
  primarySmall: 'bg-black text-white border-none px-6 py-3 hover:bg-secondary',
  
  // Secondary buttons (already have component)
  secondary: 'bg-white text-black border-2 border-black px-8 py-4 hover:bg-black hover:text-white',
  secondarySmall: 'bg-white text-black border-2 border-black px-6 py-3 hover:bg-black hover:text-white',
  
  // Tab buttons
  tab: 'px-8 py-4 bg-transparent border-b-2 border-transparent hover:border-primary',
  tabActive: 'px-8 py-4 border-b-2 border-secondary bg-secondary text-white',
  
  // Control buttons
  control: 'px-6 py-3 bg-white border border-black text-black hover:bg-black hover:text-white',
  controlActive: 'bg-black text-white',
  controlPrimary: 'bg-primary border-primary text-white hover:opacity-90',
  
  // Icon buttons
  icon: 'w-8 h-8 flex items-center justify-center rounded transition-colors duration-200 hover:bg-light-gray',
  iconCircle: 'w-12 h-12 bg-black/70 text-white border-none rounded-full hover:bg-black hover:scale-110 hover:shadow-lg',
  
  // Share buttons
  share: 'w-8 h-8 bg-white border border-light-gray text-black rounded hover:bg-light-gray hover:border-secondary hover:text-secondary',
  
  // Claim buttons
  claim: 'bg-black text-white border-none px-6 py-3 hover:bg-secondary',
  
  // Utility classes
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  fullWidth: 'w-full',
};

// Button patterns for common use cases
export const buttonPatterns = {
  primaryAction: `${buttons.base} ${buttons.primary} ${buttons.disabled}`,
  secondaryAction: `${buttons.base} ${buttons.secondary} ${buttons.disabled}`,
  tabButton: `${buttons.base} ${buttons.tab}`,
  controlButton: `${buttons.base} ${buttons.control}`,
};