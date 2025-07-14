// Reusable layout and container class combinations
export const layouts = {
  // Page layouts
  pageContainer: 'max-w-6xl mx-auto',
  pageSection: 'py-16 px-8 md:py-12 md:px-8',
  pageSectionAlt: 'py-16 px-8 bg-light-gray',
  
  // Grid systems
  gridTwo: 'grid grid-cols-1 md:grid-cols-2 gap-8',
  gridThree: 'grid grid-cols-1 md:grid-cols-3 gap-8',
  gridFour: 'grid grid-cols-1 md:grid-cols-4 gap-8',
  gridMetrics: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  
  // Flex layouts
  flexBetween: 'flex justify-between items-center',
  flexCenter: 'flex items-center justify-center',
  flexColumn: 'flex flex-col',
  flexGap: 'flex gap-4',
  
  // Card containers
  card: 'bg-white border border-light-gray p-8',
  cardHover: 'bg-white border border-light-gray p-8 transition-all duration-200 hover:shadow-card-hover',
  cardCompact: 'bg-white border border-light-gray p-6',
  cardFlush: 'bg-white border border-light-gray',
  
  // Metric containers
  metricCard: 'bg-white border border-light-gray p-8 text-center',
  metricCompact: 'text-center p-4 bg-light-gray border border-light-gray',
  
  // Table layouts
  tableHeader: 'grid gap-4 p-4 bg-light-gray border-b border-light-gray',
  tableRow: 'grid gap-4 p-4 border-b border-light-gray items-center hover:bg-light-gray transition-colors duration-200',
  
  // Responsive spacing
  sectionPadding: 'py-12 px-8 md:py-16 md:px-8',
  cardPadding: 'p-6 md:p-8',
  compactPadding: 'p-4 md:p-6',
};

// Common layout patterns
export const layoutPatterns = {
  heroSection: `${layouts.pageSection} text-center bg-white border-b border-light-gray`,
  gridSection: `${layouts.pageSection} ${layouts.pageContainer}`,
  cardGrid: `${layouts.gridThree} mb-8`,
};