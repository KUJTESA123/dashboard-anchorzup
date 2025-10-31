import { Injectable } from '@angular/core';
import { Widget, DashboardLayout, GlobalFilters } from '../components/dashboard/dashboard.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardLayoutService {
  private readonly LAYOUT_VERSION = '1.0.0';
  private readonly LAYOUT_STORAGE_KEY = 'anchorzup_dashboard_layout';

  saveLayout(widgets: Widget[], filters: GlobalFilters): boolean {
    try {
      const layout: DashboardLayout = {
        widgets: widgets.map((widget, index) => ({
          ...widget,
          position: index
        })),
        filters: { ...filters },
        timestamp: new Date().toISOString(),
        version: this.LAYOUT_VERSION
      };

      localStorage.setItem(this.LAYOUT_STORAGE_KEY, JSON.stringify(layout));
      return true;
    } catch (error) {
      console.error('Error saving layout:', error);
      return false;
    }
  }

  loadLayout(): DashboardLayout | null {
    try {
      const saved = localStorage.getItem(this.LAYOUT_STORAGE_KEY);
      
      if (saved) {
        const layout: DashboardLayout = JSON.parse(saved);
        
        if (this.isValidLayout(layout)) {
          return {
            widgets: this.migrateLayout(layout.widgets),
            filters: layout.filters || this.getDefaultFilters(),
            timestamp: layout.timestamp,
            version: layout.version
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading layout:', error);
      return null;
    }
  }

  resetLayout(): void {
    localStorage.removeItem(this.LAYOUT_STORAGE_KEY);
  }

  private isValidLayout(layout: any): layout is DashboardLayout {
    return layout && 
           layout.widgets && 
           Array.isArray(layout.widgets) && 
           layout.widgets.length > 0;
  }

  private migrateLayout(widgets: any[]): Widget[] {
    return widgets.map(widget => ({
      id: widget.id || 'unknown',
      title: widget.title || this.getWidgetTitle(widget.id),
      show: widget.show !== undefined ? widget.show : true,
      size: widget.size || 'small',
      colSpan: widget.colSpan || 1,
      rowSpan: widget.rowSpan || 1,
      position: widget.position || 0
    })).sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  private getWidgetTitle(widgetId: string): string {
    const titles: { [key: string]: string } = {
      'totalSales': 'Total Sales',
      'mainLineChart': 'Revenue Trend',
      'smallLineChart': 'User Activity',
      'barChart': 'Sales Volume',
      'salesTable': 'Sales Data',
    };
    return titles[widgetId] || 'Unknown Widget';
  }

  private getDefaultFilters(): GlobalFilters {
    return {
      dataset: 'sales',
      timeRange: '30',
      region: 'all'
    };
  }
}
