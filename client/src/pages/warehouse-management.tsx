import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WarehouseReceiptsList } from '@/components/warehouse/warehouse-receipts-list';
import { Link } from 'wouter';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  FileText,
  Activity,
  Home
} from 'lucide-react';

export default function WarehouseManagement() {
  const { user } = useAuth();

  const { data: warehouseStats, isLoading: statsLoading } = useQuery({
    queryKey: ['warehouse-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: receipts, error } = await supabase
        .from('warehouse_receipts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalReceipts = receipts?.length || 0;
      const receivedCount = receipts?.filter(r => r.status === 'received').length || 0;
      const processedCount = receipts?.filter(r => r.status === 'processed').length || 0;
      const shippedCount = receipts?.filter(r => r.status === 'shipped').length || 0;
      
      const totalValue = receipts?.reduce((sum, r) => sum + (parseFloat(r.total_value) || 0), 0) || 0;
      const totalQuantity = receipts?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;

      // Recent receipts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentReceipts = receipts?.filter(r => new Date(r.created_at) >= thirtyDaysAgo).length || 0;

      return {
        totalReceipts,
        receivedCount,
        processedCount,
        shippedCount,
        totalValue,
        totalQuantity,
        recentReceipts,
        receipts: receipts || []
      };
    },
    enabled: !!user?.id,
  });

  const { data: attachmentStats, isLoading: attachmentStatsLoading } = useQuery({
    queryKey: ['warehouse-attachment-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: attachments, error } = await supabase
        .from('warehouse_receipt_attachments')
        .select('*')
        .eq('uploaded_by', user.id);

      if (error) throw error;

      const totalAttachments = attachments?.length || 0;
      const invoiceCount = attachments?.filter(a => a.attachment_type === 'invoice').length || 0;
      const packingListCount = attachments?.filter(a => a.attachment_type === 'packing_list').length || 0;
      const photoCount = attachments?.filter(a => a.attachment_type === 'photo').length || 0;
      const documentCount = attachments?.filter(a => a.attachment_type === 'document').length || 0;

      return {
        totalAttachments,
        invoiceCount,
        packingListCount,
        photoCount,
        documentCount
      };
    },
    enabled: !!user?.id,
  });

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`rounded-lg p-3 bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Navigation Bar */}
      <nav className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/warehouse">
            <Button variant="ghost" className="gap-2 bg-blue-50 dark:bg-blue-900/20">
              <Package className="h-4 w-4" />
              Warehouse Management
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your warehouse receipts, attachments, and inventory operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Receipts"
          value={warehouseStats?.totalReceipts || 0}
          subtitle="All warehouse receipts"
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Value"
          value={`$${warehouseStats?.totalValue?.toLocaleString() || '0'}`}
          subtitle="Inventory value"
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Recent Receipts"
          value={warehouseStats?.recentReceipts || 0}
          subtitle="Last 30 days"
          color="orange"
        />
        <StatCard
          icon={FileText}
          title="Attachments"
          value={attachmentStats?.totalAttachments || 0}
          subtitle="Total files"
          color="purple"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Received</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {warehouseStats?.receivedCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Processed</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {warehouseStats?.processedCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Shipped</span>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                  {warehouseStats?.shippedCount || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Attachment Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Invoices</span>
                <Badge variant="outline">{attachmentStats?.invoiceCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Packing Lists</span>
                <Badge variant="outline">{attachmentStats?.packingListCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Photos</span>
                <Badge variant="outline">{attachmentStats?.photoCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Documents</span>
                <Badge variant="outline">{attachmentStats?.documentCount || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                New Receipt
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="receipts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="receipts">Warehouse Receipts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-6">
          <WarehouseReceiptsList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Advanced analytics and reporting features coming soon
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Inventory Turnover</h4>
                    <p className="text-sm text-gray-600">Track how quickly inventory moves</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Storage Efficiency</h4>
                    <p className="text-sm text-gray-600">Optimize warehouse space usage</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Processing Time</h4>
                    <p className="text-sm text-gray-600">Monitor receipt processing speed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Report Generation</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Generate comprehensive warehouse reports
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Button variant="outline" className="p-6 h-auto flex-col">
                    <FileText className="h-8 w-8 mb-2" />
                    <span className="font-medium">Inventory Report</span>
                    <span className="text-sm text-gray-500">Current inventory status</span>
                  </Button>
                  <Button variant="outline" className="p-6 h-auto flex-col">
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <span className="font-medium">Activity Report</span>
                    <span className="text-sm text-gray-500">Recent warehouse activities</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}