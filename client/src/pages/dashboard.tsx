import { UserMenu } from '@/components/dashboard/user-menu';
import { KPIMetrics } from '@/components/dashboard/kpi-metrics';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ConsolidationPlan } from '@/components/dashboard/consolidation-plan';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { LiveTracking } from '@/components/dashboard/live-tracking';
import { WarehouseReceipts } from '@/components/dashboard/warehouse-receipts';

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8">
      {/* Header with User Menu */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard: Logistics Command Center</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here is your AI-powered overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Core Metrics & Quick Actions */}
        <div className="space-y-6">
          {/* KPI Metrics */}
          <KPIMetrics />

          {/* Quick Actions */}
          <QuickActions />

          {/* Weekly Consolidation Plan */}
          <ConsolidationPlan />
        </div>

        {/* Column 2: The AI Command Center */}
        <div className="space-y-6">
          {/* AI Insights & Recommendations */}
          <AIInsights />

          {/* AI Chat Interface */}
          <ChatInterface />
        </div>

        {/* Column 3: Operational Feeds */}
        <div className="space-y-6">
          {/* Live Shipment Tracking */}
          <LiveTracking />

          {/* Recent Warehouse Receipts */}
          <WarehouseReceipts />
        </div>

      </div>
    </div>
  );
}
