import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema, insertChatMessageSchema } from "@shared/schema";
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
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, passwordHash } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(passwordHash, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        passwordHash: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: user.id, email: user.email },
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
      
      // Find user (auto-creates in demo mode)
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In demo mode (MemoryStorage), accept any password
      const isUsingMemoryStorage = storage.constructor.name === 'MemoryStorage';
      const isValidPassword = isUsingMemoryStorage || await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({
      user: { id: req.user.id, email: req.user.email },
    });
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

  const httpServer = createServer(app);
  return httpServer;
}
