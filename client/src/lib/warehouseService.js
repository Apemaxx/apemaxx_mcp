// client/src/lib/warehouseService.js
import { supabase } from './supabase';

export const warehouseService = {
  // ==================== WAREHOUSE RECEIPTS ====================

  async getReceipts(userId, options = {}) {
    try {
      console.log('🔍 Trying to fetch warehouse receipts for user:', userId);
      
      // Try the simple warehouse_receipts table first
      let query = supabase
        .from('warehouse_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }

      if (options.search) {
        query = query.or(`
          wr_number.ilike.%${options.search}%,
          tracking_number.ilike.%${options.search}%,
          shipper_name.ilike.%${options.search}%,
          consignee_name.ilike.%${options.search}%
        `);
      }

      // Pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error from warehouse_receipts table:', error);
        throw error;
      }
      
      console.log('✅ Found warehouse receipts:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  },

  async getReceiptById(receiptId, userId) {
    try {
      const { data, error } = await supabase
        .from('warehouse_receipt_summary_enhanced')
        .select('*')
        .eq('id', receiptId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  },

  async createReceipt(receiptData) {
    try {
      // Generate WR number
      const wrNumber = await this.generateWRNumber();
      
      const receiptToInsert = {
        wr_number: wrNumber,
        received_date: receiptData.receivedDate || new Date().toISOString(),
        received_by: receiptData.receivedBy,
        shipper_name: receiptData.shipperName,
        shipper_address: receiptData.shipperAddress,
        consignee_name: receiptData.consigneeName,
        consignee_address: receiptData.consigneeAddress,
        carrier_name: receiptData.carrierName,
        driver_name: receiptData.driverName,
        driver_license: receiptData.driverLicense,
        tracking_number: receiptData.trackingNumber,
        pro_number: receiptData.proNumber,
        booking_reference: receiptData.bookingReference,
        shipment_id: receiptData.shipmentId,
        invoice_number: receiptData.invoiceNumber,
        po_number: receiptData.poNumber,
        total_pieces: receiptData.totalPieces,
        total_weight_lb: receiptData.totalWeightLb,
        total_weight_kg: receiptData.totalWeightKg,
        cargo_description: receiptData.cargoDescription || 'GENERAL CARGO',
        notes: receiptData.notes,
        status: receiptData.status || 'received_on_hand',
        user_id: receiptData.userId,
        shipper_id: receiptData.shipperId,
        consignee_id: receiptData.consigneeId,
        warehouse_location_id: receiptData.warehouseLocationId,
        consol_week_plan_id: receiptData.consolWeekPlanId,
        dimensions_length: receiptData.dimensionsLength,
        dimensions_width: receiptData.dimensionsWidth,
        dimensions_height: receiptData.dimensionsHeight,
        package_type: receiptData.packageType,
        charges_applied: receiptData.chargesApplied || 0
      };

      // Calculate volume if dimensions provided
      if (receiptData.dimensionsLength && receiptData.dimensionsWidth && receiptData.dimensionsHeight) {
        const volumeFt3 = (receiptData.dimensionsLength * receiptData.dimensionsWidth * receiptData.dimensionsHeight) / 1728;
        receiptToInsert.total_volume_ft3 = volumeFt3;
        receiptToInsert.total_volume_vlb = volumeFt3 * 10.4; // VLB calculation
      }

      const { data, error } = await supabase
        .from('warehouse_receipts')
        .insert(receiptToInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  async updateReceipt(receiptId, updates, userId) {
    try {
      // Calculate volume if dimensions updated
      if (updates.dimensionsLength && updates.dimensionsWidth && updates.dimensionsHeight) {
        const volumeFt3 = (updates.dimensionsLength * updates.dimensionsWidth * updates.dimensionsHeight) / 1728;
        updates.total_volume_ft3 = volumeFt3;
        updates.total_volume_vlb = volumeFt3 * 10.4;
      }

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('warehouse_receipts')
        .update(updates)
        .eq('id', receiptId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  },

  async updateStatus(receiptId, newStatus, userId) {
    try {
      const { data, error } = await supabase
        .from('warehouse_receipts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', receiptId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  async deleteReceipt(receiptId, userId) {
    try {
      // First delete attachments
      await this.deleteReceiptAttachments(receiptId);
      
      // Then delete the receipt
      const { error } = await supabase
        .from('warehouse_receipts')
        .delete()
        .eq('id', receiptId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  },

  async generateWRNumber() {
    try {
      const now = new Date();
      const year = now.getFullYear().toString().substr(-2);
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      
      // Get count of receipts today to create unique number
      const { count } = await supabase
        .from('warehouse_receipts')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date().toISOString().split('T')[0]);

      const sequence = (count + 1).toString().padStart(3, '0');
      return `WR${year}${dayOfYear}${sequence}`;
    } catch (error) {
      console.error('Error generating WR number:', error);
      return `WR${Date.now()}`;
    }
  },

  // ==================== ANALYTICS ====================

  async getAnalytics(userId) {
    try {
      // Just get basic stats from warehouse_receipts table
      const { data, error } = await supabase
        .from('warehouse_receipts')
        .select('*');

      if (error) throw error;
      
      // Calculate basic analytics
      const stats = {
        total_receipts: data?.length || 0,
        received_on_hand: data?.filter(r => r.status === 'received_on_hand')?.length || 0,
        released_by_air: data?.filter(r => r.status === 'released_by_air')?.length || 0,
        released_by_ocean: data?.filter(r => r.status === 'released_by_ocean')?.length || 0,
        shipped: data?.filter(r => r.status === 'shipped')?.length || 0,
        total_pieces: data?.reduce((sum, r) => sum + (r.total_pieces || 0), 0) || 0,
        total_weight_lb: data?.reduce((sum, r) => sum + (r.total_weight_lb || 0), 0) || 0,
        total_volume_ft3: data?.reduce((sum, r) => sum + (r.total_volume_ft3 || 0), 0) || 0
      };
      
      return [stats]; // Return as array to match expected format
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // ==================== ADDRESS BOOK ====================

  async getAddressBook(userId, businessType = null) {
    try {
      let query = supabase
        .from('address_book')
        .select('*')
        .eq('user_id', userId)
        .order('company_name');

      if (businessType) {
        query = query.eq('business_type', businessType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching address book:', error);
      throw error;
    }
  },

  async createAddressBookEntry(entryData) {
    try {
      const { data, error } = await supabase
        .from('address_book')
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating address book entry:', error);
      throw error;
    }
  },

  async updateAddressBookEntry(entryId, updates, userId) {
    try {
      const { data, error } = await supabase
        .from('address_book')
        .update(updates)
        .eq('id', entryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating address book entry:', error);
      throw error;
    }
  },

  async deleteAddressBookEntry(entryId, userId) {
    try {
      const { error } = await supabase
        .from('address_book')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting address book entry:', error);
      throw error;
    }
  },

  // ==================== WAREHOUSE LOCATIONS ====================

  async getWarehouseLocations() {
    try {
      const { data, error } = await supabase
        .from('warehouse_locations')
        .select('*')
        .eq('is_active', true)
        .order('location_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching warehouse locations:', error);
      throw error;
    }
  },

  // ==================== FILE ATTACHMENTS ====================

  async uploadFile(receiptId, file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${receiptId}/${Date.now()}.${fileExt}`;
      const filePath = `warehouse-docs/${userId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('warehouse-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file reference in database
      const { data, error } = await supabase
        .from('warehouse_receipt_attachments')
        .insert({
          warehouse_receipt_id: receiptId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async getReceiptAttachments(receiptId) {
    try {
      const { data, error } = await supabase
        .from('warehouse_receipt_attachments')
        .select('*')
        .eq('warehouse_receipt_id', receiptId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  },

  async deleteReceiptAttachments(receiptId) {
    try {
      // Get file paths first
      const { data: attachments } = await supabase
        .from('warehouse_receipt_attachments')
        .select('file_path')
        .eq('warehouse_receipt_id', receiptId);

      // Delete files from storage
      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(att => att.file_path);
        await supabase.storage
          .from('warehouse-attachments')
          .remove(filePaths);
      }

      // Delete database records
      const { error } = await supabase
        .from('warehouse_receipt_attachments')
        .delete()
        .eq('warehouse_receipt_id', receiptId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting attachments:', error);
      throw error;
    }
  },

  async getFileUrl(filePath) {
    try {
      const { data } = await supabase.storage
        .from('warehouse-attachments')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  },

  // ==================== CONSOL WEEK PLANS ====================

  async getConsolWeekPlans(userId) {
    try {
      const { data, error } = await supabase
        .from('consol_week_plans')
        .select('*')
        .eq('created_by', userId)
        .order('year', { ascending: false })
        .order('week_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching consol week plans:', error);
      throw error;
    }
  },

  async createConsolWeekPlan(planData) {
    try {
      const { data, error } = await supabase
        .from('consol_week_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating consol week plan:', error);
      throw error;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  getStatusColor(status) {
    const statusColors = {
      'received_on_hand': 'bg-blue-100 text-blue-800',
      'released_by_air': 'bg-purple-100 text-purple-800',
      'released_by_ocean': 'bg-teal-100 text-teal-800',
      'shipped': 'bg-green-100 text-green-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  },

  getStatusDisplay(status) {
    const statusDisplay = {
      'received_on_hand': 'Received On Hand',
      'released_by_air': 'Released by Air',
      'released_by_ocean': 'Released by Ocean',
      'shipped': 'Shipped'
    };
    return statusDisplay[status] || status;
  },

  getStatusIcon(status) {
    const statusIcons = {
      'received_on_hand': '📦',
      'released_by_air': '✈️',
      'released_by_ocean': '🚢',
      'shipped': '🚛'
    };
    return statusIcons[status] || '📋';
  },

  formatVolume(volumeFt3) {
    if (!volumeFt3) return '0.00 ft³';
    return `${parseFloat(volumeFt3).toFixed(2)} ft³`;
  },

  formatWeight(weightLb) {
    if (!weightLb) return '0.00 lbs';
    return `${parseFloat(weightLb).toFixed(2)} lbs`;
  },

  formatVLB(volumeVlb) {
    if (!volumeVlb) return '0.00 VLB';
    return `${parseFloat(volumeVlb).toFixed(2)} VLB`;
  },

  // ==================== LEGACY COMPATIBILITY ====================
  // These methods provide compatibility with the existing components

  async getDashboardStats(userId) {
    try {
      console.log('✅ Real warehouse stats retrieved');
      const analytics = await this.getAnalytics(userId);
      if (analytics && analytics.length > 0) {
        const stats = analytics[0];
        return {
          total_receipts: stats.total_receipts || 0,
          by_status: {
            'received_on_hand': stats.received_on_hand || 0,
            'released_by_air': stats.released_by_air || 0,
            'released_by_ocean': stats.released_by_ocean || 0,
            'shipped': stats.shipped || 0
          },
          by_location: {},
          total_pieces: stats.total_pieces || 0,
          total_weight: stats.total_weight_lb || 0,
          total_volume: stats.total_volume_ft3 || 0,
          recent_activity: []
        };
      }
      return {
        total_receipts: 0,
        by_status: {},
        by_location: {},
        total_pieces: 0,
        total_weight: 0,
        total_volume: 0,
        recent_activity: []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        total_receipts: 0,
        by_status: {},
        by_location: {},
        total_pieces: 0,
        total_weight: 0,
        total_volume: 0,
        recent_activity: []
      };
    }
  },

  async getReceiptsByLocation(userId) {
    try {
      const receipts = await this.getReceipts(userId);
      const grouped = {};
      
      receipts.forEach(receipt => {
        const location = receipt.warehouse_location_name || 'Unknown Location';
        if (!grouped[location]) {
          grouped[location] = [];
        }
        grouped[location].push(receipt);
      });
      
      return grouped;
    } catch (error) {
      console.error('Error grouping receipts by location:', error);
      return {};
    }
  },

  async searchReceipts(userId, searchTerm) {
    try {
      return await this.getReceipts(userId, { search: searchTerm });
    } catch (error) {
      console.error('Error searching receipts:', error);
      return [];
    }
  },

  formatStatus(status) {
    return this.getStatusDisplay(status);
  }
};