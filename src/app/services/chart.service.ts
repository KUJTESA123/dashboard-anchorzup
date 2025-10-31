import { Injectable } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { MockDataService } from './mock-data.service';

Chart.register(...registerables, zoomPlugin);

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private charts: Chart[] = [];

  constructor(private mockDataService: MockDataService) {}

  destroyAllCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  renderMainLineChart(timeRange: string, dataset: string): void {
    const canvas = document.getElementById('mainLineChart-mainLineChart') as HTMLCanvasElement;
    if (!canvas) return;

    const salesData = this.mockDataService.getSalesData(timeRange, dataset);
    const labels = this.generateLabels(timeRange, salesData.length);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: salesData,
          borderColor: '#6D28D9',
          backgroundColor: 'rgba(109, 40, 217, 0.1)',
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => `$${context.parsed.y.toLocaleString()}`
            }
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            }
          }
        },
        scales: { 
          x: { display: true, grid: { display: false } }, 
          y: { 
            display: true,
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: {
              callback: (value: any) => {
                if (typeof value === 'number') {
                  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
                  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
                  return '$' + value;
                }
                return value;
              }
            }
          } 
        },
        onClick: (event: any, elements: any) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const value = salesData[index];
            const label = labels[index];
            this.showDrilldownDialog(label, value, 'Revenue');
          }
        }
      },
    });
    this.charts.push(chart);
  }

  renderSmallLineChart(timeRange: string, dataset: string): void {
    const canvas = document.getElementById('smallLineChart-smallLineChart') as HTMLCanvasElement;
    if (!canvas) return;

    const userData = this.mockDataService.getUserActivityData(timeRange, dataset);
    const labels = this.generateLabels(timeRange, userData.length, true);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'User Activity',
          data: userData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => `${context.parsed.y.toLocaleString()} users`
            }
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            }
          }
        },
        scales: { 
          x: { display: true, grid: { display: false } }, 
          y: { 
            display: true,
            grid: { color: 'rgba(0,0,0,0.1)' }
          } 
        },
        onClick: (event: any, elements: any) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const value = userData[index];
            const label = labels[index];
            this.showDrilldownDialog(label, value, 'User Activity');
          }
        }
      },
    });
    this.charts.push(chart);
  }

  renderBarChart(timeRange: string, dataset: string): void {
    const canvas = document.getElementById('barChart-barChart') as HTMLCanvasElement;
    if (!canvas) return;

    const volumeData = this.mockDataService.getSalesVolumeData(timeRange, dataset);

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Sales Volume',
          data: volumeData,
          backgroundColor: '#8B5CF6',
          borderColor: '#7C3AED',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => `${context.parsed.y} units`
            }
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            }
          }
        },
        scales: { 
          x: { display: true, grid: { display: false } }, 
          y: { 
            display: true,
            grid: { color: 'rgba(0,0,0,0.1)' }
          } 
        },
        onClick: (event: any, elements: any) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const value = volumeData[index];
            const label = ['Q1', 'Q2', 'Q3', 'Q4'][index];
            this.showDrilldownDialog(label, value, 'Sales Volume');
          }
        }
      },
    });
    this.charts.push(chart);
  }

  /**
   * Show drill-down dialog with detailed information
   */
  private showDrilldownDialog(label: string, value: number, chartName: string): void {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-4">${chartName} - Details</h3>
        <div class="space-y-2">
          <p class="text-gray-700"><span class="font-semibold">Period:</span> ${label}</p>
          <p class="text-gray-700"><span class="font-semibold">Value:</span> ${typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p class="text-sm text-gray-500 mt-4">💡 Tip: Use mouse wheel to zoom in/out on charts</p>
        </div>
        <button class="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
          Close
        </button>
      </div>
    `;
    
    const closeBtn = dialog.querySelector('button');
    const closeDialog = () => document.body.removeChild(dialog);
    
    closeBtn?.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeDialog();
    });
    
    document.body.appendChild(dialog);
  }

  /**
   * Reset zoom on a specific chart
   */
  resetChartZoom(widgetId: string): void {
    const chart = this.charts.find(c => {
      const canvas = c.canvas;
      return canvas?.id.includes(widgetId);
    });
    
    if (chart && (chart as any).resetZoom) {
      (chart as any).resetZoom();
    }
  }

  renderChartById(widgetId: string, timeRange: string, dataset: string): void {
    switch (widgetId) {
      case 'mainLineChart':
        this.renderMainLineChart(timeRange, dataset);
        break;
      case 'smallLineChart':
        this.renderSmallLineChart(timeRange, dataset);
        break;
      case 'barChart':
        this.renderBarChart(timeRange, dataset);
        break;
    }
  }

  renderAllCharts(widgets: any[], timeRange: string, dataset: string): void {
    this.destroyAllCharts();
    widgets.forEach(widget => {
      if (widget.show) {
        this.renderChartById(widget.id, timeRange, dataset);
      }
    });
  }

  private generateLabels(timeRange: string, dataLength: number, isShortTerm: boolean = false): string[] {
    switch (timeRange) {
      case '7':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, dataLength);
      case '30':
        return Array.from({ length: dataLength }, (_, i) => `Day ${i + 1}`);
      case '90':
        return Array.from({ length: dataLength }, (_, i) => `Week ${i + 1}`);
      case '365':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].slice(0, dataLength);
      default:
        return Array.from({ length: dataLength }, (_, i) => `Point ${i + 1}`);
    }
  }
}
