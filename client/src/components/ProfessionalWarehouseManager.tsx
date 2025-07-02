import React, { useState, useEffect, useCallback } from 'react';
import { warehouseService, WarehouseReceipt, WarehouseStats } from '../lib/warehouseService';

interface ProfessionalWarehouseManagerProps {
  userId?: string;
}

interface FormData {
  receivedBy: string;
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  carrierName: string;
  driverName: string;
  trackingNumber: string;
  totalPieces: string;
  totalWeightLb: string;
  cargoDescription: string;
  status: string;
  warehouseLocationId: string;
  dimensionsLength: string;
  dimensionsWidth: string;
  dimensionsHeight: string;
  packageType: string;
}

interface FileAttachment {
  file_name: string;
  created_at: string;
}

const ProfessionalWarehouseManager: React.FC<ProfessionalWarehouseManagerProps> = ({ userId }) => {
  const [receipts, setReceipts] = useState<WarehouseReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<WarehouseStats>({
    total_receipts: 0,
    by_status: {},
    by_location: {},
    total_pieces: 0,
    total_weight: 0,
    total_volume: 0,
    recent_activity: []
  });

  const [warehouseLocations] = useState([
    { id: 'MIA', location_code: 'MIA', location_name: 'Miami Warehouse' },
    { id: 'LAX', location_code: 'LAX', location_name: 'Los Angeles Warehouse' },
    { id: 'JFK', location_code: 'JFK', location_name: 'New York Warehouse' },
    { id: 'ORD', location_code: 'ORD', location_name: 'Chicago Warehouse' }
  ]);

  const statusOptions = [
    { value: 'received_on_hand', label: 'Received On Hand', icon: '🟦' },
    { value: 'released_by_air', label: 'Released by Air', icon: '🟨' },
    { value: 'released_by_ocean', label: 'Released by Ocean', icon: '🟨' },
    { value: 'shipped', label: 'Shipped', icon: '🟩' }
  ];

  useEffect(() => {
    loadWarehouseData();
  }, []);

  const loadWarehouseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [receiptsData, statsData] = await Promise.all([
        warehouseService.getWarehouseReceipts(),
        warehouseService.getWarehouseDashboardStats()
      ]);
      
      setReceipts(receiptsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load warehouse data:', err);
      setError('Failed to load warehouse data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = !searchTerm || 
      receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.shipper_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.consignee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || receipt.warehouse_location_id === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleCreateReceipt = async (formData: FormData) => {
    try {
      setUploading(true);
      setError(null);
      
      const receiptData = {
        received_by: formData.receivedBy,
        shipper_name: formData.shipperName,
        shipper_address: formData.shipperAddress,
        consignee_name: formData.consigneeName,
        consignee_address: formData.consigneeAddress,
        carrier_name: formData.carrierName,
        driver_name: formData.driverName,
        tracking_number: formData.trackingNumber,
        total_pieces: parseInt(formData.totalPieces),
        total_weight_lb: parseFloat(formData.totalWeightLb),
        cargo_description: formData.cargoDescription,
        status: formData.status,
        warehouse_location_id: formData.warehouseLocationId,
        package_type: formData.packageType,
        // Calculate volume from dimensions
        total_volume_ft3: formData.dimensionsLength && formData.dimensionsWidth && formData.dimensionsHeight
          ? (parseFloat(formData.dimensionsLength) * parseFloat(formData.dimensionsWidth) * parseFloat(formData.dimensionsHeight)) / 1728
          : 0
      };

      await warehouseService.createWarehouseReceipt(receiptData);
      await loadWarehouseData();
      setActiveView('dashboard');
    } catch (err) {
      console.error('Failed to create receipt:', err);
      setError('Failed to create receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (receiptId: string, newStatus: string) => {
    try {
      await warehouseService.updateWarehouseReceipt(receiptId, { status: newStatus });
      await loadWarehouseData();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const AnalyticsDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Total Receipts</p>
            <p className="text-3xl font-bold">{stats.total_receipts}</p>
          </div>
          <div className="text-4xl opacity-80">📦</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">Total Pieces</p>
            <p className="text-3xl font-bold">{stats.total_pieces}</p>
          </div>
          <div className="text-4xl opacity-80">📊</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100">Total Weight</p>
            <p className="text-3xl font-bold">{warehouseService.formatWeight(stats.total_weight)} lbs</p>
          </div>
          <div className="text-4xl opacity-80">⚖️</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100">Total Volume</p>
            <p className="text-3xl font-bold">{warehouseService.formatVolume(stats.total_volume)} ft³</p>
          </div>
          <div className="text-4xl opacity-80">📏</div>
        </div>
      </div>
    </div>
  );

  const SearchAndFilters = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by WR#, tracking, shipper, consignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Locations</option>
            {warehouseLocations.map(location => (
              <option key={location.id} value={location.id}>
                {location.location_code}
              </option>
            ))}
          </select>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              🔳
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              📋
            </button>
          </div>


        </div>
      </div>
    </div>
  );

  const ReceiptCard = ({ receipt }: { receipt: WarehouseReceipt }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => {
           setSelectedReceipt(receipt.id);
           setActiveView('detail');
         }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{receipt.receipt_number}</h3>
          <p className="text-sm text-gray-600">
            {new Date(receipt.received_date).toLocaleDateString()}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${warehouseService.getStatusColor(receipt.status)}`}>
          {warehouseService.getStatusIcon(receipt.status)} {warehouseService.getStatusDisplay(receipt.status)}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Shipper:</span>
          <span className="text-sm font-medium text-gray-900 truncate ml-2">{receipt.shipper_name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Consignee:</span>
          <span className="text-sm font-medium text-gray-900 truncate ml-2">{receipt.consignee_name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tracking:</span>
          <span className="text-sm font-mono text-gray-900">{receipt.tracking_number || 'N/A'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-600">Pieces</p>
          <p className="text-lg font-bold text-gray-900">{receipt.total_pieces || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Weight</p>
          <p className="text-lg font-bold text-gray-900">{warehouseService.formatWeight(receipt.total_weight_lb)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Volume</p>
          <p className="text-lg font-bold text-gray-900">{warehouseService.formatVolume(receipt.total_volume_ft3)}</p>
        </div>
      </div>
    </div>
  );

  const DetailedReceiptView = () => {
    const receipt = receipts.find(r => r.id === selectedReceipt);
    const [attachments] = useState<FileAttachment[]>([]);

    if (!receipt) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Receipt not found</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* PDF-Style Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">WAREHOUSE RECEIPT</h1>
              <p className="text-blue-100">Professional Cargo Management System</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{receipt.receipt_number}</div>
              <div className="text-blue-100">
                {new Date(receipt.received_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Management */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <div className={`px-4 py-2 rounded-full ${warehouseService.getStatusColor(receipt.status)}`}>
                {warehouseService.getStatusIcon(receipt.status)} {warehouseService.getStatusDisplay(receipt.status)}
              </div>
            </div>
            <select
              value={receipt.status}
              onChange={(e) => handleUpdateStatus(receipt.id, e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shipper & Consignee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                📤 Shipper Information
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Company:</label>
                  <div className="text-sm text-gray-900">{receipt.shipper_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Address:</label>
                  <div className="text-sm text-gray-900">{receipt.shipper_address || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone:</label>
                  <div className="text-sm text-gray-900">{receipt.shipper_phone || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                📥 Consignee Information
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Company:</label>
                  <div className="text-sm text-gray-900">{receipt.consignee_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Address:</label>
                  <div className="text-sm text-gray-900">{receipt.consignee_address || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone:</label>
                  <div className="text-sm text-gray-900">{receipt.consignee_phone || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Carrier & Tracking Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              🚛 Carrier & Tracking Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Carrier:</label>
                <div className="text-sm text-gray-900">{receipt.carrier_name || 'N/A'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tracking #:</label>
                <div className="text-sm text-gray-900 font-mono">{receipt.tracking_number || 'N/A'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">PRO #:</label>
                <div className="text-sm text-gray-900 font-mono">{receipt.pro_number || 'N/A'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Driver:</label>
                <div className="text-sm text-gray-900">{receipt.driver_name || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              📦 Cargo Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieces</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (lbs)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (ft³)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.cargo_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.total_pieces || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouseService.formatWeight(receipt.total_weight_lb)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouseService.formatVolume(receipt.total_volume_ft3)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.package_type || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Location & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                📍 Warehouse Location
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Location:</label>
                  <div className="text-sm text-gray-900">{receipt.warehouse_location_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Code:</label>
                  <div className="text-sm text-gray-900">{receipt.warehouse_location_code || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Received By:</label>
                  <div className="text-sm text-gray-900">{receipt.received_by || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                📝 Additional Notes
              </h3>
              <div className="text-sm text-gray-900">
                {receipt.notes || 'No additional notes provided.'}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                📎 Attachments ({attachments.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {attachments.map((attachment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                    <div className="text-sm font-medium text-gray-900 truncate">{attachment.file_name}</div>
                    <div className="text-xs text-gray-500">{new Date(attachment.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CreateReceiptForm = () => {
    const [formData, setFormData] = useState({
      receivedBy: '',
      shipperName: '',
      shipperAddress: '',
      consigneeName: '',
      consigneeAddress: '',
      carrierName: '',
      driverName: '',
      trackingNumber: '',
      totalPieces: '',
      totalWeightLb: '',
      cargoDescription: 'GENERAL CARGO',
      status: 'received_on_hand',
      warehouseLocationId: '',
      dimensionsLength: '',
      dimensionsWidth: '',
      dimensionsHeight: '',
      packageType: 'Pallet'
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateReceipt(formData);
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Warehouse Receipt</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Received By</label>
              <input
                type="text"
                value={formData.receivedBy}
                onChange={(e) => setFormData({...formData, receivedBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Location</label>
              <select
                value={formData.warehouseLocationId}
                onChange={(e) => setFormData({...formData, warehouseLocationId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Location</option>
                {warehouseLocations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.location_code} - {location.location_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shipper Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipper Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipper Name</label>
                <input
                  type="text"
                  value={formData.shipperName}
                  onChange={(e) => setFormData({...formData, shipperName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipper Address</label>
                <textarea
                  value={formData.shipperAddress}
                  onChange={(e) => setFormData({...formData, shipperAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Consignee Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consignee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consignee Name</label>
                <input
                  type="text"
                  value={formData.consigneeName}
                  onChange={(e) => setFormData({...formData, consigneeName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consignee Address</label>
                <textarea
                  value={formData.consigneeAddress}
                  onChange={(e) => setFormData({...formData, consigneeAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Carrier & Tracking */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Carrier & Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carrier Name</label>
                <input
                  type="text"
                  value={formData.carrierName}
                  onChange={(e) => setFormData({...formData, carrierName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cargo Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Pieces</label>
                <input
                  type="number"
                  value={formData.totalPieces}
                  onChange={(e) => setFormData({...formData, totalPieces: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalWeightLb}
                  onChange={(e) => setFormData({...formData, totalWeightLb: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                <select
                  value={formData.packageType}
                  onChange={(e) => setFormData({...formData, packageType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pallet">Pallet</option>
                  <option value="Box">Box</option>
                  <option value="Crate">Crate</option>
                  <option value="Bag">Bag</option>
                  <option value="Drum">Drum</option>
                  <option value="Bundle">Bundle</option>
                  <option value="Roll">Roll</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Length (inches)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensionsLength}
                  onChange={(e) => setFormData({...formData, dimensionsLength: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width (inches)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensionsWidth}
                  onChange={(e) => setFormData({...formData, dimensionsWidth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (inches)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensionsHeight}
                  onChange={(e) => setFormData({...formData, dimensionsHeight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Description</label>
              <input
                type="text"
                value={formData.cargoDescription}
                onChange={(e) => setFormData({...formData, cargoDescription: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {uploading ? 'Creating Receipt...' : 'Create Receipt'}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                🏭 Professional Warehouse Management
              </h1>
              <p className="text-gray-600">Comprehensive inventory tracking and management system</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium ${activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded-lg font-medium ${activeView === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                📋 All Receipts
              </button>
              <button
                onClick={() => setActiveView('create')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ➕ New Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'dashboard' && (
          <>
            <AnalyticsDashboard />
            <SearchAndFilters />
            
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReceipts.map(receipt => (
                  <ReceiptCard key={receipt.id} receipt={receipt} />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipper</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieces</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReceipts.map(receipt => (
                        <tr 
                          key={receipt.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedReceipt(receipt.id);
                            setActiveView('detail');
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.receipt_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(receipt.received_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.shipper_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${warehouseService.getStatusColor(receipt.status)}`}>
                              {warehouseService.getStatusIcon(receipt.status)} {warehouseService.getStatusDisplay(receipt.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.total_pieces}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouseService.formatWeight(receipt.total_weight_lb)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.warehouse_location_code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">All Warehouse Receipts</h2>
            </div>
            <SearchAndFilters />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipper</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieces</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReceipts.map(receipt => (
                    <tr 
                      key={receipt.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedReceipt(receipt.id);
                        setActiveView('detail');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{receipt.receipt_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(receipt.received_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.shipper_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.consignee_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${warehouseService.getStatusColor(receipt.status)}`}>
                          {warehouseService.getStatusIcon(receipt.status)} {warehouseService.getStatusDisplay(receipt.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.total_pieces}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouseService.formatWeight(receipt.total_weight_lb)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouseService.formatVolume(receipt.total_volume_ft3)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.warehouse_location_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'create' && <CreateReceiptForm />}

        {activeView === 'detail' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setActiveView('dashboard')}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                ← Back to Dashboard
              </button>
            </div>
            <DetailedReceiptView />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalWarehouseManager;