import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { supabase } from "./supabase";
import { insertUserSchema, insertBookingSchema, insertChatMessageSchema, insertProfileSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // For Supabase users, we just trust our JWT and use the userId
    req.user = { id: decoded.userId, email: null };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Use Supabase Auth for registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Supabase registration error:", error);
        return res.status(400).json({ message: error.message });
      }

      if (!data.user) {
        return res.status(400).json({ message: "Registration failed" });
      }

      // Generate JWT for our app
      const token = jwt.sign({ userId: data.user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: data.user.id, email: data.user.email },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Use Supabase Auth for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        console.error("Supabase login error:", error?.message);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT for our app
      const token = jwt.sign({ userId: data.user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: data.user.id, email: data.user.email },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Exchange Supabase token for JWT
  app.post("/api/auth/supabase-token", async (req, res) => {
    try {
      const { supabaseToken } = req.body;
      
      if (!supabaseToken) {
        return res.status(400).json({ message: "Supabase token required" });
      }

      // Verify the Supabase token and get user
      const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);

      if (error || !user) {
        console.error("Supabase token verification error:", error?.message);
        return res.status(401).json({ message: "Invalid Supabase token" });
      }

      // Generate JWT for our app
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (error) {
      console.error("Token exchange error:", error);
      res.status(400).json({ message: "Token exchange failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const profile = await storage.getProfile(req.user.id);
      res.json({
        user: { 
          id: req.user.id, 
          email: req.user.email,
          profile: profile || null
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.json({
        user: { id: req.user.id, email: req.user.email, profile: null },
      });
    }
  });

  // Profile routes
  app.get("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const profile = await storage.getProfile(req.user.id);
      res.json(profile || null);
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const profileData = insertProfileSchema.parse({ ...req.body, userId: req.user.id });
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const profileData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.user.id, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // GET endpoint for fetching user profile
  app.get("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const profile = await storage.getProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // PATCH endpoint for profile updates (including profit settings)
  app.patch("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const profileData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.user.id, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Initialize sample data for user (SaaS functionality)
  app.post("/api/initialize-sample-data", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Create sample shipments
      const sampleShipments = [
        {
          trackingNumber: `TRK${Date.now()}001`,
          origin: "Miami, FL",
          destination: "Santos, Brazil",
          status: "in_transit",
          carrier: "APE MAXX Express",
          estimatedCost: "3450.00",
          expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          isOnTime: true,
          userId
        },
        {
          trackingNumber: `TRK${Date.now()}002`,
          origin: "Los Angeles, CA",
          destination: "Shanghai, China",
          status: "delivered",
          carrier: "Global Freight",
          estimatedCost: "5200.00",
          actualDeliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          expectedDeliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isOnTime: true,
          userId
        }
      ];

      // Create sample bookings
      const sampleBookings = [
        {
          bookingNumber: `BKG${Date.now()}001`,
          origin: "Houston, TX",
          destination: "Hamburg, Germany",
          status: "pending",
          serviceType: "Sea Freight",
          estimatedCost: "4200.00",
          volume: "40ft Container",
          weight: "25000kg",
          userId
        }
      ];

      // Create the data
      for (const shipment of sampleShipments) {
        await storage.createShipment(shipment);
      }
      
      for (const booking of sampleBookings) {
        await storage.createBooking(booking);
      }

      // Create sample AI insights
      await storage.createAiInsight({
        title: "Route Optimization Suggestion",
        message: "Consider consolidating your Miami-Santos shipments to reduce costs by 15%",
        type: "optimization",
        actionUrl: "/consolidation",
        actionText: "View Details",
        isRead: false,
        userId
      });

      res.json({ message: "Sample data initialized successfully" });
    } catch (error) {
      console.error("Initialize sample data error:", error);
      res.status(500).json({ message: "Failed to initialize sample data" });
    }
  });

  // Dashboard data routes
  app.get("/api/kpi-metrics", authenticateToken, async (req: any, res) => {
    try {
      const metrics = await storage.getKPIMetrics(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("KPI metrics error:", error);
      res.status(500).json({ message: "Failed to fetch KPI metrics" });
    }
  });

  app.get("/api/consolidation/current", authenticateToken, async (req: any, res) => {
    try {
      const consolidation = await storage.getCurrentConsolidation(req.user.id);
      res.json(consolidation);
    } catch (error) {
      console.error("Current consolidation error:", error);
      res.status(500).json({ message: "Failed to fetch current consolidation" });
    }
  });

  app.get("/api/ai-insights", authenticateToken, async (req: any, res) => {
    try {
      const insights = await storage.getAiInsightsByUser(req.user.id);
      res.json(insights);
    } catch (error) {
      console.error("AI insights error:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  app.get("/api/tracking-events", authenticateToken, async (req: any, res) => {
    try {
      const events = await storage.getRecentTrackingEvents(req.user.id);
      res.json(events);
    } catch (error) {
      console.error("Tracking events error:", error);
      res.status(500).json({ message: "Failed to fetch tracking events" });
    }
  });

  app.get("/api/warehouse-receipts", authenticateToken, async (req: any, res) => {
    try {
      const receipts = await storage.getRecentWarehouseReceipts(req.user.id);
      res.json(receipts);
    } catch (error) {
      console.error("Warehouse receipts error:", error);
      res.status(500).json({ message: "Failed to fetch warehouse receipts" });
    }
  });

  app.get("/api/chat-messages", authenticateToken, async (req: any, res) => {
    try {
      const messages = await storage.getChatMessagesByUser(req.user.id);
      res.json(messages);
    } catch (error) {
      console.error("Chat messages error:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Create new booking
  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
        bookingNumber: `BK${Date.now()}`,
        status: 'pending',
      });
      
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  // Send chat message
  app.post("/api/chat-messages", authenticateToken, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      // Save user message
      const userMessage = await storage.createChatMessage({
        userId: req.user.id,
        message,
        isFromUser: true,
      });

      // Generate AI response (mock for now)
      const aiResponse = "Thank you for your message. I'm here to help with your logistics operations.";
      
      const aiMessage = await storage.createChatMessage({
        userId: req.user.id,
        message: aiResponse,
        isFromUser: false,
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Send chat message error:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Profit upload endpoint
  app.post("/api/profit/upload", authenticateToken, async (req: any, res) => {
    try {
      // For now, just acknowledge the upload
      // In a real implementation, you would parse the CSV/Excel file
      res.json({ 
        message: "Profit margins uploaded successfully",
        status: "success"
      });
    } catch (error) {
      console.error("Profit upload error:", error);
      res.status(400).json({ message: "Failed to upload profit data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
