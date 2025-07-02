import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface PDFImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (data: any) => void;
}

interface ExtractedData {
  wr_number: string;
  received_date: string;
  received_by: string;
  shipper_name: string;
  shipper_address: string;
  consignee_name: string;
  consignee_address: string;
  carrier_name: string;
  driver_name: string;
  tracking_number: string;
  total_pieces: number;
  total_weight_lb: number;
  total_volume_ft3: number;
  cargo_description: string;
  package_type: string;
  dimensions_length: number;
  dimensions_width: number;
  dimensions_height: number;
  warehouse_location_code: string;
  status: string;
  po_number: string;
  notes: string;
}

export const PDFImportModal: React.FC<PDFImportModalProps> = ({
  open,
  onOpenChange,
  onImportComplete
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setUploadedFile(pdfFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const processWithAI = async (pdfFile: File): Promise<ExtractedData> => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    const response = await fetch('/api/warehouse/process-pdf', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to process PDF');
    }

    const result = await response.json();
    return result.extractedData;
  };

  const saveToDatabaseWithValidation = async (data: ExtractedData) => {
    const response = await fetch('/api/warehouse/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save warehouse receipt');
    }

    return response.json();
  };

  const handleProcessPDF = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Extract data using AI
      const extractedData = await processWithAI(uploadedFile);
      setExtractedData(extractedData);

      // Save to database
      await saveToDatabaseWithValidation(extractedData);
      
      setSuccess(true);
      
      if (onImportComplete) {
        onImportComplete(extractedData);
      }

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setIsProcessing(false);
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">📄 Import Warehouse Receipt (PDF)</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadedFile && !success && (
            <>
              <p className="text-gray-600 mb-6">
                Upload a PDF warehouse receipt to automatically extract and import all data fields:
                WR number, tracking number, shipper/consignee information, cargo details, and more.
              </p>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your PDF file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-gray-500">Supports PDF files up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </>
          )}

          {uploadedFile && !success && !isProcessing && (
            <div className="space-y-6">
              {/* File Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Process Button */}
              <div className="flex space-x-3">
                <button
                  onClick={handleProcessPDF}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  🤖 Extract Data with AI
                </button>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing PDF...</h3>
              <p className="text-gray-600">
                AI is extracting warehouse receipt data. This may take a few moments.
              </p>
            </div>
          )}

          {success && extractedData && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">✅ Import Successful!</h3>
              <p className="text-gray-600 mb-4">
                Warehouse Receipt #{extractedData.wr_number} has been imported successfully.
              </p>
              
              {/* Extracted Data Summary */}
              <div className="bg-green-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <h4 className="font-medium text-green-900 mb-2">Extracted Data:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• WR Number: {extractedData.wr_number}</li>
                  <li>• Tracking: {extractedData.tracking_number}</li>
                  <li>• Shipper: {extractedData.shipper_name}</li>
                  <li>• Consignee: {extractedData.consignee_name}</li>
                  <li>• Pieces: {extractedData.total_pieces}</li>
                  <li>• Weight: {extractedData.total_weight_lb} lbs</li>
                  <li>• Volume: {extractedData.total_volume_ft3} ft³</li>
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};