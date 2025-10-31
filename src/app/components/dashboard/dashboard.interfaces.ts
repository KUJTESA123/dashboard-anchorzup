export interface Widget { // Defines a dashboard widget configuration
  id: string;
  title: string;
  show: boolean;
  size: 'small' | 'medium' | 'large' | 'x-large';
  colSpan: number;
  rowSpan: number;
  position?: number;
}

export interface GlobalFilters { // Dashboard-wide filter settings
  dataset: string;
  timeRange: string;
  region: string;
}

export interface FilteredData { // Dashboard data after filters applied
  totalSales: { value: string; trend: number };
  performance: { conversionRate: number; avgSession: string; bounceRate: number };
  analytics: { totalVisitors: number; trend: number };
  salesTable: any[];
}

export interface DashboardLayout { // Saved dashboard layout structure
  widgets: Widget[];
  filters: GlobalFilters;
  timestamp: string;
  version: string;
}
