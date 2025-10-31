import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Widget, GlobalFilters, FilteredData } from './dashboard.interfaces';
import { MockDataService } from '../../services/mock-data.service';
import { DashboardLayoutService } from '../../services/dashboard-layout.service';
import { WidgetConfigService } from '../../services/widget-config.service';
import { ChartService } from '../../services/chart.service';
import { ToastService } from '../../services/toast.service';
import { ExportService } from '../../services/export.service';
import { DASHBOARD_CONSTANTS } from '../../constants/dashboard.constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  widgets: Widget[] = []; // Currently displayed widgets
  allAvailableWidgets: Widget[] = []; // All possible widgets to choose from
  isCustomizing = false; // Toggle for customization mode
  isDropdownOpen = false; // Controls widget picker dropdown state
  tableSearch: string = ''; // Search term for filtering table data
  sortColumn: 'name' | 'email' | 'country' | 'sales' | '' = ''; // Current sort column
  sortDirection: 'asc' | 'desc' = 'asc'; // Sort order direction
  currentPage: number = 1; // Current pagination page
  itemsPerPage: number = 4; // Number of items per page

  globalFilters: GlobalFilters = { ...DASHBOARD_CONSTANTS.DEFAULT_FILTERS } as GlobalFilters; // Active filters for dashboard data

  filteredData: FilteredData = { // Dashboard data filtered by global filters
    totalSales: { value: '$56,780', trend: 12 },
    performance: { conversionRate: 4.5, avgSession: '3m 24s', bounceRate: 32 },
    analytics: { totalVisitors: 1247, trend: 8 },
    salesTable: []
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private mockDataService: MockDataService,
    private layoutService: DashboardLayoutService,
    private widgetConfigService: WidgetConfigService,
    private chartService: ChartService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  ngOnInit() {
    this.allAvailableWidgets = this.widgetConfigService.getAllAvailableWidgets(); // Load all widget options
    this.loadLayout(); // Load saved layout from localStorage
    this.applyGlobalFilters(); // Apply initial filter settings
  }

  ngAfterViewInit() {
    setTimeout(() => { // Wait for DOM to be ready
      this.chartService.renderAllCharts(this.widgets, this.globalFilters.timeRange, this.globalFilters.dataset);
    }, 100);
  }

  ngOnDestroy() {
    this.chartService.destroyAllCharts(); // Clean up chart instances
  }

  saveLayout(): void { // Persist current dashboard layout to localStorage
    const success = this.layoutService.saveLayout(this.widgets, this.globalFilters);
    if (success) {
      this.toastService.showToast('Dashboard layout saved successfully!', 'success');
    } else {
      this.toastService.showToast('Error saving layout', 'error');
    }
  }

  loadLayout(): void { // Load saved dashboard layout or use defaults
    const layout = this.layoutService.loadLayout();
    
    if (layout) {
      this.widgets = layout.widgets;
      this.globalFilters = layout.filters;
    } else {
      this.widgets = this.widgetConfigService.getDefaultWidgets();
    }
    
    this.cdr.detectChanges();
  }

  resetLayout(): void { // Reset dashboard to default layout
    if (confirm('Are you sure you want to reset to the default layout?')) {
      this.layoutService.resetLayout();
      this.widgets = this.widgetConfigService.getDefaultWidgets();
      this.globalFilters = { ...DASHBOARD_CONSTANTS.DEFAULT_FILTERS } as GlobalFilters;
      
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.applyGlobalFilters();
        this.chartService.renderAllCharts(this.widgets, this.globalFilters.timeRange, this.globalFilters.dataset);
      }, 100);
      
      this.toastService.showToast('Layout reset to default', 'success');
    }
  }

  private autoSaveLayout(): void { // Automatically save layout after changes
    setTimeout(() => {
      this.saveLayout();
    }, 500);
  }

  applyGlobalFilters() { // Apply selected filters and refresh data
    console.log('Applying filters:', this.globalFilters);
    
    this.updateFilteredData();
    this.chartService.renderAllCharts(this.widgets, this.globalFilters.timeRange, this.globalFilters.dataset);
    this.autoSaveLayout();
    this.cdr.detectChanges();
  }

  private updateFilteredData() { // Update dashboard data based on current filters
    const { timeRange, dataset, region } = this.globalFilters;

    this.filteredData.totalSales = this.mockDataService.getTotalSales(timeRange, dataset);
    this.filteredData.salesTable = this.mockDataService.getSalesTableData(region);
    this.currentPage = 1; // Reset to first page when data changes
  }

  get filteredSalesTable(): any[] { // Filter table rows by search term
    const rows = this.filteredData?.salesTable || [];
    const q = (this.tableSearch || '').trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r: any) =>
      (r?.name || '').toLowerCase().includes(q) ||
      (r?.email || '').toLowerCase().includes(q)
    );
  }

  get sortedSalesTable(): any[] { // Sort filtered table data by selected column
    const rows = [...this.filteredSalesTable];
    if (!this.sortColumn) return rows;
    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    return rows.sort((a: any, b: any) => {
      const av = (a?.[col] ?? '').toString().toLowerCase();
      const bv = (b?.[col] ?? '').toString().toLowerCase();
      if (col === 'sales') { // Handle numeric sorting for sales column
        const an = typeof a?.sales === 'number' ? a.sales : parseFloat(String(a?.sales).replace(/[^0-9.-]+/g, ''));
        const bn = typeof b?.sales === 'number' ? b.sales : parseFloat(String(b?.sales).replace(/[^0-9.-]+/g, ''));
        return (an - bn) * dir;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  get paginatedSalesTable(): any[] { // Get current page of sorted data
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.sortedSalesTable.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number { // Calculate total number of pages
    return Math.max(1, Math.ceil(this.sortedSalesTable.length / this.itemsPerPage));
  }

  get displayRange(): string { // Format pagination display text
    const total = this.sortedSalesTable.length;
    if (total === 0) return '0-0 of 0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return `${start}-${end} of ${total}`;
  }

  previousPage() { // Navigate to previous page
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() { // Navigate to next page
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  sortBy(column: 'name' | 'email' | 'country' | 'sales') { // Toggle sort column and direction
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1; // Reset to first page when sorting changes
  }

  getSortIcon(column: 'name' | 'email' | 'country' | 'sales'): string { // Get sort arrow icon for column header
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  clearFilters() { // Reset all filters to default values
    this.globalFilters = { ...DASHBOARD_CONSTANTS.DEFAULT_FILTERS } as GlobalFilters;
    this.applyGlobalFilters();
  }

  hasActiveFilters(): boolean { // Check if any filters differ from defaults
    const defaults = DASHBOARD_CONSTANTS.DEFAULT_FILTERS;
    return this.globalFilters.dataset !== defaults.dataset || 
           this.globalFilters.timeRange !== defaults.timeRange || 
           this.globalFilters.region !== defaults.region;
  }

  getActiveFilterText(): string { // Format text showing active filters
    const filters = [];
    const defaults = DASHBOARD_CONSTANTS.DEFAULT_FILTERS;
    if (this.globalFilters.dataset !== defaults.dataset) filters.push(this.getDatasetText());
    if (this.globalFilters.timeRange !== defaults.timeRange) filters.push(this.getTimeRangeText());
    if (this.globalFilters.region !== defaults.region) filters.push(this.getRegionText());
    return filters.join(', ');
  }

  getDatasetText(): string { // Get human-readable dataset name
    return DASHBOARD_CONSTANTS.DATASETS[this.globalFilters.dataset as keyof typeof DASHBOARD_CONSTANTS.DATASETS] || 'Sales Data';
  }

  getTimeRangeText(): string { // Get human-readable time range
    return DASHBOARD_CONSTANTS.TIME_RANGES[this.globalFilters.timeRange as keyof typeof DASHBOARD_CONSTANTS.TIME_RANGES] || 'Last 30 days';
  }

  getRegionText(): string { // Get human-readable region name
    return DASHBOARD_CONSTANTS.REGIONS[this.globalFilters.region as keyof typeof DASHBOARD_CONSTANTS.REGIONS] || 'All Regions';
  }

  getTrendClass(trend: number): string { // Return CSS class based on trend direction
    return trend >= 0 
      ? 'text-green-500 bg-green-50' 
      : 'text-red-500 bg-red-50';
  }

  drop(event: CdkDragDrop<Widget[]>) { // Handle drag-and-drop reordering of widgets
    moveItemInArray(this.widgets, event.previousIndex, event.currentIndex);
    this.autoSaveLayout();
    this.cdr.detectChanges();
  }

  getAvailableWidgets(): Widget[] { // Get widgets that can be added to dashboard
    const currentWidgetIds = this.widgets.map(w => w.id);
    return this.allAvailableWidgets.filter(widget => !currentWidgetIds.includes(widget.id));
  }

  toggleDropdown() { // Toggle widget picker dropdown
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() { // Close widget picker dropdown
    this.isDropdownOpen = false;
  }

  isWidgetVisible(widgetId: string): boolean { // Check if widget is currently displayed
    const w = this.widgets.find(w => w.id === widgetId);
    return !!(w && w.show !== false);
  }

  toggleWidgetVisibility(widget: Widget) { // Show or hide a widget
    const found = this.widgets.find(w => w.id === widget.id);
    if (found) {
      found.show = !found.show;
      if (found.show) setTimeout(() => this.chartService.renderChartById(found.id, this.globalFilters.timeRange, this.globalFilters.dataset), 100);
      this.autoSaveLayout();
    } else {
      this.addWidget(widget.id);
    }
  }

  addWidget(widgetType: string) { // Add new widget to dashboard
    const widgetToAdd = this.allAvailableWidgets.find(w => w.id === widgetType);
    if (widgetToAdd && !this.widgets.find(w => w.id === widgetType)) {
      this.widgets.push({ ...widgetToAdd, show: true });
      this.cdr.detectChanges();
      this.autoSaveLayout();
      setTimeout(() => this.chartService.renderChartById(widgetType, this.globalFilters.timeRange, this.globalFilters.dataset), 100);
    }
  }

  removeWidget(widgetId: string) { // Remove widget from dashboard
    this.widgets = this.widgets.filter(w => w.id !== widgetId);
    this.cdr.detectChanges();
    this.autoSaveLayout();
  }

  toggleWidget(widgetId: string) { // Toggle widget visibility state
    const widget = this.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.show = !widget.show;
      if (widget.show) {
        setTimeout(() => this.chartService.renderChartById(widgetId, this.globalFilters.timeRange, this.globalFilters.dataset), 100);
      }
      this.autoSaveLayout();
    }
  }

  resizeWidget(widgetId: string, newSize: 'small' | 'medium' | 'large' | 'x-large') { // Change widget size
    if (!this.isCustomizing) return;
    
    const sizeConfig = this.widgetConfigService.getSizeConfig(newSize);
    const widget = this.widgets.find(w => w.id === widgetId);
    
    if (widget) {
      widget.size = newSize;
      widget.colSpan = sizeConfig.colSpan;
      widget.rowSpan = sizeConfig.rowSpan;
      this.cdr.detectChanges();
      this.autoSaveLayout();
      setTimeout(() => this.chartService.renderChartById(widgetId, this.globalFilters.timeRange, this.globalFilters.dataset), 100);
    }
  }

  getSizeDisplay(widget: Widget): string { // Get display text for widget size
    return this.widgetConfigService.getSizeDisplay(widget);
  }

  getResizeIcon(widget: Widget): string { // Get icon for widget resize button
    return this.widgetConfigService.getResizeIcon(widget);
  }

  getWidgetClass(widget: Widget): string { // Get CSS classes for widget
    return this.widgetConfigService.getWidgetClass(widget, this.isCustomizing);
  }

  getWidgetHeight(widget: Widget): string { // Get height class for widget
    return this.widgetConfigService.getWidgetHeight(widget);
  }

  exportChartToPDF(widgetId: string) { // Export single chart to PDF file
    const canvas = document.getElementById(`${widgetId}-${widgetId}`) as HTMLCanvasElement;
    if (canvas) {
      const widget = this.widgets.find(w => w.id === widgetId);
      this.exportService.exportChartToPDF(canvas, widget?.title || 'Chart', `${widgetId}-chart.pdf`);
      this.toastService.showToast('Chart exported to PDF successfully!', 'success');
    }
  }

  exportChartAsPNG(widgetId: string) { // Export single chart to PNG image
    const canvas = document.getElementById(`${widgetId}-${widgetId}`) as HTMLCanvasElement;
    if (canvas) {
      this.exportService.exportChartAsPNG(canvas, `${widgetId}-chart.png`);
      this.toastService.showToast('Chart exported as PNG successfully!', 'success');
    }
  }

  resetZoom(widgetId: string) { // Reset chart zoom to default
    this.chartService.resetChartZoom(widgetId);
  }

  exportCSV() { // Export table data to CSV file
    const data = this.sortedSalesTable || [];
    if (data.length > 0) {
      this.exportService.exportToCSV(data, 'sales-data.csv');
      this.toastService.showToast('CSV exported successfully!', 'success');
    } else {
      this.toastService.showToast('No table data to export', 'error');
    }
  }

  exportDashboardPDF() { // Export entire dashboard to PDF with all data
    const chartCanvases: { [key: string]: HTMLCanvasElement } = {}; // Collect all chart canvases
    this.widgets.forEach(widget => {
      if (widget.id === 'mainLineChart' || widget.id === 'smallLineChart' || widget.id === 'barChart') {
        const canvas = document.getElementById(`${widget.id}-${widget.id}`) as HTMLCanvasElement;
        if (canvas) {
          chartCanvases[widget.title] = canvas;
        }
      }
    });

    const stats = { // Gather key statistics
      'Total Sales': this.filteredData.totalSales.value,
      'Sales Trend': `${this.filteredData.totalSales.trend > 0 ? '+' : ''}${this.filteredData.totalSales.trend}%`,
      'Conversion Rate': `${this.filteredData.performance.conversionRate}%`,
      'Avg Session': this.filteredData.performance.avgSession,
      'Bounce Rate': `${this.filteredData.performance.bounceRate}%`,
      'Total Visitors': this.filteredData.analytics.totalVisitors.toString(),
      'Visitor Trend': `${this.filteredData.analytics.trend > 0 ? '+' : ''}${this.filteredData.analytics.trend}%`
    };

    this.exportService.exportDashboardReport(
      stats,
      this.filteredData.salesTable,
      chartCanvases,
      'dashboard-report.pdf'
    );
    this.toastService.showToast('Dashboard PDF exported successfully!', 'success');
  }

  private sizeOrder: Array<'small' | 'medium' | 'large' | 'x-large'> = ['small','medium','large','x-large']; // Size progression order

  onResizeStart(widgetId: string, axis: 'vertical' | 'horizontal', event: MouseEvent) { // Handle drag-based widget resizing
    event.preventDefault();
    event.stopPropagation();

    const widget = this.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const startIndex = this.sizeOrder.indexOf(widget.size);
    const startX = event.clientX;
    const startY = event.clientY;

    const move = (e: MouseEvent) => {
      // Live preview could be added here
    };
    const up = (e: MouseEvent) => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);

      const delta = axis === 'vertical' ? (e.clientY - startY) : (e.clientX - startX);
      const threshold = 50; // Pixels per size step
      const steps = Math.floor(Math.abs(delta) / threshold);
      if (steps === 0) return;

      const direction = delta > 0 ? 1 : -1; // Drag down/right = grow, up/left = shrink
      let newIndex = startIndex + (direction * steps);
      if (newIndex < 0) newIndex = 0;
      if (newIndex > this.sizeOrder.length - 1) newIndex = this.sizeOrder.length - 1;

      const newSize = this.sizeOrder[newIndex];
      if (newSize !== widget.size) {
        widget.size = newSize;
        const cfg = this.widgetConfigService.getSizeConfig(newSize);
        widget.colSpan = cfg.colSpan;
        widget.rowSpan = cfg.rowSpan;
        this.cdr.detectChanges();
        this.autoSaveLayout();
        setTimeout(() => this.chartService.renderChartById(widgetId, this.globalFilters.timeRange, this.globalFilters.dataset), 100);
      }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }
}