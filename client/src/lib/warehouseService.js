// src/lib/warehouseService.js
// Adapted to work with your existing Supabase database schema

import { supabase } from './supabase'; // Your existing Supabase client

export const warehouseService = {
  // Get warehouse receipts using the new summary view
  async getReceipts(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('warehouse_receipt_summary')
        .select('*')
        .eq('user_id', userId)
        .order('received_date', { ascending: false })
        .limit(limit);
      
      if (error) {
        // If summary view doesn't exist, use base table
        console.warn('Summary view not found, using base warehouse_receipts table');
        return await this.getFallbackReceipts(userId, limit);
      }
      return data;
    } catch (error) {
      console.warn('Summary view query failed, using fallback');
      return await this.getFallbackReceipts(userId, limit);
    }
  },

  // Fallback receipts from base table
  async getFallbackReceipts(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('warehouse_receipts')
        .select('*')
        .eq('user_id', userId)
        .order('received_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Add derived fields to match summary view structure
      return data?.map(receipt => ({
        ...receipt,
        receipt_number: receipt.tracking_number || `WR-${receipt.id}`,
        attachment_count: 0, // Will be updated when attachments are implemented
        status: receipt.status || 'received'
      })) || [];
    } catch (error) {
      console.error('Fallback receipts query failed:', error);
      return [];
    }
  },

  // Get single receipt with attachments
  async getReceiptById(receiptId) {
    const { data: receipt, error: receiptError } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (receiptError) throw receiptError;

    // Get attachments
    const { data: attachments, error: attachError } = await supabase
      .from('warehouse_receipt_attachments')
      .select('*')
      .eq('warehouse_receipt_id', receiptId);

    if (attachError) throw attachError;

    return { ...receipt, attachments };
  },

  // Create new warehouse receipt
  async createReceipt(receiptData, files = []) {
    try {
      // Generate unique receipt number
      const receiptNumber = `WR${Date.now()}`;
      
      // Prepare data for insertion (match your table structure)
      const insertData = {
        wr_number: receiptNumber,
        received_date: new Date().toISOString(),
        received_by: receiptData.received_by,
        shipper_id: receiptData.shipper_id || null,
        consignee_id: receiptData.consignee_id || null,
        carrier_name: receiptData.carrier_name,
        driver_name: receiptData.driver_name,
        tracking_number: receiptData.tracking_number,
        total_pieces: receiptData.total_pieces,
        total_weight_lb: receiptData.total_weight_lbs,
        total_volume_cbf: receiptData.total_volume_cbf,
        cargo_description: receiptData.cargo_description || 'GENERAL CARGO',
        warehouse_location: receiptData.warehouse_location,
        notes: receiptData.notes,
        user_id: receiptData.user_id,
        status: 'Received on Hand'
      };

      // Create receipt record
      const { data: receipt, error } = await supabase
        .from('warehouse_receipts')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // Upload files if provided
      if (files.length > 0) {
        await this.uploadFiles(files, receipt.id);
      }

      return receipt;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  // Upload files to Supabase Storage
  async uploadFiles(files, receiptId) {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${receiptId}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('warehouse-receipts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('warehouse-receipts')
        .getPublicUrl(fileName);

      // Save attachment record
      const { data: attachment, error: attachError } = await supabase
        .from('warehouse_receipt_attachments')
        .insert([{
          warehouse_receipt_id: receiptId,
          file_name: file.name,
          file_path: uploadData.path,
          file_type: fileExt,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (attachError) throw attachError;

      return {
        ...attachment,
        url: publicUrl
      };
    });

    return Promise.all(uploadPromises);
  },

  // Get dashboard analytics using new function
  async getDashboardStats(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_warehouse_analytics', { user_uuid: userId });

      if (error) {
        // If analytics function doesn't exist, calculate basic stats manually
        console.warn('Analytics function not found, using fallback calculation');
        return await this.getFallbackStats(userId);
      }
      return data;
    } catch (error) {
      console.warn('Analytics function failed, using fallback calculation');
      return await this.getFallbackStats(userId);
    }
  },

  // Fallback stats calculation
  async getFallbackStats(userId) {
    try {
      const { data: receipts, error } = await supabase
        .from('warehouse_receipts')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const totalReceipts = receipts?.length || 0;
      const activeReceipts = receipts?.filter(r => r.status !== 'Shipped').length || 0;
      const readyForRelease = receipts?.filter(r => r.status === 'Release by Air' || r.status === 'Release by Ocean').length || 0;
      const totalPieces = receipts?.reduce((sum, r) => sum + (r.total_pieces || 0), 0) || 0;
      const totalWeight = receipts?.reduce((sum, r) => sum + (r.total_weight_lb || 0), 0) || 0;
      const totalVolume = receipts?.reduce((sum, r) => sum + (r.total_volume_cbf || 0), 0) || 0;

      return {
        total_receipts: totalReceipts,
        active_receipts: activeReceipts,
        ready_for_release: readyForRelease,
        total_pieces: totalPieces,
        total_weight: totalWeight,
        total_volume: totalVolume
      };
    } catch (error) {
      console.error('Fallback stats calculation failed:', error);
      return {
        total_receipts: 0,
        active_receipts: 0,
        ready_for_release: 0,
        total_pieces: 0,
        total_weight: 0,
        total_volume: 0
      };
    }
  },

  // Update receipt status
  async updateStatus(receiptId, status, notes = '') {
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .update({ 
        status,
        notes: notes || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', receiptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Link receipt to booking
  async linkToBooking(receiptId, bookingId, bookingType = 'lcl_booking') {
    const { data, error } = await supabase
      .from('warehouse_receipt_bookings')
      .insert([{
        warehouse_receipt_id: receiptId,
        booking_id: bookingId,
        booking_type: bookingType,
        linked_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Search receipts with fallback
  async searchReceipts(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('warehouse_receipt_summary')
        .select('*')
        .eq('user_id', userId)
        .or(`receipt_number.ilike.%${searchTerm}%,wr_number.ilike.%${searchTerm}%,tracking_number.ilike.%${searchTerm}%,shipper_name.ilike.%${searchTerm}%,carrier_name.ilike.%${searchTerm}%`)
        .order('received_date', { ascending: false });
      
      if (error) {
        // Fallback to base table
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('warehouse_receipts')
          .select('*')
          .eq('user_id', userId)
          .or(`wr_number.ilike.%${searchTerm}%,tracking_number.ilike.%${searchTerm}%,shipper_name.ilike.%${searchTerm}%,carrier_name.ilike.%${searchTerm}%`)
          .order('received_date', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      return data || [];
    } catch (error) {
      console.error('Search receipts failed:', error);
      return [];
    }
  },

  // Get receipts by status with fallback
  async getReceiptsByStatus(userId, status) {
    try {
      const { data, error } = await supabase
        .from('warehouse_receipt_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('received_date', { ascending: false });
      
      if (error) {
        // Fallback to base table
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('warehouse_receipts')
          .select('*')
          .eq('user_id', userId)
          .eq('status', status)
          .order('received_date', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      return data || [];
    } catch (error) {
      console.error('Get receipts by status failed:', error);
      return [];
    }
  },

  // Get address book entries for shipper/consignee dropdowns
  async getAddressBook(userId, type = null) {
    try {
      let query = supabase
        .from('address_book')
        .select('*')
        .eq('user_id', userId);
      
      if (type) {
        query = query.eq('type', type); // 'shipper' or 'consignee'
      }
      
      const { data, error } = await query.order('company_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get address book failed:', error);
      return [];
    }
  },

  // Get specific address book entry
  async getAddressBookEntry(entryId) {
    try {
      const { data, error } = await supabase
        .from('address_book')
        .select('*')
        .eq('id', entryId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get address book entry failed:', error);
      return null;
    }
  }
};