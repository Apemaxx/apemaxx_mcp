import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const createReceiptSchema = z.object({
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.string().min(1, 'Status is required'),
  supplierName: z.string().optional(),
  receivedDate: z.string().optional(),
  inspectionNotes: z.string().optional(),
  warehouseLocation: z.string().optional(),
  totalValue: z.number().min(0).optional(),
});

type CreateReceiptFormData = z.infer<typeof createReceiptSchema>;

interface CreateWarehouseReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWarehouseReceiptDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateWarehouseReceiptDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CreateReceiptFormData>({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      receiptNumber: '',
      description: '',
      quantity: 1,
      unit: 'Pallets',
      category: 'General',
      status: 'received',
      supplierName: '',
      receivedDate: new Date().toISOString().split('T')[0],
      inspectionNotes: '',
      warehouseLocation: '',
      totalValue: 0,
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: async (data: CreateReceiptFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Start with minimal required fields and add optional ones
      const receiptData: any = {
        user_id: user.id,
        receipt_number: data.receiptNumber || `WR-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add optional fields if they exist in the table structure
      if (data.description) receiptData.description = data.description;
      if (data.quantity) receiptData.quantity = data.quantity;
      if (data.unit) receiptData.unit = data.unit;
      if (data.category) receiptData.category = data.category;
      if (data.status) receiptData.status = data.status;
      if (data.supplierName) receiptData.supplier_name = data.supplierName;
      if (data.receivedDate) receiptData.received_date = new Date(data.receivedDate).toISOString();
      if (data.inspectionNotes) receiptData.inspection_notes = data.inspectionNotes;
      if (data.warehouseLocation) receiptData.warehouse_location = data.warehouseLocation;
      if (data.totalValue) receiptData.total_value = data.totalValue;

      console.log('Creating warehouse receipt with data:', receiptData);

      const { data: result, error } = await supabase
        .from('warehouse_receipts')
        .insert([receiptData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Successfully created warehouse receipt:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Warehouse receipt created successfully',
      });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error creating warehouse receipt:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create warehouse receipt',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateReceiptFormData) => {
    createReceiptMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Warehouse Receipt</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="receiptNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="WR-2025-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the received items..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pallets">Pallets</SelectItem>
                        <SelectItem value="Crates">Crates</SelectItem>
                        <SelectItem value="Boxes">Boxes</SelectItem>
                        <SelectItem value="Pieces">Pieces</SelectItem>
                        <SelectItem value="Tons">Tons</SelectItem>
                        <SelectItem value="Kg">Kilograms</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Textiles">Textiles</SelectItem>
                        <SelectItem value="Food">Food & Beverage</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="Pharmaceutical">Pharmaceutical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warehouseLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Location</FormLabel>
                    <FormControl>
                      <Input placeholder="A1-B2-C3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Value ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="inspectionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any inspection notes or observations..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createReceiptMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createReceiptMutation.isPending}
                className="gap-2"
              >
                {createReceiptMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Receipt
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}