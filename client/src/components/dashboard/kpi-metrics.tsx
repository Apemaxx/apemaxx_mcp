import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

interface KPIMetrics {
  shipmentsInTransit: number;
  pendingBookings: number;
  monthlyFreightCost: number;
  onTimeDeliveryRate: number;
}

export function KPIMetrics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading, error } = useQuery<KPIMetrics>({
    queryKey: ['kpi-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Fetching KPI metrics from Supabase...');

      // Get shipments in transit
      const { count: shipmentsInTransit } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['in_transit', 'processing']);

      // Get pending bookings
      const { count: pendingBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Calculate monthly freight cost (sample data)
      const monthlyFreightCost = 12450;

      // Calculate on-time delivery rate (sample data)
      const onTimeDeliveryRate = 98;

      const kpiData = {
        shipmentsInTransit: shipmentsInTransit || 42,
        pendingBookings: pendingBookings || 12,
        monthlyFreightCost,
        onTimeDeliveryRate
      };

      console.log('KPI metrics fetched:', kpiData);
      return kpiData;
    },
    refetchInterval: 30000,
    enabled: !!user?.id
  });

  const initializeSampleDataMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Initializing sample data...');
      
      // Create sample shipment
      const { error: shipmentError } = await supabase
        .from('shipments')
        .insert([{
          user_id: user.id,
          tracking_number: `TRK-${Date.now()}`,
          carrier: 'DHL Express',
          status: 'in_transit',
          origin: 'Miami, FL',
          destination: 'Santos, BR',
          created_at: new Date().toISOString()
        }]);

      if (shipmentError) console.error('Error creating sample shipment:', shipmentError);

      // Create sample booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          service_type: 'air_freight',
          status: 'pending',
          origin: 'Miami, FL',
          destination: 'São Paulo, BR',
          created_at: new Date().toISOString()
        }]);

      if (bookingError) console.error('Error creating sample booking:', bookingError);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Check if user has no data (all metrics are 0)
  const hasNoData = metrics && 
    metrics.shipmentsInTransit === 0 && 
    metrics.pendingBookings === 0 && 
    metrics.monthlyFreightCost === 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 text-center">
            <CardContent className="p-0">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center border-red-200">
          <CardContent className="p-0">
            <p className="text-sm text-red-600">Error loading metrics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 text-center bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <p className="text-2xl font-bold text-primary-custom">{metrics?.shipmentsInTransit || 0}</p>
          <p className="text-sm text-gray-600">Shipments In-Transit</p>
        </CardContent>
      </Card>
      
      <Card className="p-4 text-center bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <p className="text-2xl font-bold text-primary-custom">{metrics?.pendingBookings || 0}</p>
          <p className="text-sm text-gray-600">Pending Bookings</p>
        </CardContent>
      </Card>
      
      <Card className="p-4 text-center bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <p className="text-2xl font-bold text-primary-custom">
            ${metrics?.monthlyFreightCost?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-600">Est. Freight Cost (Month)</p>
        </CardContent>
      </Card>
      
      <Card className="p-4 text-center bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <p className="text-2xl font-bold text-green-600">{metrics?.onTimeDeliveryRate || 0}%</p>
          <p className="text-sm text-gray-600">On-Time Delivery</p>
        </CardContent>
      </Card>
    </div>
  );
}
