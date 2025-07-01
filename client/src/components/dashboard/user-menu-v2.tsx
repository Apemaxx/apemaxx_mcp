import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ChevronDown, Settings, Bell, LogOut } from 'lucide-react';
import ProfileSettingsV2 from '@/components/dashboard/profile-settings-v2';

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  job_title: string | null;
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useAuth();

  // Load profile data using React Query and our backend API
  const { data: profile, refetch: refetchProfile } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!user?.id,
  });

  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2);
  };

  const handleProfileUpdate = () => {
    // Reload profile after update
    refetchProfile();
  };

  if (!user) return null;

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || ''} alt="Profile picture" />
            <AvatarFallback className="bg-primary-custom text-white text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">{getDisplayName()}</div>
            {profile?.job_title && (
              <div className="text-xs text-gray-500">{profile.job_title}</div>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile?.avatar_url || ''} alt="Profile picture" />
                    <AvatarFallback className="bg-primary-custom text-white text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{getDisplayName()}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Profile Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProfileSettingsV2 
        isOpen={showProfileModal} 
        onClose={() => {
          setShowProfileModal(false);
          handleProfileUpdate();
        }} 
      />
    </>
  );
}