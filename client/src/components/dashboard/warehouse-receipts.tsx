import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CreateWarehouseReceiptDialog } from '@/components/warehouse/create-warehouse-receipt-dialog';

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
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

  // Sample data matching the template format from the image
  const sampleReceipts = [
    {
      id: 1,
      receiptNumber: 'WR2305',
      description: '15 Pallets / Electronics',
      quantity: 15,
      unit: 'Pallets',
      category: 'Electronics',
      status: 'received',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      receiptNumber: 'WR2304',
      description: '2 Crates / Machinery',
      quantity: 2,
      unit: 'Crates',
      category: 'Machinery',
      status: 'received',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      receiptNumber: 'WR2303',
      description: '50 Boxes / Apparel',
      quantity: 50,
      unit: 'Boxes',
      category: 'Apparel',
      status: 'received',
      createdAt: new Date().toISOString()
    }
  ];

  // Use real data if available, otherwise show sample data
  const displayReceipts = receipts && receipts.length > 0 ? receipts.slice(0, 3) : sampleReceipts;

  return (
    <>
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Warehouse Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {displayReceipts.map((receipt) => (
              <li key={receipt.id} className="text-sm flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-700">{receipt.receiptNumber}</div>
                  <div className="text-gray-500">
                    {receipt.description || `${receipt.quantity} ${receipt.unit} / ${receipt.category}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  View
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <CreateWarehouseReceiptDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          console.log('Warehouse receipt created successfully');
        }}
      />
    </>
  );
}
