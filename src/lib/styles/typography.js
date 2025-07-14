// Reusable typography class combinations
export const typography = {
  // Headings
  pageTitle: 'text-4xl md:text-5xl font-extrabold text-black uppercase tracking-tight',
  sectionTitle: 'text-3xl md:text-2xl font-extrabold text-black uppercase tracking-wider',
  cardTitle: 'text-xl font-extrabold text-black uppercase tracking-wider',
  subsectionTitle: 'text-lg font-extrabold text-black uppercase tracking-wider',
  
  // Labels and metadata
  label: 'text-xs font-bold text-black uppercase tracking-wider',
  labelMuted: 'text-xs font-bold text-black opacity-70 uppercase tracking-wider',
  meta: 'text-xs text-black opacity-70',
  
  // Values and metrics
  metricValueLarge: 'text-3xl font-extrabold text-black',
  metricValue: 'text-2xl font-extrabold text-black',
  metricValueSmall: 'text-lg font-extrabold text-black',
  metricValuePrimary: 'text-primary font-extrabold',
  
  // Body text
  bodyText: 'text-base text-black leading-relaxed',
  bodyTextSmall: 'text-sm text-black',
  
  // Links
  link: 'text-primary hover:text-secondary transition-colors duration-200',
  
  // Special states
  error: 'text-red-600 font-semibold',
  success: 'text-primary font-semibold',
};

// Common text combinations
export const textPatterns = {
  metricWithLabel: {
    value: typography.metricValue,
    label: typography.label,
  },
  cardHeader: {
    title: typography.cardTitle,
    subtitle: typography.meta,
  },
};