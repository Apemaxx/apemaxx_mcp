// src/components/ProfessionalWarehouseManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Download, FileText, 
  MapPin, Calendar, Truck, Plane, Ship, CheckCircle2, 
  Clock, AlertCircle, Edit3, Eye, Upload, X, Building,
  Users, Archive, Settings
} from 'lucide-react';
import { warehouseService } from '../lib/warehouseService';

const ProfessionalWarehouseManager = ({ userId }) => {
  const [receipts, setReceipts] = useState([]);
  const [groupedReceipts, setGroupedReceipts] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'location', 'list', 'cards'
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [locations, setLocations] = useState([]);
  const [addressBook, setAddressBook] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsData, locationsData, addressBookData] = await Promise.all([
        warehouseService.getDashboardStats(userId),
        warehouseService.getWarehouseLocations(),
        warehouseService.getAddressBook(userId)
      ]);
      
      setStats(statsData);
      setLocations(locationsData);
      setAddressBook(addressBookData);
      
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

  const StatusIcon = ({ status }) => {
    const icons = {
      'received_on_hand': Package,
      'released_by_air': Plane,
      'released_by_ocean': Ship,
      'shipped': Truck
    };
    const Icon = icons[status] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const StatusBadge = ({ status }) => {
    const colorClass = warehouseService.getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass} flex items-center space-x-1`}>
        <StatusIcon status={status} />
        <span>{warehouseService.formatStatus(status)}</span>
      </span>
    );
  };

  const WarehouseReceiptCard = ({ receipt, compact = false }) => {
    if (compact) {
      return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg text-blue-600">{receipt.wr_number || receipt.receipt_number}</h3>
              <p className="text-sm text-gray-600">{new Date(receipt.received_date).toLocaleDateString()}</p>
            </div>
            <StatusBadge status={receipt.status} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Shipper:</p>
              <p className="text-gray-600 truncate">{receipt.shipper_name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Consignee:</p>
              <p className="text-gray-600 truncate">{receipt.consignee_name}</p>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-sm">
            <div className="flex space-x-4">
              <span className="text-gray-600">{receipt.total_pieces} pcs</span>
              <span className="text-gray-600">{receipt.total_weight_lb || receipt.total_weight_lbs} lbs</span>
              {(receipt.total_volume_ft3 || receipt.total_volume_cbf) && (
                <span className="text-gray-600">{receipt.total_volume_ft3 || receipt.total_volume_cbf} ft³</span>
              )}
            </div>
            <button
              onClick={() => setSelectedReceipt(receipt)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      );
    }

    // Full PDF-style receipt display
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 mb-6">
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">WAREHOUSE RECEIPT</h1>
              <p className="text-sm text-gray-600 mt-1">Professional warehouse management system</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 p-3 rounded-lg border">
                <h2 className="text-xl font-bold text-blue-800">{receipt.wr_number || receipt.receipt_number}</h2>
                <p className="text-sm text-gray-600">{new Date(receipt.received_date).toLocaleDateString()} {new Date(receipt.received_date).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Received by:</p>
              <p className="font-medium">{receipt.received_by}</p>
            </div>
            <StatusBadge status={receipt.status} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Shipper Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">SHIPPER</h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{receipt.shipper_name}</p>
              {receipt.shipper_address && (
                <p className="text-sm text-gray-600">{receipt.shipper_address}</p>
              )}
            </div>
          </div>

          {/* Consignee Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">CONSIGNEE</h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{receipt.consignee_name}</p>
              {receipt.consignee_address && (
                <p className="text-sm text-gray-600">{receipt.consignee_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Transportation & Reference Info */}
        <div className="grid grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">CARRIER & TRACKING</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Carrier:</span> {receipt.carrier_name}</p>
              {receipt.driver_name && <p><span className="text-gray-600">Driver:</span> {receipt.driver_name}</p>}
              <p><span className="text-gray-600">Tracking #:</span> {receipt.tracking_number}</p>
              {receipt.pro_number && <p><span className="text-gray-600">PRO #:</span> {receipt.pro_number}</p>}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">REFERENCE NUMBERS</h4>
            <div className="space-y-1 text-sm">
              {receipt.booking_reference && <p><span className="text-gray-600">Booking:</span> {receipt.booking_reference}</p>}
              {receipt.shipment_id && <p><span className="text-gray-600">Shipment ID:</span> {receipt.shipment_id}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">LOCATION</h4>
            <div className="space-y-1 text-sm">
              <p className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {receipt.warehouse_location_name || receipt.warehouse_location || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Cargo Details Table */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">CARGO DETAILS</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Pcs</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Package</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Dimensions</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Description</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Weight</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Volume</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{receipt.total_pieces}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{receipt.package_type || 'Package'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {receipt.dimensions_length && receipt.dimensions_width && receipt.dimensions_height 
                      ? `${receipt.dimensions_length}x${receipt.dimensions_width}x${receipt.dimensions_height}in`
                      : 'Not specified'
                    }
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{receipt.cargo_description}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    <div>{receipt.total_weight_lb || receipt.total_weight_lbs} lbs</div>
                    <div className="text-xs text-gray-500">{((receipt.total_weight_lb || receipt.total_weight_lbs) * 0.453592).toFixed(2)} kg</div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {(receipt.total_volume_ft3 || receipt.total_volume_cbf) && (
                      <div>
                        <div>{receipt.total_volume_ft3 || receipt.total_volume_cbf} ft³</div>
                        {receipt.total_volume_vlb && (
                          <div className="text-xs text-gray-500">{receipt.total_volume_vlb} VLB</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Created: {new Date(receipt.created_at || receipt.received_date).toLocaleString()}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleUpdateStatus(receipt.id, warehouseService.STATUSES.RELEASED_BY_AIR)}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium hover:bg-yellow-200"
            >
              Release Air
            </button>
            <button
              onClick={() => handleUpdateStatus(receipt.id, warehouseService.STATUSES.RELEASED_BY_OCEAN)}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium hover:bg-purple-200"
            >
              Release Ocean
            </button>
            <button
              onClick={() => handleUpdateStatus(receipt.id, warehouseService.STATUSES.SHIPPED)}
              className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium hover:bg-green-200"
            >
              Mark Shipped
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleUpdateStatus = async (receiptId, newStatus) => {
    try {
      await warehouseService.updateStatus(receiptId, newStatus);
      await loadReceipts();
      await loadInitialData(); // Refresh stats
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="w-8 h-8 mr-3 text-blue-600" />
              Professional Warehouse Management
            </h1>
            <p className="text-gray-600 mt-2">Manage warehouse receipts and inventory operations</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Receipt</span>
          </button>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.total_receipts || 0}</p>
                <p className="text-sm text-gray-600 font-medium">Total Receipts</p>
              </div>
              <Package className="w-12 h-12 text-blue-600 opacity-60" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.by_status?.received_on_hand || 0}</p>
                <p className="text-sm text-gray-600 font-medium">On Hand</p>
              </div>
              <Archive className="w-12 h-12 text-green-600 opacity-60" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-600">
                  {((stats.by_status?.released_by_air || 0) + (stats.by_status?.released_by_ocean || 0))}
                </p>
                <p className="text-sm text-gray-600 font-medium">Released</p>
              </div>
              <div className="flex space-x-1">
                <Plane className="w-6 h-6 text-orange-600 opacity-60" />
                <Ship className="w-6 h-6 text-orange-600 opacity-60" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">{stats.by_status?.shipped || 0}</p>
                <p className="text-sm text-gray-600 font-medium">Shipped</p>
              </div>
              <Truck className="w-12 h-12 text-purple-600 opacity-60" />
            </div>
          </div>
        </div>

        {/* Volume & Weight Summary */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-800">{Math.round(stats.total_pieces || 0)}</p>
            <p className="text-sm text-gray-600">Total Pieces</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-800">{Math.round(stats.total_weight || 0)}</p>
            <p className="text-sm text-gray-600">Total Weight (lbs)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-800">{Math.round(stats.total_volume || 0)}</p>
            <p className="text-sm text-gray-600">Total Volume (ft³)</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="received_on_hand">Received On Hand</option>
                <option value="released_by_air">Released by Air</option>
                <option value="released_by_ocean">Released by Ocean</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-md ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode('location')}
                className={`px-4 py-2 rounded-md ${viewMode === 'location' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Location View
              </button>
            </div>
          </div>
        </div>

        {/* Receipts Display */}
        <div className="space-y-6">
          {viewMode === 'location' ? (
            Object.entries(groupedReceipts).map(([location, locationReceipts]) => (
              <div key={location} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    {location} ({locationReceipts.length})
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationReceipts.map((receipt) => (
                    <WarehouseReceiptCard key={receipt.id} receipt={receipt} compact={true} />
                  ))}
                </div>
              </div>
            ))
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {receipts.map((receipt) => (
                <WarehouseReceiptCard key={receipt.id} receipt={receipt} compact={true} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {receipts.map((receipt) => (
                <WarehouseReceiptCard key={receipt.id} receipt={receipt} compact={false} />
              ))}
            </div>
          )}

          {receipts.length === 0 && !loading && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouse receipts found</h3>
              <p className="text-gray-600 mb-6">Create your first professional warehouse receipt to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create First Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWarehouseManager;