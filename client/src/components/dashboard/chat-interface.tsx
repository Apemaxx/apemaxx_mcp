import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI, postAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, User, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: number;
  userId: string;
  message: string;
  isFromUser: boolean;
  createdAt: string;
}

export function ChatInterface() {
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat-messages'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => postAPI('/api/chat-messages', { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
      setCurrentMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(currentMessage.trim());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial message if no messages exist
  const displayMessages = messages && messages.length > 0 ? messages : [
    {
      id: 0,
      userId: '',
      message: 'How can I help you with your logistics operations today?',
      isFromUser: false,
      createdAt: new Date().toISOString(),
    }
  ];

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[480px]">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Logistics Assistant</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.isFromUser ? 'justify-end' : ''}`}
            >
              {!message.isFromUser && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`p-3 rounded-lg text-sm max-w-[80%] ${
                message.isFromUser 
                  ? 'bg-primary-custom text-white' 
                  : 'bg-gray-100'
              }`}>
                {message.message}
              </div>
              
              {message.isFromUser && (
                <div className="w-8 h-8 bg-blue-700 rounded-full flex-shrink-0 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask the AI anything..."
            disabled={sendMessageMutation.isPending}
            className="pr-12 focus:ring-primary focus:border-primary"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!currentMessage.trim() || sendMessageMutation.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-custom hover:bg-primary-custom/90 text-white p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
