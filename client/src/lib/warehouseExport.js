// Warehouse Performance Report Export Service
import { warehouseService } from './warehouseService';

export const warehouseExportService = {
  // Export warehouse receipts to CSV
  async exportReceiptsToCSV(userId, filters = {}) {
    try {
      const receipts = await warehouseService.getReceipts(userId, null, filters.locationId, filters.status);
      const stats = await warehouseService.getDashboardStats(userId);
      
      const csvData = this.convertReceiptsToCSV(receipts, stats);
      this.downloadCSV(csvData, `warehouse-receipts-${new Date().toISOString().split('T')[0]}.csv`);
      
      return { success: true, recordCount: receipts.length };
    } catch (error) {
      console.error('Error exporting receipts:', error);
      throw error;
    }
  },

  // Export performance summary report
  async exportPerformanceReport(userId) {
    try {
      const [stats, receipts, locations] = await Promise.all([
        warehouseService.getDashboardStats(userId),
        warehouseService.getReceipts(userId),
        warehouseService.getReceiptsByLocation(userId)
      ]);

      const reportData = this.generatePerformanceReport(stats, receipts, locations);
      this.downloadCSV(reportData, `warehouse-performance-${new Date().toISOString().split('T')[0]}.csv`);
      
      return { success: true, stats };
    } catch (error) {
      console.error('Error exporting performance report:', error);
      throw error;
    }
  },

  // Convert warehouse receipts to CSV format
  convertReceiptsToCSV(receipts, stats) {
    const headers = [
      'WR Number',
      'Tracking Number', 
      'Status',
      'Shipper',
      'Consignee',
      'Pieces',
      'Weight (lbs)',
      'Volume (ft³)',
      'Volume (m³)',
      'Location',
      'Created Date',
      'Last Updated'
    ];

    const rows = receipts.map(receipt => [
      receipt.wr_number || '',
      receipt.tracking_number || '',
      receipt.status || '',
      receipt.shipper_name || '',
      receipt.consignee_name || '',
      receipt.total_pieces || 0,
      receipt.total_weight_lb || 0,
      receipt.total_volume_ft3 || 0,
      receipt.total_volume_m3 || (receipt.total_volume_ft3 * 0.0283168).toFixed(3),
      receipt.warehouse_location_name || '',
      receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : '',
      receipt.updated_at ? new Date(receipt.updated_at).toLocaleDateString() : ''
    ]);

    // Add summary row
    const summaryRow = [
      '--- SUMMARY ---',
      '',
      `Total: ${stats.total_receipts || 0}`,
      '',
      '',
      stats.total_pieces || 0,
      stats.total_weight || 0,
      stats.total_volume || 0,
      ((stats.total_volume || 0) * 0.0283168).toFixed(3),
      '',
      `Report Date: ${new Date().toLocaleDateString()}`,
      ''
    ];

    return this.arrayToCSV([headers, ...rows, summaryRow]);
  },

  // Generate performance report data
  generatePerformanceReport(stats, receipts, locations) {
    const headers = [
      'Metric',
      'Value',
      'Details'
    ];

    const performanceData = [
      ['Total Receipts', stats.total_receipts || 0, ''],
      ['Total Pieces', stats.total_pieces || 0, ''],
      ['Total Weight (lbs)', stats.total_weight || 0, ''],
      ['Total Volume (ft³)', stats.total_volume || 0, ''],
      ['Total Volume (m³)', ((stats.total_volume || 0) * 0.0283168).toFixed(3), ''],
      ['', '', ''],
      ['--- BY STATUS ---', '', ''],
    ];

    // Add status breakdown
    Object.entries(stats.by_status || {}).forEach(([status, count]) => {
      performanceData.push([status, count, `${((count / (stats.total_receipts || 1)) * 100).toFixed(1)}%`]);
    });

    performanceData.push(['', '', '']);
    performanceData.push(['--- BY LOCATION ---', '', '']);

    // Add location breakdown
    Object.entries(stats.by_location || {}).forEach(([location, count]) => {
      performanceData.push([location, count, `${((count / (stats.total_receipts || 1)) * 100).toFixed(1)}%`]);
    });

    // Add recent activity summary
    performanceData.push(['', '', '']);
    performanceData.push(['--- RECENT ACTIVITY ---', '', '']);
    
    const recentCount = (stats.recent_activity || []).length;
    performanceData.push(['Recent Receipts (Last 7 days)', recentCount, '']);

    performanceData.push(['', '', '']);
    performanceData.push(['Report Generated', new Date().toLocaleString(), '']);

    return this.arrayToCSV([headers, ...performanceData]);
  },

  // Convert array data to CSV string
  arrayToCSV(data) {
    return data.map(row => 
      row.map(field => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const fieldStr = String(field);
        if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
          return `"${fieldStr.replace(/"/g, '""')}"`;
        }
        return fieldStr;
      }).join(',')
    ).join('\n');
  },

  // Download CSV file
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },

  // Export to JSON format
  async exportToJSON(userId, type = 'receipts') {
    try {
      let data;
      let filename;

      if (type === 'performance') {
        const [stats, receipts, locations] = await Promise.all([
          warehouseService.getDashboardStats(userId),
          warehouseService.getReceipts(userId),
          warehouseService.getReceiptsByLocation(userId)
        ]);
        
        data = {
          exportType: 'warehouse_performance_report',
          generatedAt: new Date().toISOString(),
          summary: stats,
          receipts: receipts,
          locationBreakdown: locations
        };
        filename = `warehouse-performance-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        data = await warehouseService.getReceipts(userId);
        filename = `warehouse-receipts-${new Date().toISOString().split('T')[0]}.json`;
      }

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw error;
    }
  }
};