import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WarehouseReceipt {
  id: number;
  receiptNumber: string;
  description: string;
  quantity: number;
  unit: string;
  category: string;
  status: string;
  createdAt: string;
}

export function WarehouseReceipts() {
  const { data: receipts, isLoading, error } = useQuery<WarehouseReceipt[]>({
    queryKey: ['/api/warehouse-receipts'],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Warehouse Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="text-sm flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
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
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Warehouse Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading warehouse receipts</p>
        </CardContent>
      </Card>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Warehouse Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No warehouse receipts found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Warehouse Receipts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {receipts.map((receipt) => (
            <li key={receipt.id} className="text-sm flex justify-between items-center">
              <span className="font-medium text-gray-700">{receipt.receiptNumber}</span>
              <span className="text-gray-500">
                {receipt.quantity} {receipt.unit} / {receipt.category}
              </span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('View receipt:', receipt.id);
                }}
                className="text-primary-custom hover:underline"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
