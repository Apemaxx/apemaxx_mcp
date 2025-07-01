import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Truck, Warehouse } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TrackingEvent {
  id: number;
  shipmentId: number;
  eventType: 'ship' | 'truck' | 'warehouse';
  location: string;
  description: string;
  timestamp: string;
  shipment: {
    trackingNumber: string;
    carrier: string;
  };
}

export function LiveTracking() {
  const { data: events, isLoading, error } = useQuery<TrackingEvent[]>({
    queryKey: ['/api/tracking-events'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ship':
        return <Ship className="w-5 h-5 text-blue-500" />;
      case 'truck':
        return <Truck className="w-5 h-5 text-green-500" />;
      case 'warehouse':
        return <Warehouse className="w-5 h-5 text-orange-500" />;
      default:
        return <Ship className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Live Tracking Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Live Tracking Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading tracking events</p>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Live Tracking Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No recent tracking events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Live Tracking Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-3">
              {getEventIcon(event.eventType)}
              <div>
                <p className="font-medium text-gray-800">
                  #{event.shipment.trackingNumber}{' '}
                  <span className="text-xs text-gray-500">({event.shipment.carrier})</span>
                </p>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
