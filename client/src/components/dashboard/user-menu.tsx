import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, ChevronDown, Settings, Bell, LogOut } from 'lucide-react';
import { ProfileSettings } from '@/components/dashboard/profile-settings';
import { Profile } from '@shared/schema';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useAuth();

  // Fetch real profile data from Supabase
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['/api/profile'],
  });

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setIsOpen(false);
  };

  const getDisplayName = () => {
    if (profile?.name) {
      return profile.name;
    }
    return user?.email || 'User';
  };

  const getInitials = () => {
    if (profile?.name) {
      const names = profile.name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return profile.name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatarUrl || ''} alt="Profile picture" />
            <AvatarFallback className="bg-primary-custom text-white text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">{getDisplayName()}</div>
            {profile?.jobTitle && (
              <div className="text-xs text-gray-500">{profile.jobTitle}</div>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-20">
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  Profile Settings
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <ProfileSettings />
        </DialogContent>
      </Dialog>
    </>
  );
}
