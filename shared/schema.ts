import { pgTable, text, serial, integer, boolean, timestamp, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  jobTitle: text("job_title"),
  organizationId: uuid("organization_id"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull(), // 'in_transit', 'delivered', 'pending', 'delayed'
  carrier: text("carrier").notNull(),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  isOnTime: boolean("is_on_time"),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingNumber: text("booking_number").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull(), // 'pending', 'confirmed', 'completed', 'cancelled'
  serviceType: text("service_type").notNull(), // 'LCL', 'FCL'
  volume: numeric("volume", { precision: 8, scale: 2 }),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consolidations = pgTable("consolidations", {
  id: serial("id").primaryKey(),
  planName: text("plan_name").notNull(),
  route: text("route").notNull(),
  currentVolume: numeric("current_volume", { precision: 8, scale: 2 }).notNull(),
  maxVolume: numeric("max_volume", { precision: 8, scale: 2 }).notNull(),
  bookingCount: integer("booking_count").notNull(),
  etd: timestamp("etd").notNull(),
  status: text("status").notNull(), // 'planning', 'loading', 'shipped', 'completed'
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const warehouseReceipts = pgTable("warehouse_receipts", {
  id: serial("id").primaryKey(),
  receiptNumber: text("receipt_number").notNull().unique(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(), // 'Pallets', 'Crates', 'Boxes'
  category: text("category").notNull(),
  status: text("status").notNull(), // 'received', 'processed', 'shipped'
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'alert', 'opportunity', 'info'
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  actionText: text("action_text"),
  isRead: boolean("is_read").default(false),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trackingEvents = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id).notNull(),
  eventType: text("event_type").notNull(), // 'ship', 'truck', 'warehouse'
  location: text("location").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertConsolidationSchema = createInsertSchema(consolidations).omit({
  id: true,
  createdAt: true,
});

export const insertWarehouseReceiptSchema = createInsertSchema(warehouseReceipts).omit({
  id: true,
  createdAt: true,
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingEventSchema = createInsertSchema(trackingEvents).omit({
  id: true,
  timestamp: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Consolidation = typeof consolidations.$inferSelect;
export type InsertConsolidation = z.infer<typeof insertConsolidationSchema>;
export type WarehouseReceipt = typeof warehouseReceipts.$inferSelect;
export type InsertWarehouseReceipt = z.infer<typeof insertWarehouseReceiptSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = z.infer<typeof insertTrackingEventSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
