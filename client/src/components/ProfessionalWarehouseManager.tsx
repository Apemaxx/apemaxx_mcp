// client/src/components/ProfessionalWarehouseManager.tsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Download, FileText, 
  MapPin, Calendar, Truck, Plane, Ship, CheckCircle2, 
  Clock, AlertCircle, Edit3, Eye, Upload, X, Building,
  Users, Archive, Settings
} from 'lucide-react';
import { warehouseService } from '../lib/warehouseService';

interface ProfessionalWarehouseManagerProps {
  userId: string;
}

const ProfessionalWarehouseManager: React.FC<ProfessionalWarehouseManagerProps> = ({ userId }) => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [groupedReceipts, setGroupedReceipts] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('location'); // 'location', 'list', 'cards'
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [addressBook, setAddressBook] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsData] = await Promise.all([
        warehouseService.getDashboardStats(userId)
      ]);
      
      setStats(statsData);
      await loadReceipts();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReceipts = async () => {
    try {
      if (viewMode === 'location') {
        const grouped = await warehouseService.getReceiptsByLocation(userId);
        setGroupedReceipts(grouped);
      } else {
        const receiptsList = await warehouseService.getReceipts(
          userId, 
          50, 
          selectedLocation !== 'all' ? selectedLocation : null,
          selectedStatus !== 'all' ? selectedStatus : null
        );
        setReceipts(receiptsList);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [viewMode, selectedLocation, selectedStatus]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadReceipts();
      return;
    }
    try {
      const results = await warehouseService.searchReceipts(userId, searchTerm);
      setReceipts(results);
      setViewMode('list');
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
    const icons = {
      'received_on_hand': Package,
      'released_by_air': Plane,
      'released_by_ocean': Ship,
      'shipped': Truck
    };
    const Icon = icons[status as keyof typeof icons] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorClass = warehouseService.getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass} flex items-center space-x-1`}>
        <StatusIcon status={status} />
        <span>{warehouseService.formatStatus(status)}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white rounded-lg"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-white rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                Professional Warehouse Management
              </h1>
              <p className="text-gray-600 mt-1">Manage warehouse receipts with professional tracking</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>New Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.total_receipts || 0}</p>
                <p className="text-sm text-gray-600 font-medium">Total Receipts</p>
              </div>
              <Package className="w-10 h-10 text-blue-600 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.by_status?.received_on_hand || 0}</p>
                <p className="text-sm text-gray-600 font-medium">On Hand (Blue)</p>
              </div>
              <Archive className="w-10 h-10 text-green-600 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">
                  {((stats.by_status?.released_by_air || 0) + (stats.by_status?.released_by_ocean || 0))}
                </p>
                <p className="text-sm text-gray-600 font-medium">Released (Yellow)</p>
              </div>
              <div className="flex space-x-1">
                <Plane className="w-5 h-5 text-yellow-600 opacity-80" />
                <Ship className="w-5 h-5 text-yellow-600 opacity-80" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">{stats.by_status?.shipped || 0}</p>
                <p className="text-sm text-gray-600 font-medium">Shipped (Green)</p>
              </div>
              <Truck className="w-10 h-10 text-purple-600 opacity-80" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search WR, AWB, Shipper, Consignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="location">By Location</option>
              <option value="list">List View</option>
              <option value="cards">Card View</option>
            </select>
          </div>
        </div>

        {/* Location-based View */}
        {viewMode === 'location' && (
          <div className="space-y-6">
            {Object.entries(groupedReceipts).map(([location, locationReceipts]) => (
              <div key={location} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      {location}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {(locationReceipts as any[]).length} receipts
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(locationReceipts as any[]).map((receipt) => (
                      <div
                        key={receipt.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-blue-600 text-lg">
                              {receipt.receipt_number || receipt.wr_number}
                            </h4>
                            <p className="text-sm text-gray-600">{receipt.tracking_number}</p>
                          </div>
                          <StatusBadge status={receipt.status} />
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">From:</span>
                            <p className="text-gray-600 truncate">{receipt.shipper_name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">To:</span>
                            <p className="text-gray-600 truncate">{receipt.consignee_name}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-gray-600">
                              {receipt.total_pieces} pcs • {receipt.total_weight_lb} lbs
                            </span>
                            {receipt.total_volume_ft3 && (
                              <span className="text-xs text-gray-500">
                                {Math.round(receipt.total_volume_ft3)} ft³ • {Math.round(receipt.total_volume_ft3 * 0.0283168)} m³
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List/Cards View */}
        {(viewMode === 'list' || viewMode === 'cards') && receipts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouse receipts found</h3>
            <p className="text-gray-600 mb-6">Create your first professional warehouse receipt to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create Receipt</span>
            </button>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && receipts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WR Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipper
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pieces/Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-blue-600">{receipt.receipt_number || receipt.wr_number}</div>
                        <div className="text-sm text-gray-500">{receipt.tracking_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={receipt.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {receipt.shipper_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {receipt.consignee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {receipt.total_pieces} pcs<br />
                        <span className="text-gray-500">{receipt.total_weight_lb} lbs</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {receipt.total_volume_ft3 ? (
                          <>
                            {Math.round(receipt.total_volume_ft3)} ft³<br />
                            <span className="text-gray-500">{Math.round(receipt.total_volume_ft3 * 0.0283168)} m³</span>
                          </>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(receipt.received_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Warehouse Receipt Details</h3>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 text-xl">
                    {selectedReceipt.receipt_number || selectedReceipt.wr_number}
                  </h4>
                  <p className="text-blue-600">Tracking: {selectedReceipt.tracking_number}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">SHIPPER</h5>
                    <p className="text-gray-700">{selectedReceipt.shipper_name}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">CONSIGNEE</h5>
                    <p className="text-gray-700">{selectedReceipt.consignee_name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{selectedReceipt.total_pieces}</p>
                    <p className="text-sm text-gray-600">Pieces</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{selectedReceipt.total_weight_lb}</p>
                    <p className="text-sm text-gray-600">Weight (lbs)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedReceipt.total_volume_ft3 ? Math.round(selectedReceipt.total_volume_ft3) : '-'}
                    </p>
                    <p className="text-sm text-gray-600">Volume (ft³)</p>
                    {selectedReceipt.total_volume_ft3 && (
                      <p className="text-xs text-gray-500">
                        {Math.round(selectedReceipt.total_volume_ft3 * 0.0283168)} m³
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <StatusBadge status={selectedReceipt.status} />
                  <div className="space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Edit Status
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalWarehouseManager;