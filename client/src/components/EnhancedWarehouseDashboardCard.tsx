// src/components/EnhancedWarehouseDashboardCard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Eye, ArrowRight, Plane, Ship, Truck, 
  Building, Archive, TrendingUp 
} from 'lucide-react';
import { warehouseService } from '../lib/warehouseService';

const EnhancedWarehouseDashboardCard = ({ userId, onNavigateToFull }) => {
  const [stats, setStats] = useState({});
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, receiptsData] = await Promise.all([
        warehouseService.getDashboardStats(userId),
        warehouseService.getReceipts(userId, 5) // Latest 5 for dashboard
      ]);
      
      setStats(statsData);
      setRecentReceipts(receiptsData);
    } catch (error) {
      console.error('Error loading warehouse dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }) => {
    const icons = {
      'received_on_hand': Package,
      'released_by_air': Plane,
      'released_by_ocean': Ship,
      'shipped': Truck
    };
    const colors = {
      'received_on_hand': 'text-blue-500',
      'released_by_air': 'text-yellow-500',
      'released_by_ocean': 'text-purple-500',
      'shipped': 'text-green-500'
    };
    
    const Icon = icons[status] || Package;
    const colorClass = colors[status] || 'text-gray-500';
    
    return <Icon className={`w-3 h-3 ${colorClass}`} />;
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center text-lg">
          <Package className="w-6 h-6 mr-2 text-blue-600" />
          Warehouse Management
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateToFull && onNavigateToFull('create')}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Receipt</span>
          </button>
          <button
            onClick={() => onNavigateToFull && onNavigateToFull('view')}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>View All</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Receipts */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {stats.total_receipts || 0}
              </p>
              <p className="text-xs text-blue-600 font-medium">Total Receipts</p>
            </div>
            <Package className="w-8 h-8 text-blue-600 opacity-80" />
          </div>
        </div>

        {/* On Hand */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-700">
                {stats.by_status?.received_on_hand || 0}
              </p>
              <p className="text-xs text-green-600 font-medium">On Hand</p>
            </div>
            <Archive className="w-8 h-8 text-green-600 opacity-80" />
          </div>
        </div>

        {/* Released */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {((stats.by_status?.released_by_air || 0) + (stats.by_status?.released_by_ocean || 0))}
              </p>
              <p className="text-xs text-yellow-600 font-medium">Released</p>
            </div>
            <div className="flex space-x-1">
              <Plane className="w-4 h-4 text-yellow-600 opacity-80" />
              <Ship className="w-4 h-4 text-yellow-600 opacity-80" />
            </div>
          </div>
        </div>

        {/* Shipped */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {stats.by_status?.shipped || 0}
              </p>
              <p className="text-xs text-purple-600 font-medium">Shipped</p>
            </div>
            <Truck className="w-8 h-8 text-purple-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Volume & Weight Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{Math.round(stats.total_pieces || 0)}</p>
          <p className="text-xs text-gray-600">Total Pieces</p>
        </div>
        <div className="text-center border-l border-r border-gray-300">
          <p className="text-lg font-bold text-gray-800">{Math.round(stats.total_weight || 0)}</p>
          <p className="text-xs text-gray-600">Total Weight (lbs)</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{Math.round(stats.total_volume || 0)}</p>
          <p className="text-xs text-gray-600">Total Volume (ft³)</p>
        </div>
      </div>

      {/* Location Breakdown */}
      {stats.by_location && Object.keys(stats.by_location).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-1" />
            By Location
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.by_location).map(([location, count]) => (
              <div key={location} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{location}</span>
                <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Recent Activity
          </h4>
          {recentReceipts.length > 3 && (
            <button
              onClick={() => onNavigateToFull && onNavigateToFull('view')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"
            >
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          )}
        </div>

        {recentReceipts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No warehouse receipts yet</p>
            <p className="text-xs text-gray-400 mb-3">Create your first professional receipt</p>
            <button
              onClick={() => onNavigateToFull && onNavigateToFull('create')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Create Receipt →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReceipts.slice(0, 4).map((receipt) => (
              <div 
                key={receipt.id} 
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onNavigateToFull && onNavigateToFull('view', receipt.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <StatusIcon status={receipt.status} />
                    <div>
                      <div className="text-sm font-medium text-blue-600">
                        {receipt.wr_number || receipt.receipt_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {receipt.tracking_number}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={receipt.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 truncate">
                      <span className="font-medium">From:</span> {receipt.shipper_name}
                    </p>
                    <p className="text-gray-500 truncate">
                      <span className="font-medium">To:</span> {receipt.consignee_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">
                      {receipt.total_pieces} pcs • {receipt.total_weight_lb || receipt.total_weight_lbs} lbs
                    </p>
                    {(receipt.total_volume_ft3 || receipt.total_volume_cbf) && (
                      <p className="text-gray-500">{receipt.total_volume_ft3 || receipt.total_volume_cbf} ft³</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {(receipt.warehouse_location_name || receipt.warehouse_location) && (
                      <span className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {receipt.warehouse_location_name || receipt.warehouse_location}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(receipt.received_date).toLocaleDateString()}</span>
                  </div>
                  {receipt.attachment_count > 0 && (
                    <div className="flex items-center text-xs text-blue-600">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{receipt.attachment_count} files</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      {stats.total_receipts > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4 text-gray-500">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => onNavigateToFull && onNavigateToFull('manage')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              Manage All <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedWarehouseDashboardCard;