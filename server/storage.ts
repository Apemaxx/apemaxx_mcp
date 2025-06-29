import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, sql, desc, count } from "drizzle-orm";
import {
  users,
  shipments,
  bookings,
  consolidations,
  warehouseReceipts,
  aiInsights,
  trackingEvents,
  chatMessages,
  type User,
  type InsertUser,
  type Shipment,
  type InsertShipment,
  type Booking,
  type InsertBooking,
  type Consolidation,
  type InsertConsolidation,
  type WarehouseReceipt,
  type InsertWarehouseReceipt,
  type AiInsight,
  type InsertAiInsight,
  type TrackingEvent,
  type InsertTrackingEvent,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";

// Remove the "=" prefix if it exists in the DATABASE_URL
const databaseUrl = process.env.DATABASE_URL?.replace(/^=/, '') || process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const db = drizzle(pool);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // KPI Metrics
  getKPIMetrics(userId: string): Promise<{
    shipmentsInTransit: number;
    pendingBookings: number;
    monthlyFreightCost: number;
    onTimeDeliveryRate: number;
  }>;

  // Shipments
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipmentsByUser(userId: string): Promise<Shipment[]>;
  getRecentTrackingEvents(userId: string): Promise<(TrackingEvent & { shipment: Pick<Shipment, 'trackingNumber' | 'carrier'> })[]>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<Booking[]>;

  // Consolidations
  createConsolidation(consolidation: InsertConsolidation): Promise<Consolidation>;
  getCurrentConsolidation(userId: string): Promise<Consolidation | undefined>;

  // Warehouse Receipts
  createWarehouseReceipt(receipt: InsertWarehouseReceipt): Promise<WarehouseReceipt>;
  getRecentWarehouseReceipts(userId: string): Promise<WarehouseReceipt[]>;

  // AI Insights
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  getAiInsightsByUser(userId: string): Promise<AiInsight[]>;

  // Chat
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByUser(userId: string): Promise<ChatMessage[]>;

  // Tracking Events
  createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getKPIMetrics(userId: string): Promise<{
    shipmentsInTransit: number;
    pendingBookings: number;
    monthlyFreightCost: number;
    onTimeDeliveryRate: number;
  }> {
    const [shipmentsInTransitResult] = await db
      .select({ count: count() })
      .from(shipments)
      .where(and(eq(shipments.userId, userId), eq(shipments.status, 'in_transit')));

    const [pendingBookingsResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(eq(bookings.userId, userId), eq(bookings.status, 'pending')));

    const [monthlyFreightResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${shipments.estimatedCost} AS DECIMAL)), 0)` })
      .from(shipments)
      .where(and(
        eq(shipments.userId, userId),
        sql`DATE_TRUNC('month', ${shipments.createdAt}) = DATE_TRUNC('month', CURRENT_DATE)`
      ));

    const [onTimeDeliveryResult] = await db
      .select({ 
        total: count(),
        onTime: sql<number>`COUNT(CASE WHEN ${shipments.isOnTime} = true THEN 1 END)`
      })
      .from(shipments)
      .where(and(eq(shipments.userId, userId), eq(shipments.status, 'delivered')));

    const onTimeRate = onTimeDeliveryResult.total > 0 
      ? Math.round((onTimeDeliveryResult.onTime / onTimeDeliveryResult.total) * 100)
      : 0;

    return {
      shipmentsInTransit: shipmentsInTransitResult.count,
      pendingBookings: pendingBookingsResult.count,
      monthlyFreightCost: Number(monthlyFreightResult.total),
      onTimeDeliveryRate: onTimeRate,
    };
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const result = await db.insert(shipments).values(shipment).returning();
    return result[0];
  }

  async getShipmentsByUser(userId: string): Promise<Shipment[]> {
    return await db.select().from(shipments).where(eq(shipments.userId, userId));
  }

  async getRecentTrackingEvents(userId: string): Promise<(TrackingEvent & { shipment: Pick<Shipment, 'trackingNumber' | 'carrier'> })[]> {
    const result = await db
      .select({
        id: trackingEvents.id,
        shipmentId: trackingEvents.shipmentId,
        eventType: trackingEvents.eventType,
        location: trackingEvents.location,
        description: trackingEvents.description,
        timestamp: trackingEvents.timestamp,
        trackingNumber: shipments.trackingNumber,
        carrier: shipments.carrier,
      })
      .from(trackingEvents)
      .innerJoin(shipments, eq(trackingEvents.shipmentId, shipments.id))
      .where(eq(shipments.userId, userId))
      .orderBy(desc(trackingEvents.timestamp))
      .limit(10);

    return result.map(row => ({
      id: row.id,
      shipmentId: row.shipmentId,
      eventType: row.eventType,
      location: row.location,
      description: row.description,
      timestamp: row.timestamp,
      shipment: {
        trackingNumber: row.trackingNumber,
        carrier: row.carrier,
      },
    }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async createConsolidation(consolidation: InsertConsolidation): Promise<Consolidation> {
    const result = await db.insert(consolidations).values(consolidation).returning();
    return result[0];
  }

  async getCurrentConsolidation(userId: string): Promise<Consolidation | undefined> {
    const result = await db
      .select()
      .from(consolidations)
      .where(and(eq(consolidations.userId, userId), eq(consolidations.status, 'planning')))
      .orderBy(desc(consolidations.createdAt))
      .limit(1);
    return result[0];
  }

  async createWarehouseReceipt(receipt: InsertWarehouseReceipt): Promise<WarehouseReceipt> {
    const result = await db.insert(warehouseReceipts).values(receipt).returning();
    return result[0];
  }

  async getRecentWarehouseReceipts(userId: string): Promise<WarehouseReceipt[]> {
    return await db
      .select()
      .from(warehouseReceipts)
      .where(eq(warehouseReceipts.userId, userId))
      .orderBy(desc(warehouseReceipts.createdAt))
      .limit(10);
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const result = await db.insert(aiInsights).values(insight).returning();
    return result[0];
  }

  async getAiInsightsByUser(userId: string): Promise<AiInsight[]> {
    return await db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.userId, userId))
      .orderBy(desc(aiInsights.createdAt))
      .limit(10);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async getChatMessagesByUser(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(50);
  }

  async createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent> {
    const result = await db.insert(trackingEvents).values(event).returning();
    return result[0];
  }
}

import { MemoryStorage } from './memory-storage';

// Use memory storage temporarily until database is properly connected
const isValidPostgresUrl = process.env.DATABASE_URL && 
  process.env.DATABASE_URL.startsWith('postgresql://') && 
  !process.env.DATABASE_URL.includes('https://');

export const storage = isValidPostgresUrl ? new DbStorage() : new MemoryStorage();

console.log('📊 Using storage:', storage.constructor.name);
