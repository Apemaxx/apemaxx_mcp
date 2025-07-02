// src/components/WarehouseReceiptManager.jsx
// Adapted for your existing database schema

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Eye, Upload, FileText, Truck, 
  AlertCircle, CheckCircle, Clock, Search, Filter,
  Download, Link as LinkIcon, X 
} from 'lucide-react';
import { warehouseService } from '../lib/warehouseService';

const WarehouseReceiptManager = ({ userId }) => {
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receiptsData, statsData] = await Promise.all([
        warehouseService.getReceipts(userId, 20),
        warehouseService.getDashboardStats(userId)
      ]);
      
      setReceipts(receiptsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading warehouse data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      const results = await warehouseService.searchReceipts(userId, searchTerm);
      setReceipts(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    try {
      if (status === 'all') {
        loadData();
      } else {
        const results = await warehouseService.getReceiptsByStatus(userId, status);
        setReceipts(results);
      }
    } catch (error) {
      console.error('Filter error:', error);
    }
  };

  const StatusIcon = ({ status }) => {
    const icons = {
      'Received on Hand': CheckCircle,
      'Shipped': Truck,
      'Release by Air': AlertCircle,
      'Release by Ocean': Package
    };
    const colors = {
      'Received on Hand': 'text-blue-600',
      'Shipped': 'text-green-600',
      'Release by Air': 'text-orange-600',
      'Release by Ocean': 'text-purple-600'
    };
    
    const Icon = icons[status] || Clock;
    return <Icon className={`w-4 h-4 ${colors[status] || 'text-gray-600'}`} />;
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      'Received on Hand': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-green-100 text-green-800', 
      'Release by Air': 'bg-orange-100 text-orange-800',
      'Release by Ocean': 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'UNKNOWN'}
      </span>
    );
  };

  const CreateReceiptModal = () => {
    const [formData, setFormData] = useState({
      tracking_number: '',
      carrier_name: '',
      driver_name: '',
      shipper_id: '',
      consignee_id: '',
      total_pieces: 0,
      total_weight_lbs: 0,
      total_volume_cbf: 0,
      cargo_description: 'GENERAL CARGO',
      received_by: '',
      warehouse_location: '',
      notes: ''
    });
    const [files, setFiles] = useState([]);
    const [creating, setCreating] = useState(false);
    const [addressBook, setAddressBook] = useState([]);
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [selectedConsignee, setSelectedConsignee] = useState(null);

    // Load address book when modal opens
    useEffect(() => {
      const loadAddressBook = async () => {
        try {
          const addressData = await warehouseService.getAddressBook(userId);
          setAddressBook(addressData);
        } catch (error) {
          console.error('Error loading address book:', error);
        }
      };
      
      if (userId) {
        loadAddressBook();
      }
    }, [userId]);

    const handleShipperChange = async (shipperId) => {
      setFormData({...formData, shipper_id: shipperId});
      if (shipperId) {
        const shipperData = await warehouseService.getAddressBookEntry(shipperId);
        setSelectedShipper(shipperData);
      } else {
        setSelectedShipper(null);
      }
    };

    const handleConsigneeChange = async (consigneeId) => {
      setFormData({...formData, consignee_id: consigneeId});
      if (consigneeId) {
        const consigneeData = await warehouseService.getAddressBookEntry(consigneeId);
        setSelectedConsignee(consigneeData);
      } else {
        setSelectedConsignee(null);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setCreating(true);
        await warehouseService.createReceipt({
          ...formData,
          user_id: userId
        }, files);
        
        setShowCreateForm(false);
        loadData();
        alert('Warehouse receipt created successfully!');
        
        // Reset form
        setFormData({
          tracking_number: '',
          carrier_name: '',
          driver_name: '',
          shipper_id: '',
          consignee_id: '',
          total_pieces: 0,
          total_weight_lbs: 0,
          total_volume_cbf: 0,
          cargo_description: 'GENERAL CARGO',
          received_by: '',
          warehouse_location: '',
          notes: ''
        });
        setFiles([]);
        setSelectedShipper(null);
        setSelectedConsignee(null);
      } catch (error) {
        console.error('Error creating receipt:', error);
        alert('Error creating receipt: ' + error.message);
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Create Warehouse Receipt</h3>
            <button 
              onClick={() => setShowCreateForm(false)} 
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier Name *
                </label>
                <input
                  type="text"
                  value={formData.carrier_name}
                  onChange={(e) => setFormData({...formData, carrier_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({...formData, driver_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received By *
                </label>
                <input
                  type="text"
                  value={formData.received_by}
                  onChange={(e) => setFormData({...formData, received_by: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Shipper/Consignee */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Shipper Information</h4>
                <div className="space-y-3">
                  <select
                    value={formData.shipper_id}
                    onChange={(e) => handleShipperChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Shipper</option>
                    {addressBook.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.company_name} - {entry.contact_name}
                      </option>
                    ))}
                  </select>
                  {selectedShipper && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <div><strong>{selectedShipper.company_name}</strong></div>
                      <div>{selectedShipper.address_line_1}</div>
                      {selectedShipper.address_line_2 && <div>{selectedShipper.address_line_2}</div>}
                      <div>{selectedShipper.city}, {selectedShipper.state} {selectedShipper.zip_code}</div>
                      {selectedShipper.country && <div>{selectedShipper.country}</div>}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Consignee Information</h4>
                <div className="space-y-3">
                  <select
                    value={formData.consignee_id}
                    onChange={(e) => handleConsigneeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Consignee</option>
                    {addressBook.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.company_name} - {entry.contact_name}
                      </option>
                    ))}
                  </select>
                  {selectedConsignee && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <div><strong>{selectedConsignee.company_name}</strong></div>
                      <div>{selectedConsignee.address_line_1}</div>
                      {selectedConsignee.address_line_2 && <div>{selectedConsignee.address_line_2}</div>}
                      <div>{selectedConsignee.city}, {selectedConsignee.state} {selectedConsignee.zip_code}</div>
                      {selectedConsignee.country && <div>{selectedConsignee.country}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cargo Details */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Pieces
                </label>
                <input
                  type="number"
                  value={formData.total_pieces}
                  onChange={(e) => setFormData({...formData, total_pieces: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_weight_lbs}
                  onChange={(e) => setFormData({...formData, total_weight_lbs: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Volume (ft³)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_volume_cbf}
                  onChange={(e) => setFormData({...formData, total_volume_cbf: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse Location
                </label>
                <input
                  type="text"
                  value={formData.warehouse_location}
                  onChange={(e) => setFormData({...formData, warehouse_location: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo Description
              </label>
              <textarea
                value={formData.cargo_description}
                onChange={(e) => setFormData({...formData, cargo_description: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-gray-600">Drag and drop files here, or click to select</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-4 text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Files:</h4>
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600 mt-1">Manage warehouse receipts and inventory</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Receipt
        </button>
      </div>

      {/* Stats Cards - 6 Card Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Total Receipts</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_receipts || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Active Receipts</p>
            <p className="text-xl font-bold text-gray-900">{stats.active_receipts || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Ready for Release</p>
            <p className="text-xl font-bold text-gray-900">{stats.ready_for_release || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Total Pieces</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_pieces || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <Truck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Total Weight</p>
            <p className="text-lg font-bold text-gray-900">{stats.total_weight || 0}</p>
            <p className="text-xs text-gray-500">lbs</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <Package className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Total Volume</p>
            <p className="text-lg font-bold text-gray-900">{stats.total_volume || 0}</p>
            <p className="text-xs text-gray-500">ft³</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by WR number, tracking number, carrier, or shipper..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Received on Hand">Received on Hand</option>
              <option value="Shipped">Shipped</option>
              <option value="Release by Air">Release by Air</option>
              <option value="Release by Ocean">Release by Ocean</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">Warehouse Receipts</h3>
        </div>
        
        {receipts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No warehouse receipts found</p>
            <p className="text-gray-400 mt-2">Create your first receipt to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <div 
                key={receipt.id} 
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedReceipt(receipt)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-bold text-blue-600">
                        {receipt.wr_number || receipt.receipt_number || `WR-${receipt.id}`}
                      </h4>
                      <StatusBadge status={receipt.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Carrier:</span> {receipt.carrier_name}
                      </div>
                      <div>
                        <span className="font-medium">Shipper:</span> {receipt.shipper_name}
                      </div>
                      <div>
                        <span className="font-medium">Pieces:</span> {receipt.total_pieces}
                      </div>
                      <div>
                        <span className="font-medium">Weight:</span> {receipt.total_weight_lb || receipt.total_weight_lbs} lbs
                      </div>
                      <div>
                        <span className="font-medium">Volume:</span> {receipt.total_volume_cbf || 0} ft³
                      </div>
                      <div>
                        <span className="font-medium">Received:</span> {new Date(receipt.received_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Tracking:</span> {receipt.tracking_number}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <StatusIcon status={receipt.status} />
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Receipt Modal */}
      {showCreateForm && <CreateReceiptModal />}
      
      {/* Receipt Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Receipt Details: <span className="text-blue-600 font-bold">{selectedReceipt.wr_number || selectedReceipt.receipt_number || `WR-${selectedReceipt.id}`}</span></h3>
              <button 
                onClick={() => setSelectedReceipt(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Tracking Number:</span> {selectedReceipt.tracking_number}</div>
                    <div><span className="font-medium">Carrier:</span> {selectedReceipt.carrier_name}</div>
                    <div><span className="font-medium">Driver:</span> {selectedReceipt.driver_name}</div>
                    <div><span className="font-medium">Received By:</span> {selectedReceipt.received_by}</div>
                    <div><span className="font-medium">Status:</span> <StatusBadge status={selectedReceipt.status} /></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cargo Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Total Pieces:</span> {selectedReceipt.total_pieces}</div>
                    <div><span className="font-medium">Total Weight:</span> {selectedReceipt.total_weight_lb || selectedReceipt.total_weight_lbs} lbs</div>
                    <div><span className="font-medium">Description:</span> {selectedReceipt.cargo_description}</div>
                    <div><span className="font-medium">Warehouse Location:</span> {selectedReceipt.warehouse_location}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Shipper</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedReceipt.shipper_name}</div>
                    <div><span className="font-medium">Address:</span> {selectedReceipt.shipper_address}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Consignee</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedReceipt.consignee_name}</div>
                    <div><span className="font-medium">Address:</span> {selectedReceipt.consignee_address}</div>
                  </div>
                </div>
              </div>
              
              {selectedReceipt.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedReceipt.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseReceiptManager;