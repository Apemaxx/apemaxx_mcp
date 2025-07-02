import { supabase } from './supabase';
import type { IStorage } from './storage';
import type {
  User,
  InsertUser,
  Profile,
  InsertProfile,
  Shipment,
  InsertShipment,
  Booking,
  InsertBooking,
  Consolidation,
  InsertConsolidation,
  WarehouseReceipt,
  InsertWarehouseReceipt,
  AiInsight,
  InsertAiInsight,
  TrackingEvent,
  InsertTrackingEvent,
  ChatMessage,
  InsertChatMessage,
} from '@shared/schema';

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log('🔍 Looking up user by email:', email);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        console.log('📋 User not found, creating new user for:', email);
        // Create user for demo - in production this would be handled by signup
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('demo123', 10);
        
        return this.createUser({
          email,
          passwordHash: hashedPassword
        });
      }
      console.error('❌ Error fetching user by email:', error);
      return undefined;
    }
    
    console.log('✅ User found:', { id: data.id, email: data.email });
    
    // Map the real Supabase schema to our internal User type
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password, // Real schema uses 'password' column
      createdAt: new Date(data.created_at)
    } as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    console.log('📝 Creating new user in Supabase:', user.email);
    
    // Using the discovered schema: users table has 'password' column and includes name fields
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: user.email,
        password: user.passwordHash, // Real schema uses 'password', not 'password_hash'
        first_name: 'Ricardo',
        last_name: 'Lopes',
        company: 'APE MAXX Logistics'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating user:', error);
      throw new Error('Failed to create user: ' + error.message);
    }
    
    console.log('✅ User created successfully:', data.id);
    
    // Create profile using the discovered profiles schema
    await this.createInitialProfile(data.id);
    
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password, // Map back to our internal schema
      createdAt: new Date(data.created_at)
    } as User;
  }

  private async createInitialProfile(userId: string): Promise<void> {
    try {
      // Based on PRD: profiles table extends auth.users(id), so id field references the user
      const profileData = {
        id: userId, // Primary key that references auth.users(id)
        email: 'demo@example.com', // From PRD schema
        name: 'APE MAXX Demo User',
        company: 'APE MAXX Logistics',
        phone: '+1 (555) 123-4567',
        language: 'en',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Experienced logistics manager with 8+ years in international freight and supply chain optimization.',
        location: 'Miami, FL',
        website: 'https://apemaxx.com',
        job_title: 'Senior Logistics Manager'
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);
      
      if (profileError) {
        console.log('⚠️ Profile creation failed:', profileError.message);
        console.log('⚠️ This may be due to RLS policies - profiles will be created when user first accesses dashboard');
      } else {
        console.log('✅ Profile created for user');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return undefined;
      }
      console.error('Error fetching profile:', error);
      return undefined;
    }
    
    return data as Profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
    
    return data as Profile;
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        return this.createProfile({ userId, ...profile });
      }
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
    
    return data as Profile;
  }

  async getKPIMetrics(userId: string): Promise<{
    shipmentsInTransit: number;
    pendingBookings: number;
    monthlyFreightCost: number;
    onTimeDeliveryRate: number;
  }> {
    // For now, return demo data since tables aren't fully set up
    return {
      shipmentsInTransit: 12,
      pendingBookings: 3,
      monthlyFreightCost: 45892.50,
      onTimeDeliveryRate: 98,
    };
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating shipment:', error);
      throw new Error('Failed to create shipment');
    }
    
    return data as Shipment;
  }

  async getShipmentsByUser(userId: string): Promise<Shipment[]> {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching shipments:', error);
      return [];
    }
    
    return data as Shipment[];
  }

  async getRecentTrackingEvents(userId: string): Promise<(TrackingEvent & { shipment: Pick<Shipment, 'trackingNumber' | 'carrier'> })[]> {
    // For now, return demo data
    return [];
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
    
    return data as Booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
    
    return data as Booking[];
  }

  async createConsolidation(consolidation: InsertConsolidation): Promise<Consolidation> {
    const { data, error } = await supabase
      .from('consolidations')
      .insert(consolidation)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating consolidation:', error);
      throw new Error('Failed to create consolidation');
    }
    
    return data as Consolidation;
  }

  async getCurrentConsolidation(userId: string): Promise<Consolidation | undefined> {
    // For now, return demo data
    return {
      id: 1,
      planName: 'MIA-SANTOS-W25',
      route: 'Miami → Santos',
      currentVolume: '45.00',
      maxVolume: '60.00',
      bookingCount: 8,
      etd: new Date('2025-07-05'),
      status: 'planning',
      userId: userId,
      createdAt: new Date(),
    };
  }

  async createWarehouseReceipt(receipt: InsertWarehouseReceipt): Promise<WarehouseReceipt> {
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .insert(receipt)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating warehouse receipt:', error);
      throw new Error('Failed to create warehouse receipt');
    }
    
    return data as WarehouseReceipt;
  }

  async getRecentWarehouseReceipts(userId: string): Promise<WarehouseReceipt[]> {
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .eq('user_id', userId)
      .order('received_date', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching warehouse receipts:', error);
      return [];
    }
    
    return data as WarehouseReceipt[];
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insight)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating AI insight:', error);
      throw new Error('Failed to create AI insight');
    }
    
    return data as AiInsight;
  }

  async getAiInsightsByUser(userId: string): Promise<AiInsight[]> {
    // For now, return demo data
    return [];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat message:', error);
      throw new Error('Failed to create chat message');
    }
    
    return data as ChatMessage;
  }

  async getChatMessagesByUser(userId: string): Promise<ChatMessage[]> {
    // For now, return demo data
    return [];
  }

  async createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent> {
    const { data, error } = await supabase
      .from('tracking_events')
      .insert(event)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating tracking event:', error);
      throw new Error('Failed to create tracking event');
    }
    
    return data as TrackingEvent;
  }

  // Extended Warehouse Methods
  async getWarehouseReceipts(userId: string, limit?: number, locationId?: string | null, status?: string | null): Promise<WarehouseReceipt[]> {
    console.log('🔍 Fetching warehouse receipts for user:', userId);
    
    // First check what user_ids exist in the database
    const { data: allUsers, error: userError } = await supabase
      .from('warehouse_receipts')
      .select('user_id')
      .limit(10);
    
    console.log('📋 Available user_ids in warehouse_receipts:', allUsers?.map(r => r.user_id) || []);
    
    let query = supabase
      .from('warehouse_receipts')
      .select('*')
      .eq('user_id', userId);
    
    if (limit) query = query.limit(limit);
    if (locationId) query = query.eq('warehouse_location_id', locationId);
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    
    console.log('📊 Warehouse receipts query result:', { 
      dataCount: data?.length || 0, 
      error: error?.message,
      userId: userId
    });
    
    // If no data found for this user, try getting any data for debugging
    if (!data || data.length === 0) {
      const { data: anyData } = await supabase
        .from('warehouse_receipts')
        .select('*')
        .limit(5);
      console.log('🔍 Sample data from warehouse_receipts table:', anyData?.length || 0, 'rows');
    }
    
    if (error) {
      console.error('Error fetching warehouse receipts:', error);
      return [];
    }
    
    // Return data as-is for now, without warehouse join
    return (data || []).map(receipt => ({
      ...receipt,
      warehouse_location_name: 'Warehouse Location' // Fallback for now
    })) as WarehouseReceipt[];
  }

  async getWarehouseReceiptsByLocation(userId: string): Promise<Record<string, WarehouseReceipt[]>> {
    const receipts = await this.getWarehouseReceipts(userId, 100);
    
    const groupedByLocation: Record<string, WarehouseReceipt[]> = {};
    receipts.forEach(receipt => {
      const location = (receipt as any).warehouse_location_name || 'Unknown Location';
      if (!groupedByLocation[location]) {
        groupedByLocation[location] = [];
      }
      groupedByLocation[location].push(receipt);
    });

    return groupedByLocation;
  }

  async searchWarehouseReceipts(userId: string, searchTerm: string): Promise<WarehouseReceipt[]> {
    console.log('🔍 Searching warehouse receipts for user:', userId, 'term:', searchTerm);
    
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .eq('user_id', userId)
      .or(`wr_number.ilike.%${searchTerm}%,tracking_number.ilike.%${searchTerm}%`)
      .limit(50);
    
    console.log('📊 Search results:', { 
      dataCount: data?.length || 0, 
      error: error?.message,
      searchTerm: searchTerm
    });
    
    if (error) {
      console.error('Error searching warehouse receipts:', error);
      return [];
    }
    
    return (data || []).map(receipt => ({
      ...receipt,
      warehouse_location_name: 'Warehouse Location', // Fallback for now
      shipper_name: 'Shipper',
      consignee_name: 'Consignee'
    })) as WarehouseReceipt[];
  }

  async getWarehouseDashboardStats(userId: string): Promise<{
    total_receipts: number;
    by_status: Record<string, number>;
    by_location: Record<string, number>;
    total_pieces: number;
    total_weight: number;
    total_volume: number;
    recent_activity: WarehouseReceipt[];
  }> {
    const receipts = await this.getWarehouseReceipts(userId, 100);

    const stats = {
      total_receipts: receipts.length,
      by_status: {} as Record<string, number>,
      by_location: {} as Record<string, number>,
      total_pieces: 0,
      total_weight: 0,
      total_volume: 0,
      recent_activity: receipts.slice(0, 10)
    };

    receipts.forEach(receipt => {
      // Status counts
      const status = receipt.status || 'received_on_hand';
      stats.by_status[status] = (stats.by_status[status] || 0) + 1;

      // Location counts
      const location = (receipt as any).warehouse_location_name || 'Unknown Location';
      stats.by_location[location] = (stats.by_location[location] || 0) + 1;

      // Totals
      stats.total_pieces += receipt.total_pieces || 0;
      stats.total_weight += parseFloat(receipt.total_weight_lb as string || '0');
      stats.total_volume += parseFloat(receipt.total_volume_ft3 as string || '0');
    });

    return stats;
  }
}