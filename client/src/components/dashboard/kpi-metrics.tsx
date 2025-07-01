import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Plus } from 'lucide-react';

interface KPIMetrics {
  shipmentsInTransit: number;
  pendingBookings: number;
  monthlyFreightCost: number;
  onTimeDeliveryRate: number;
}

export function KPIMetrics() {
  const { data: metrics, isLoading, error } = useQuery<KPIMetrics>({
    queryKey: ['/api/kpi-metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const initializeSampleDataMutation = useMutation({
    mutationFn: () => apiRequest('/api/initialize-sample-data', 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpi-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
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
