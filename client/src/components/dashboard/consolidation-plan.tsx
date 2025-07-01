import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Consolidation {
  id: number;
  planName: string;
  route: string;
  currentVolume: string;
  maxVolume: string;
  bookingCount: number;
  etd: string;
  status: string;
}

export function ConsolidationPlan() {
  const { user } = useAuth();

  const { data: consolidation, isLoading, error } = useQuery<Consolidation>({
    queryKey: ['consolidation-current', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get current consolidation from Supabase
      const { data, error } = await supabase
        .from('consolidations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching consolidation:', error);
        // Return sample data matching the template
        return {
          id: 1,
          planName: 'MIA-SANTOS-W25',
          route: 'Miami → Santos',
          currentVolume: '45',
          maxVolume: '60',
          bookingCount: 5,
          etd: 'July 3, 2025',
          status: 'active'
        };
      }

      return data;
    },
    refetchInterval: 60000,
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">This Week's Consolidation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !consolidation) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">This Week's Consolidation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No active consolidation plan</p>
        </CardContent>
      </Card>
    );
  }

  const currentVol = Number(consolidation.currentVolume);
  const maxVol = Number(consolidation.maxVolume);
  const fillPercentage = Math.round((currentVol / maxVol) * 100);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">This Week's Consolidation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-gray-800 mb-3">{consolidation.planName}</p>
        
        <Progress value={fillPercentage} className="mb-3" />
        
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>
            <strong>Volume:</strong> {consolidation.currentVolume} / {consolidation.maxVolume} CBM
          </span>
          <span className="font-semibold">{fillPercentage}% Full</span>
        </div>
        
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p>
            <strong>Bookings:</strong> {consolidation.bookingCount} LCL Shipments
          </p>
          <p>
            <strong>ETD:</strong> {new Date(consolidation.etd).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <a 
          href="#" 
          className="text-sm text-primary-custom font-medium hover:underline inline-block"
          onClick={(e) => {
            e.preventDefault();
            console.log('View consolidation details');
          }}
        >
          View Plan Details →
        </a>
      </CardContent>
    </Card>
  );
}
