import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(data: any[], filename: string = 'export.csv'): void { // Export array of objects to CSV file
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]); // Extract column names from first row
    
    let csvContent = headers.join(',') + '\n'; // Build CSV header row
    
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header]?.toString() || '';
        if (value.includes(',') || value.includes('"')) { // Escape special characters
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Create file blob
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click(); // Trigger download
    document.body.removeChild(link);
  }

  exportTableToPDF(data: any[], title: string = 'Table Export', filename: string = 'export.pdf'): void { // Convert table data to PDF document
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 14, 15); // Add title at top
    
    const headers = Object.keys(data[0]); // Get column headers
    const rows = data.map(row => headers.map(header => row[header]?.toString() || ''));

    autoTable(doc, { // Generate table with styling
      head: [headers],
      body: rows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [109, 40, 217] }, // Purple header color
    });

    doc.save(filename);
  }

  exportChartToPDF(chartCanvas: HTMLCanvasElement, title: string = 'Chart Export', filename: string = 'chart.pdf'): void { // Save chart as PDF
    if (!chartCanvas) {
      console.warn('No chart canvas found');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 14, 15); // Add title

    const imgData = chartCanvas.toDataURL('image/png'); // Convert canvas to image
    
    const imgWidth = 180; // Calculate dimensions for A4 page
    const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
    
    doc.addImage(imgData, 'PNG', 15, 25, imgWidth, imgHeight);
    doc.save(filename);
  }

  exportChartAsPNG(chartCanvas: HTMLCanvasElement, filename: string = 'chart.png'): void { // Save chart as PNG image
    if (!chartCanvas) {
      console.warn('No chart canvas found');
      return;
    }

    chartCanvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click(); // Trigger download
        document.body.removeChild(link);
      }
    });
  }

  exportDashboardReport( // Create comprehensive PDF report with stats, charts, and table
    stats: any,
    tableData: any[],
    chartCanvases: { [key: string]: HTMLCanvasElement },
    filename: string = 'dashboard-report.pdf'
  ): void {
    const doc = new jsPDF();
    let yPosition = 15;

    doc.setFontSize(18);
    doc.text('Dashboard Report', 14, yPosition); // Main title
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition); // Timestamp
    yPosition += 15;

    // Add stats if available
    if (stats) {
      doc.setFontSize(14);
      doc.text('Key Metrics', 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    Object.entries(stats).forEach(([key, value]) => { // Add each stat line
      doc.text(`${key}: ${value}`, 14, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  if (chartCanvases && Object.keys(chartCanvases).length > 0) { // Add all charts to PDF
    Object.entries(chartCanvases).forEach(([name, canvas], index) => {
      if (index > 0) {
        doc.addPage(); // New page for each chart
        yPosition = 15;
      }

      doc.setFontSize(14);
      doc.text(name, 14, yPosition); // Chart title
      yPosition += 10;

      const imgData = canvas.toDataURL('image/png'); // Convert to image
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (yPosition + imgHeight > 280) { // Check if space available
        doc.addPage();
        yPosition = 15;
      }

      doc.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    });
  }

  if (tableData && tableData.length > 0) { // Add data table section
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Data Table', 14, 15);

    const headers = Object.keys(tableData[0]);
    const rows = tableData.map(row => headers.map(header => row[header]?.toString() || ''));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [109, 40, 217] },
    });
  }

  doc.save(filename);
}
}
