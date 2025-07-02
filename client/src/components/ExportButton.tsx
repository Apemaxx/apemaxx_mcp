// Export Button Component for Warehouse Reports
import React, { useState } from 'react';
import { Download, FileText, Table, Database, CheckCircle } from 'lucide-react';
import { warehouseExportService } from '../lib/warehouseExport';

interface ExportButtonProps {
  userId: string;
  variant?: 'receipts' | 'performance';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  userId, 
  variant = 'receipts',
  size = 'md',
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (format: 'csv' | 'json', type: 'receipts' | 'performance') => {
    try {
      setIsExporting(true);
      setShowDropdown(false);

      let result;
      if (format === 'csv') {
        if (type === 'performance') {
          result = await warehouseExportService.exportPerformanceReport(userId);
        } else {
          result = await warehouseExportService.exportReceiptsToCSV(userId);
        }
      } else {
        result = await warehouseExportService.exportToJSON(userId, type);
      }

      if (result.success) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (exportSuccess) {
    return (
      <button
        className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-green-600 text-white rounded-lg font-medium transition-colors ${className}`}
        disabled
      >
        <CheckCircle className={iconSizes[size]} />
        Exported!
      </button>
    );
  }

  if (isExporting) {
    return (
      <button
        className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-blue-600 text-white rounded-lg font-medium opacity-75 cursor-not-allowed ${className}`}
        disabled
      >
        <div className={`${iconSizes[size]} animate-spin border-2 border-white border-t-transparent rounded-full`}></div>
        Exporting...
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${className}`}
      >
        <Download className={iconSizes[size]} />
        Export Report
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
              {variant === 'performance' ? 'Performance Reports' : 'Warehouse Receipts'}
            </div>
            
            {/* CSV Options */}
            <button
              onClick={() => handleExport('csv', variant)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Table className="w-4 h-4 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-gray-500">Excel-compatible spreadsheet</div>
              </div>
            </button>

            {/* JSON Options */}
            <button
              onClick={() => handleExport('json', variant)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Database className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-gray-500">Structured data format</div>
              </div>
            </button>

            {/* Performance Report specific option */}
            {variant === 'receipts' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                <button
                  onClick={() => handleExport('csv', 'performance')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <FileText className="w-4 h-4 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Performance Summary</div>
                    <div className="text-xs text-gray-500">Analytics & KPIs</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default ExportButton;