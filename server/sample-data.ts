import { storage } from './storage';
import type { InsertShipment, InsertBooking, InsertConsolidation, InsertWarehouseReceipt, InsertAiInsight, InsertTrackingEvent } from '@shared/schema';

export async function createSampleData(userId: string) {
  try {
    // Create sample shipments
    const sampleShipments: InsertShipment[] = [
      {
        trackingNumber: 'MAEU12345',
        origin: 'Miami, FL',
        destination: 'Cartagena, CO',
        status: 'in_transit',
        carrier: 'Maersk',
        estimatedCost: '2450.00',
        expectedDeliveryDate: new Date('2025-07-15'),
        isOnTime: true,
        userId,
      },
      {
        trackingNumber: 'TQL98765',
        origin: 'Houston, TX', 
        destination: 'Santos, BR',
        status: 'delivered',
        carrier: 'TQL',
        estimatedCost: '1850.00',
        actualDeliveryDate: new Date('2025-06-25'),
        expectedDeliveryDate: new Date('2025-06-25'),
        isOnTime: true,
        userId,
      },
      {
        trackingNumber: 'COSCO54321',
        origin: 'Los Angeles, CA',
        destination: 'Lima, PE',
        status: 'in_transit',
        carrier: 'COSCO',
        estimatedCost: '3200.00',
        expectedDeliveryDate: new Date('2025-07-20'),
        isOnTime: true,
        userId,
      }
    ];

    for (const shipment of sampleShipments) {
      await storage.createShipment(shipment);
    }

    // Create sample bookings
    const sampleBookings: InsertBooking[] = [
      {
        bookingNumber: 'BK1751175000001',
        origin: 'Miami, FL',
        destination: 'Panama City, PA',
        status: 'pending',
        serviceType: 'LCL',
        volume: '15.5',
        weight: '2500.00',
        estimatedCost: '1250.00',
        userId,
      },
      {
        bookingNumber: 'BK1751175000002',
        origin: 'Houston, TX',
        destination: 'Guayaquil, EC',
        status: 'pending',
        serviceType: 'LCL',
        volume: '8.2',
        weight: '1200.00',
        estimatedCost: '850.00',
        userId,
      }
    ];

    for (const booking of sampleBookings) {
      await storage.createBooking(booking);
    }

    // Create sample consolidation
    const sampleConsolidation: InsertConsolidation = {
      planName: 'MIA-SANTOS-W25',
      route: 'Miami → Santos',
      currentVolume: '45.00',
      maxVolume: '60.00',
      bookingCount: 8,
      etd: new Date('2025-07-05'),
      status: 'planning',
      userId,
    };

    await storage.createConsolidation(sampleConsolidation);

    // Create sample warehouse receipts
    const sampleReceipts: InsertWarehouseReceipt[] = [
      {
        receiptNumber: 'WR23205',
        description: 'Electronics shipment',
        quantity: 12,
        unit: 'Pallets',
        category: 'Electronics',
        status: 'received',
        userId,
      },
      {
        receiptNumber: 'WR23204',
        description: 'Machinery parts',
        quantity: 2,
        unit: 'Crates',
        category: 'Machinery',
        status: 'processed',
        userId,
      },
      {
        receiptNumber: 'WR23203',
        description: 'Apparel items',
        quantity: 50,
        unit: 'Boxes',
        category: 'Apparel',
        status: 'received',
        userId,
      }
    ];

    for (const receipt of sampleReceipts) {
      await storage.createWarehouseReceipt(receipt);
    }

    // Create sample AI insights
    const sampleInsights: InsertAiInsight[] = [
      {
        type: 'alert',
        title: 'Alert',
        message: 'Shipment #MAEU12345 is delayed by 2 days.',
        actionText: 'Notify Consignee',
        actionUrl: '#',
        isRead: false,
        userId,
      },
      {
        type: 'opportunity',
        title: 'Opportunity',
        message: 'Consolidate your 4 LCL shipments to Panama this week to save an estimated $800.',
        actionText: 'Create Plan',
        actionUrl: '#',
        isRead: false,
        userId,
      },
      {
        type: 'info',
        title: 'Info',
        message: 'Market rates for shipments to Brazil have dropped by 5% this week.',
        isRead: false,
        userId,
      }
    ];

    for (const insight of sampleInsights) {
      await storage.createAiInsight(insight);
    }

    // Get shipment IDs for tracking events
    const shipments = await storage.getShipmentsByUser(userId);
    
    // Create sample tracking events
    const sampleTrackingEvents: InsertTrackingEvent[] = [
      {
        shipmentId: shipments[0]?.id || 1,
        eventType: 'ship',
        location: 'Cartagena, CO',
        description: 'At port in Cartagena, CO',
      },
      {
        shipmentId: shipments[2]?.id || 3,
        eventType: 'truck',
        location: 'Houston, TX',
        description: 'On truck, arriving tomorrow',
      },
      {
        shipmentId: shipments[1]?.id || 2,
        eventType: 'warehouse',
        location: 'CFS Miami',
        description: 'At CFS, awaiting consolidation',
      }
    ];

    for (const event of sampleTrackingEvents) {
      await storage.createTrackingEvent(event);
    }

    console.log('✅ Sample data created successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return false;
  }
}