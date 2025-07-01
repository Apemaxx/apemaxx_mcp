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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return undefined;
      }
      console.error('Error fetching user by email:', error);
      return undefined;
    }
    
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
    
    return data as User;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
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
      .eq('user_id', userId)
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
    // For now, return demo data
    return [];
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
}