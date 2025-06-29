import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertTriangle, Lightbulb, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AiInsight {
  id: number;
  type: 'alert' | 'opportunity' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  createdAt: string;
}

export function AIInsights() {
  const { data: insights, isLoading, error } = useQuery<AiInsight[]>({
    queryKey: ['/api/ai-insights'],
    refetchInterval: 60000, // Refresh every minute
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />;
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-green-500 mt-1" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 mt-1" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 mt-1" />;
    }
  };

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'opportunity':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getInsightTextColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'text-red-800';
      case 'opportunity':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  const getInsightDescriptionColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'text-red-700';
      case 'opportunity':
        return 'text-green-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-blue-700';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-custom" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-custom" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading AI insights</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-custom" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No insights available at the moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-custom" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`flex items-start gap-3 p-3 rounded-md border ${getInsightStyles(insight.type)}`}
            >
              {getInsightIcon(insight.type)}
              <div>
                <p className={`font-semibold ${getInsightTextColor(insight.type)}`}>
                  {insight.title}
                </p>
                <p className={`text-sm ${getInsightDescriptionColor(insight.type)}`}>
                  {insight.message}{' '}
                  {insight.actionText && insight.actionUrl && (
                    <a href={insight.actionUrl} className="font-bold underline">
                      {insight.actionText}
                    </a>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
