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

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private profiles: Profile[] = [];
  private shipments: Shipment[] = [];
  private bookings: Booking[] = [];
  private consolidations: Consolidation[] = [];
  private warehouseReceipts: WarehouseReceipt[] = [];
  private aiInsights: AiInsight[] = [];
  private trackingEvents: TrackingEvent[] = [];
  private chatMessages: ChatMessage[] = [];
  
  private nextId = 1;
  private nextUserId = 'user_1';

  constructor() {
    this.initializeSampleData();
    this.initializeSampleProfiles();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    let user = this.users.find(user => user.email === email);
    
    // Auto-create user if not found (for demo purposes)
    if (!user) {
      user = await this.createUser({
        email,
        passwordHash: 'demo_password_hash', // Any password works in demo mode
      });
    }
    
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextUserId,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    this.nextUserId = `user_${this.users.length + 1}`;
    return newUser;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    return this.profiles.find(profile => profile.userId === userId);
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const newProfile: Profile = {
      id: profile.id || `profile_${this.profiles.length + 1}`,
      userId: profile.userId,
      email: profile.email || null,
      name: profile.name || null,
      company: profile.company || null,
      phone: profile.phone || null,
      language: profile.language || "en",
      llmApiKey: profile.llmApiKey || null,
      avatarUrl: profile.avatarUrl || null,
      bio: profile.bio || null,
      location: profile.location || null,
      website: profile.website || null,
      jobTitle: profile.jobTitle || null,
      organizationId: profile.organizationId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profiles.push(newProfile);
    return newProfile;
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile> {
    const existingProfileIndex = this.profiles.findIndex(p => p.userId === userId);
    
    if (existingProfileIndex === -1) {
      // Create new profile if none exists
      return this.createProfile({ userId, ...profile });
    }

    const existingProfile = this.profiles[existingProfileIndex];
    const updatedProfile: Profile = {
      ...existingProfile,
      ...profile,
      updatedAt: new Date(),
    };
    
    this.profiles[existingProfileIndex] = updatedProfile;
    return updatedProfile;
  }

  async getKPIMetrics(userId: string): Promise<{
    shipmentsInTransit: number;
    pendingBookings: number;
    monthlyFreightCost: number;
    onTimeDeliveryRate: number;
  }> {
    const userShipments = this.shipments.filter(s => s.userId === userId);
    const userBookings = this.bookings.filter(b => b.userId === userId);
    
    const shipmentsInTransit = userShipments.filter(s => s.status === 'in_transit').length;
    const pendingBookings = userBookings.filter(b => b.status === 'pending').length;
    
    const monthlyFreightCost = userShipments
      .filter(s => s.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, s) => sum + (parseFloat(s.estimatedCost || '0')), 0);
    
    const deliveredShipments = userShipments.filter(s => s.status === 'delivered');
    const onTimeShipments = deliveredShipments.filter(s => s.isOnTime);
    const onTimeDeliveryRate = deliveredShipments.length > 0 
      ? Math.round((onTimeShipments.length / deliveredShipments.length) * 100)
      : 98; // Default sample rate

    return {
      shipmentsInTransit,
      pendingBookings,
      monthlyFreightCost,
      onTimeDeliveryRate,
    };
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const newShipment: Shipment = {
      id: this.nextId++,
      ...shipment,
      createdAt: new Date(),
    };
    this.shipments.push(newShipment);
    return newShipment;
  }

  async getShipmentsByUser(userId: string): Promise<Shipment[]> {
    return this.shipments.filter(s => s.userId === userId);
  }

  async getRecentTrackingEvents(userId: string): Promise<(TrackingEvent & { shipment: Pick<Shipment, 'trackingNumber' | 'carrier'> })[]> {
    const userShipments = this.shipments.filter(s => s.userId === userId);
    return this.trackingEvents
      .filter(e => userShipments.some(s => s.id === e.shipmentId))
      .slice(-10)
      .map(event => {
        const shipment = userShipments.find(s => s.id === event.shipmentId)!;
        return {
          ...event,
          shipment: {
            trackingNumber: shipment.trackingNumber,
            carrier: shipment.carrier,
          },
        };
      });
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const newBooking: Booking = {
      id: this.nextId++,
      ...booking,
      createdAt: new Date(),
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return this.bookings.filter(b => b.userId === userId);
  }

  async createConsolidation(consolidation: InsertConsolidation): Promise<Consolidation> {
    const newConsolidation: Consolidation = {
      id: this.nextId++,
      ...consolidation,
      createdAt: new Date(),
    };
    this.consolidations.push(newConsolidation);
    return newConsolidation;
  }

  async getCurrentConsolidation(userId: string): Promise<Consolidation | undefined> {
    return this.consolidations
      .filter(c => c.userId === userId && c.status === 'planning')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  async createWarehouseReceipt(receipt: InsertWarehouseReceipt): Promise<WarehouseReceipt> {
    const newReceipt: WarehouseReceipt = {
      id: this.nextId++,
      ...receipt,
      createdAt: new Date(),
    };
    this.warehouseReceipts.push(newReceipt);
    return newReceipt;
  }

  async getRecentWarehouseReceipts(userId: string): Promise<WarehouseReceipt[]> {
    return this.warehouseReceipts
      .filter(w => w.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const newInsight: AiInsight = {
      id: this.nextId++,
      ...insight,
      createdAt: new Date(),
    };
    this.aiInsights.push(newInsight);
    return newInsight;
  }

  async getAiInsightsByUser(userId: string): Promise<AiInsight[]> {
    return this.aiInsights
      .filter(i => i.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: this.nextId++,
      ...message,
      createdAt: new Date(),
    };
    this.chatMessages.push(newMessage);
    return newMessage;
  }

  async getChatMessagesByUser(userId: string): Promise<ChatMessage[]> {
    return this.chatMessages
      .filter(m => m.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-50);
  }

  async createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent> {
    const newEvent: TrackingEvent = {
      id: this.nextId++,
      ...event,
      timestamp: new Date(),
    };
    this.trackingEvents.push(newEvent);
    return newEvent;
  }

  private initializeSampleData() {
    const sampleUserId = 'demo_user';
    
    // Create sample user
    this.users.push({
      id: sampleUserId,
      email: 'demo@apemax.com',
      passwordHash: '$2b$10$sampleHashForDemo',
      createdAt: new Date(),
    });

    // Create sample shipments
    const sampleShipments: Shipment[] = [
      {
        id: 1,
        trackingNumber: 'MAEU12345',
        origin: 'Miami, FL',
        destination: 'Cartagena, CO',
        status: 'in_transit',
        carrier: 'Maersk',
        estimatedCost: '2450.00',
        expectedDeliveryDate: new Date('2025-07-15'),
        actualDeliveryDate: null,
        isOnTime: true,
        userId: sampleUserId,
        createdAt: new Date(),
      },
      {
        id: 2,
        trackingNumber: 'TQL98765',
        origin: 'Houston, TX',
        destination: 'Santos, BR',
        status: 'in_transit',
        carrier: 'TQL',
        estimatedCost: '1850.00',
        expectedDeliveryDate: new Date('2025-07-10'),
        actualDeliveryDate: null,
        isOnTime: true,
        userId: sampleUserId,
        createdAt: new Date(),
      },
      {
        id: 3,
        trackingNumber: 'COSCO54321',
        origin: 'Los Angeles, CA',
        destination: 'Lima, PE',
        status: 'in_transit',
        carrier: 'COSCO',
        estimatedCost: '3200.00',
        expectedDeliveryDate: new Date('2025-07-20'),
        actualDeliveryDate: null,
        isOnTime: true,
        userId: sampleUserId,
        createdAt: new Date(),
      }
    ];
    this.shipments.push(...sampleShipments);

    // Create sample bookings
    const sampleBookings: Booking[] = [
      {
        id: 1,
        bookingNumber: 'BK1751175000001',
        origin: 'Miami, FL',
        destination: 'Panama City, PA',
        status: 'pending',
        serviceType: 'LCL',
        volume: '15.5',
        weight: '2500.00',
        estimatedCost: '1250.00',
        userId: sampleUserId,
        createdAt: new Date(),
      }
    ];
    this.bookings.push(...sampleBookings);

    // Create sample consolidation
    this.consolidations.push({
      id: 1,
      planName: 'MIA-SANTOS-W25',
      route: 'Miami → Santos',
      currentVolume: '45.00',
      maxVolume: '60.00',
      bookingCount: 8,
      etd: new Date('2025-07-05'),
      status: 'planning',
      userId: sampleUserId,
      createdAt: new Date(),
    });

    // Create sample warehouse receipts
    const sampleReceipts: WarehouseReceipt[] = [
      {
        id: 1,
        receiptNumber: 'WR23205',
        description: 'Electronics shipment',
        quantity: 12,
        unit: 'Pallets',
        category: 'Electronics',
        status: 'received',
        userId: sampleUserId,
        createdAt: new Date(),
      },
      {
        id: 2,
        receiptNumber: 'WR23204',
        description: 'Machinery parts',
        quantity: 2,
        unit: 'Crates',
        category: 'Machinery',
        status: 'processed',
        userId: sampleUserId,
        createdAt: new Date(),
      },
      {
        id: 3,
        receiptNumber: 'WR23203',
        description: 'Apparel items',
        quantity: 50,
        unit: 'Boxes',
        category: 'Apparel',
        status: 'received',
        userId: sampleUserId,
        createdAt: new Date(),
      }
    ];
    this.warehouseReceipts.push(...sampleReceipts);

    // Create sample AI insights
    const sampleInsights: AiInsight[] = [
      {
        id: 1,
        type: 'alert',
        title: 'Alert',
        message: 'Shipment #MAEU12345 is delayed by 2 days.',
        actionText: 'Notify Consignee',
        actionUrl: '#',
        isRead: false,
        userId: sampleUserId,
        createdAt: new Date(),
      },
      {
        id: 2,
        type: 'opportunity',
        title: 'Opportunity',
        message: 'Consolidate your 4 LCL shipments to Panama this week to save an estimated $800.',
        actionText: 'Create Plan',
        actionUrl: '#',
        isRead: false,
        userId: sampleUserId,
        createdAt: new Date(),
      },
      {
        id: 3,
        type: 'info',
        title: 'Info',
        message: 'Market rates for shipments to Brazil have dropped by 5% this week.',
        actionText: null,
        actionUrl: null,
        isRead: false,
        userId: sampleUserId,
        createdAt: new Date(),
      }
    ];
    this.aiInsights.push(...sampleInsights);

    // Create sample tracking events
    const sampleTrackingEvents: TrackingEvent[] = [
      {
        id: 1,
        shipmentId: 1,
        eventType: 'ship',
        location: 'Cartagena, CO',
        description: 'At port in Cartagena, CO',
        timestamp: new Date(),
      },
      {
        id: 2,
        shipmentId: 2,
        eventType: 'truck',
        location: 'Houston, TX',
        description: 'On truck, arriving tomorrow',
        timestamp: new Date(),
      },
      {
        id: 3,
        shipmentId: 3,
        eventType: 'warehouse',
        location: 'CFS Miami',
        description: 'At CFS, awaiting consolidation',
        timestamp: new Date(),
      }
    ];
    this.trackingEvents.push(...sampleTrackingEvents);

    this.nextId = 100; // Start IDs from 100 to avoid conflicts
  }

  private initializeSampleProfiles() {
    // Create sample profile for default user
    const sampleProfile: Profile = {
      id: 'profile_1',
      userId: 'user_1',
      email: 'ricardo.lopes@apemax.com',
      name: 'Ricardo Lopes',
      company: 'APE MAXX Logistics',
      phone: '+1 (305) 555-0123',
      language: 'en',
      llmApiKey: null,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Experienced logistics manager with 8+ years in international freight and supply chain optimization.',
      location: 'Miami, FL',
      website: 'https://apemax.com',
      jobTitle: 'Senior Logistics Manager',
      organizationId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profiles.push(sampleProfile);
  }

  // Extended Warehouse Methods
  async getWarehouseReceipts(userId: string, limit?: number, locationId?: string | null, status?: string | null): Promise<WarehouseReceipt[]> {
    let receipts = this.warehouseReceipts.filter(receipt => receipt.userId === userId);
    
    if (status) receipts = receipts.filter(receipt => receipt.status === status);
    if (limit) receipts = receipts.slice(0, limit);
    
    return receipts;
  }

  async getWarehouseReceiptsByLocation(userId: string): Promise<Record<string, WarehouseReceipt[]>> {
    const receipts = await this.getWarehouseReceipts(userId, 100);
    
    const groupedByLocation: Record<string, WarehouseReceipt[]> = {};
    receipts.forEach(receipt => {
      const location = 'Default Location';
      if (!groupedByLocation[location]) {
        groupedByLocation[location] = [];
      }
      groupedByLocation[location].push(receipt);
    });

    return groupedByLocation;
  }

  async searchWarehouseReceipts(userId: string, searchTerm: string): Promise<WarehouseReceipt[]> {
    return this.warehouseReceipts.filter(receipt => 
      receipt.userId === userId &&
      (receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       receipt.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
      const status = receipt.status || 'received_on_hand';
      stats.by_status[status] = (stats.by_status[status] || 0) + 1;

      const location = 'Default Location';
      stats.by_location[location] = (stats.by_location[location] || 0) + 1;

      stats.total_pieces += receipt.quantity || 0;
    });

    return stats;
  }
}