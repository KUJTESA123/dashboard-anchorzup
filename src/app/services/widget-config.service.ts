import { Injectable } from '@angular/core';
import { Widget } from '../components/dashboard/dashboard.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WidgetConfigService {
  
  getDefaultWidgets(): Widget[] {
    return [
      { 
        id: 'totalSales', 
        title: 'Total Sales', 
        show: true, 
        size: 'small', 
        colSpan: 1, 
        rowSpan: 1, 
        position: 0 
      },
      { 
        id: 'mainLineChart', 
        title: 'Revenue Trend', 
        show: true, 
        size: 'small', 
        colSpan: 1, 
        rowSpan: 2, 
        position: 1 
      },
      { 
        id: 'barChart', 
        title: 'Sales Volume', 
        show: true, 
        size: 'small', 
        colSpan: 1, 
        rowSpan: 2, 
        position: 2 
      },
      { 
        id: 'smallLineChart', 
        title: 'User Activity', 
        show: true, 
        size: 'small', 
        colSpan: 1, 
        rowSpan: 1, 
        position: 3 
      },
      { 
        id: 'salesTable', 
        title: 'Sales Data', 
        show: true, 
        size: 'large', 
        colSpan: 2, 
        rowSpan: 3, 
        position: 4 
      },
    ];
  }

  getAllAvailableWidgets(): Widget[] {
    return [
      { id: 'totalSales', title: 'Total Sales', show: false, size: 'small', colSpan: 1, rowSpan: 1 },
      { id: 'mainLineChart', title: 'Revenue Trend', show: false, size: 'small', colSpan: 2, rowSpan: 2 },
      { id: 'smallLineChart', title: 'User Activity', show: false, size: 'small', colSpan: 1, rowSpan: 1 },
      { id: 'barChart', title: 'Sales Volume', show: false, size: 'small', colSpan: 1, rowSpan: 1 },
      { id: 'salesTable', title: 'Sales Data', show: false, size: 'large', colSpan: 2, rowSpan: 3 },
    ];
  }

  getSizeConfig(size: 'small' | 'medium' | 'large' | 'x-large'): { colSpan: number; rowSpan: number } {
    const sizeConfig = {
      'small': { colSpan: 1, rowSpan: 1 },
      'medium': { colSpan: 2, rowSpan: 2 },
      'large': { colSpan: 2, rowSpan: 3 },
      'x-large': { colSpan: 3, rowSpan: 3 }
    };
    return sizeConfig[size];
  }

  getSizeDisplay(widget: Widget): string {
    const sizes = {
      'small': 'S',
      'medium': 'M', 
      'large': 'L',
      'x-large': 'XL'
    };
    return sizes[widget.size];
  }

  getResizeIcon(widget: Widget): string {
    const icons = {
      'small': '⤢',
      'medium': '⤡',
      'large': '⛶',
      'x-large': '🗖'
    };
    return icons[widget.size];
  }

  getWidgetClass(widget: Widget, isCustomizing: boolean): string {
    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-2',
      large: 'col-span-2 row-span-3',
      'x-large': 'col-span-3 row-span-3'
    };
    
    const baseClasses = 'bg-white rounded-xl border-2 border-dashed border-gray-300 shadow-sm transition-all duration-200 relative group hover:border-purple-300';
    const dragClass = 'cursor-move hover:shadow-lg';
    // Always show dashed outline; keep isCustomizing for other controls if needed
    
    return `${baseClasses} ${sizeClasses[widget.size]} ${dragClass}`;
  }

  getWidgetHeight(widget: Widget): string {
    if (widget.id === 'salesTable') return 'min-h-[300px]';
    if (widget.size === 'small') return 'min-h-[200px]';
    if (widget.size === 'medium') return 'min-h-[300px]';
    if (widget.size === 'large') return 'min-h-[400px]';
    return 'min-h-[200px]'; 
  }
}
