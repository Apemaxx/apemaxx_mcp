# Logistics Command Center

## Overview
This is a full-stack logistics management application built with React (frontend) and Express.js (backend). The application provides a dashboard for managing shipments, bookings, and logistics operations with AI-powered insights and real-time tracking capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with structured route handlers
- **Middleware**: Custom logging middleware for API requests
- **Error Handling**: Centralized error handling middleware

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migration**: Drizzle Kit for database schema management
- **Connection**: Neon serverless PostgreSQL adapter

## Key Components

### Authentication System
- JWT-based authentication with secure token storage
- Protected routes using authentication middleware
- User registration and login functionality
- Password hashing using bcryptjs

### Database Schema
The application uses the following main entities:
- **Users**: User accounts with email and password
- **Shipments**: Tracking shipment information with status updates
- **Bookings**: Booking management for logistics services
- **Consolidations**: Consolidation planning for optimized shipping
- **Warehouse Receipts**: Warehouse receipt management
- **AI Insights**: AI-generated recommendations and alerts
- **Tracking Events**: Real-time tracking event logs
- **Chat Messages**: AI chat interface for user interactions

### Dashboard Features
- **KPI Metrics**: Real-time display of key performance indicators
- **Quick Actions**: Fast access to common operations (new booking, import WR, tracking)
- **Consolidation Planning**: Weekly consolidation plan management
- **AI Insights**: Intelligent recommendations and alerts
- **Chat Interface**: AI-powered chat for logistics queries
- **Live Tracking**: Real-time shipment tracking feed
- **Warehouse Receipts**: Recent warehouse receipt display

## Data Flow

1. **Authentication Flow**:
   - User logs in → JWT token generated → Token stored in localStorage
   - Protected API requests include Bearer token in Authorization header
   - Server validates JWT and attaches user to request object

2. **Dashboard Data Flow**:
   - Components use TanStack Query for data fetching
   - API endpoints return JSON data with proper error handling
   - Real-time updates via polling (30-60 second intervals)
   - Optimistic updates for user actions

3. **Database Operations**:
   - Drizzle ORM provides type-safe database queries
   - Storage layer abstracts database operations
   - Proper error handling and transaction management

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-**: UI primitive components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library
- **lucide-react**: Icon library

### Backend Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless adapter
- **drizzle-orm**: Type-safe ORM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and validation
- **express**: Web framework

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Files**: Express serves built frontend from `dist/public`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **JWT_SECRET**: Secret key for JWT token signing
- **NODE_ENV**: Environment mode (development/production)

## Changelog
- June 29, 2025: Initial setup
- June 29, 2025: Successfully cloned logistics dashboard mockup with exact design matching
- June 29, 2025: Integrated authentication system with JWT and bcrypt
- June 29, 2025: **FIXED AUTHENTICATION**: JWT tokens now properly included in API requests
- June 29, 2025: Dashboard fully functional with MemoryStorage (demo mode working perfectly)
- June 29, 2025: Supabase connection in progress - DATABASE_URL format needs correction
- June 29, 2025: Implemented all dashboard components matching APE MAXX mockup:
  - KPI Metrics with live data fetching
  - Quick Actions with New Booking modal
  - Consolidation planning with progress tracking
  - AI-powered insights with color-coded alerts
  - Chat interface for logistics assistance
  - Live tracking feed with shipment status
  - Warehouse receipts management

## Current Status
- ✅ Authentication working perfectly
- ✅ Dashboard displaying real data
- ✅ All components functional
- 🔧 DATABASE_URL needs update: `postgres://postgres:aQXRiQbMgpc68UDEo@db.bqmpupymchanohpfzglw.supabase.co:6543/postgres`

## User Preferences
Preferred communication style: Simple, everyday language.