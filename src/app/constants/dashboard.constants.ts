export const DASHBOARD_CONSTANTS = {
  DATASETS: { // Available dataset options
    sales: 'Sales Data',
    users: 'User Analytics',
    revenue: 'Revenue Reports'
  },
  
  TIME_RANGES: { // Available time range filters
    '7': 'Last 7 days',
    '30': 'Last 30 days',
    '90': 'Last 90 days',
    '365': 'Last year'
  },
  
  REGIONS: { // Available region filters
    all: 'All Regions',
    north: 'North America',
    europe: 'Europe',
    asia: 'Asia'
  },

  DEFAULT_FILTERS: { // Default filter values on load
    dataset: 'sales',
    timeRange: '30',
    region: 'all'
  },

  WIDGET_SIZES: { // Widget size abbreviations
    small: 'S',
    medium: 'M',
    large: 'L',
    'x-large': 'XL'
  },

  TOAST_DURATION: 3000 // Toast notification display time in milliseconds
};

export const CHART_COLORS = { // Color palette for charts
  primary: '#6D28D9',
  primaryLight: 'rgba(109, 40, 217, 0.1)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  purple: '#8B5CF6',
  purpleDark: '#7C3AED'
};
