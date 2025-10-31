import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private salesData = { // Mock sales data for different time periods
    '7': [1200, 1800, 1500, 2200, 2800, 2500, 3000],
    '30': [12000, 19000, 15000, 22000, 28000, 30000, 25000, 32000, 28000, 35000, 40000, 38000],
    '90': [120000, 190000, 150000, 220000, 280000, 300000, 250000, 320000, 280000, 350000],
    '365': [1200000, 1900000, 1500000, 2200000, 2800000, 3000000, 2500000, 3200000]
  };

  private userActivityData = { // Mock user activity metrics
    '7': [45, 52, 48, 65, 58, 62, 70],
    '30': [450, 520, 480, 650, 580, 620, 700, 680, 720, 750],
    '90': [4500, 5200, 4800, 6500, 5800, 6200, 7000],
    '365': [45000, 52000, 48000, 65000, 58000, 62000, 70000]
  };

  private salesVolumeData = { // Mock quarterly sales volumes
    '7': [15, 22, 18, 25],
    '30': [45, 62, 58, 75],
    '90': [145, 162, 158, 175],
    '365': [450, 620, 580, 750]
  };

  private salesTableData = { // Mock table data organized by region
    'all': [
      { name: 'Alice Johnson', email: 'alice@mail.com', country: 'USA', sales: '$1,200', region: 'north' },
      { name: 'Bob Smith', email: 'bob@mail.com', country: 'UK', sales: '$950', region: 'europe' },
      { name: 'Carla Müller', email: 'carla@mail.com', country: 'Germany', sales: '$870', region: 'europe' },
      { name: 'David Chen', email: 'david@mail.com', country: 'China', sales: '$1,500', region: 'asia' },
      { name: 'Emma Wilson', email: 'emma@mail.com', country: 'Canada', sales: '$1,100', region: 'north' },
    ],
    'north': [
      { name: 'Alice Johnson', email: 'alice@mail.com', country: 'USA', sales: '$1,200', region: 'north' },
      { name: 'Emma Wilson', email: 'emma@mail.com', country: 'Canada', sales: '$1,100', region: 'north' },
    ],
    'europe': [
      { name: 'Bob Smith', email: 'bob@mail.com', country: 'UK', sales: '$950', region: 'europe' },
      { name: 'Carla Müller', email: 'carla@mail.com', country: 'Germany', sales: '$870', region: 'europe' },
    ],
    'asia': [
      { name: 'David Chen', email: 'david@mail.com', country: 'China', sales: '$1,500', region: 'asia' },
    ]
  };

  private datasetMultipliers = { // Multipliers to simulate different dataset types
    'sales': 1.0,
    'users': 0.7,
    'revenue': 1.3
  };

  getSalesData(timeRange: string, dataset: string = 'sales'): number[] { // Get sales data with dataset multiplier applied
    const baseData = this.salesData[timeRange as keyof typeof this.salesData] || this.salesData['30'];
    const multiplier = this.datasetMultipliers[dataset as keyof typeof this.datasetMultipliers] || 1;
    return baseData.map(value => Math.round(value * multiplier));
  }

  getUserActivityData(timeRange: string, dataset: string = 'sales'): number[] { // Get user activity metrics
    const baseData = this.userActivityData[timeRange as keyof typeof this.userActivityData] || this.userActivityData['30'];
    const multiplier = this.datasetMultipliers[dataset as keyof typeof this.datasetMultipliers] || 1;
    return baseData.map(value => Math.round(value * multiplier));
  }

  getSalesVolumeData(timeRange: string, dataset: string = 'sales'): number[] { // Get sales volume data
    const baseData = this.salesVolumeData[timeRange as keyof typeof this.salesVolumeData] || this.salesVolumeData['30'];
    const multiplier = this.datasetMultipliers[dataset as keyof typeof this.datasetMultipliers] || 1;
    return baseData.map(value => Math.round(value * multiplier));
  }
  
  getSalesTableData(region: string = 'all'): any[] { // Get table data filtered by region
    return this.salesTableData[region as keyof typeof this.salesTableData] || this.salesTableData['all'];
  }

  getTotalSales(timeRange: string, dataset: string = 'sales'): { value: string; trend: number } { // Calculate total sales with trend percentage
    const salesData = this.getSalesData(timeRange, dataset);
    const total = salesData.reduce((sum, value) => sum + value, 0);
    const previousTotal = total * 0.88; // Simulate 12% growth
    const trend = ((total - previousTotal) / previousTotal) * 100;
    
    return {
      value: this.formatCurrency(total),
      trend: Math.round(trend)
    };
  }

  private formatCurrency(amount: number): string { // Format number as currency with K/M suffix
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toLocaleString();
  }
}
