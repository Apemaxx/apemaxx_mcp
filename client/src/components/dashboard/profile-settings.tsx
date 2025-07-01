import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { User, Save } from 'lucide-react';

interface ProfileSettingsProps {
  onClose?: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">
              Your email address is managed by the authentication system and cannot be changed here.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              value={user?.id || 'Not available'}
              disabled
              className="bg-gray-50 font-mono text-sm"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Profile Integration Available</h4>
            <p className="text-sm text-blue-700">
              Full profile management with Supabase integration is available. 
              This includes photo uploads, job title, company information, and more.
            </p>
          </div>
        </CardContent>
      </Card>

      {onClose && (
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}
    </div>
  );
}