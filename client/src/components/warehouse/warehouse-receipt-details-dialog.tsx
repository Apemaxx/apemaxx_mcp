import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  Upload, 
  Download,
  Trash2,
  Edit,
  Eye,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

interface WarehouseReceiptDetailsDialogProps {
  receipt: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function WarehouseReceiptDetailsDialog({ 
  receipt, 
  open, 
  onOpenChange, 
  onUpdate 
}: WarehouseReceiptDetailsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState('document');

  const { data: attachments, isLoading: attachmentsLoading, refetch: refetchAttachments } = useQuery({
    queryKey: ['warehouse-receipt-attachments', receipt?.id],
    queryFn: async () => {
      if (!receipt?.id) return [];
      
      const { data, error } = await supabase
        .from('warehouse_receipt_attachments')
        .select('*')
        .eq('warehouse_receipt_id', receipt.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!receipt?.id && open,
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!receipt?.id || !user?.id) throw new Error('Missing required data');

      // Create file URL (in real implementation, upload to Supabase Storage)
      const fileUrl = `https://example.com/uploads/${file.name}`;
      
      const attachmentData = {
        warehouse_receipt_id: receipt.id,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type,
        attachment_type: attachmentType,
        uploaded_by: user.id,
      };

      const { data, error } = await supabase
        .from('warehouse_receipt_attachments')
        .insert([attachmentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attachment uploaded successfully',
      });
      setSelectedFile(null);
      refetchAttachments();
    },
    onError: (error: any) => {
      console.error('Error uploading attachment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload attachment',
        variant: 'destructive',
      });
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const { error } = await supabase
        .from('warehouse_receipt_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attachment deleted successfully',
      });
      refetchAttachments();
    },
    onError: (error: any) => {
      console.error('Error deleting attachment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete attachment',
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAttachmentTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'packing_list': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'photo': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      uploadAttachmentMutation.mutate(selectedFile);
    }
  };

  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Warehouse Receipt Details
            </DialogTitle>
            <Badge className={getStatusColor(receipt.status)}>
              {receipt.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Receipt Details</TabsTrigger>
            <TabsTrigger value="attachments">
              Attachments ({attachments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Receipt Number</label>
                    <p className="text-sm font-mono">{receipt.receipt_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm">{receipt.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantity</label>
                      <p className="text-sm">{receipt.quantity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Unit</label>
                      <p className="text-sm">{receipt.unit}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm">{receipt.category}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {receipt.supplier_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Supplier</label>
                      <p className="text-sm">{receipt.supplier_name}</p>
                    </div>
                  )}
                  {receipt.received_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Received Date</label>
                      <p className="text-sm">{format(new Date(receipt.received_date), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                  {receipt.warehouse_location && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Warehouse Location</label>
                      <p className="text-sm">{receipt.warehouse_location}</p>
                    </div>
                  )}
                  {receipt.total_value && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Value</label>
                      <p className="text-sm">${parseFloat(receipt.total_value).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-sm">{format(new Date(receipt.created_at), 'MMMM d, yyyy at h:mm a')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inspection Notes */}
            {receipt.inspection_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inspection Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{receipt.inspection_notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Attachment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Select File
                      </label>
                      <Input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Attachment Type
                      </label>
                      <select
                        value={attachmentType}
                        onChange={(e) => setAttachmentType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="document">Document</option>
                        <option value="invoice">Invoice</option>
                        <option value="packing_list">Packing List</option>
                        <option value="photo">Photo</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || uploadAttachmentMutation.isPending}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Attachment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attachments List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Existing Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                {attachmentsLoading ? (
                  <div className="text-center py-4">Loading attachments...</div>
                ) : attachments?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No attachments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attachments?.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{attachment.file_name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge className={getAttachmentTypeColor(attachment.attachment_type)}>
                                {attachment.attachment_type.replace('_', ' ')}
                              </Badge>
                              {attachment.file_size && (
                                <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                              )}
                              <span>{format(new Date(attachment.created_at), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(attachment.file_url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(attachment.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                            disabled={deleteAttachmentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}