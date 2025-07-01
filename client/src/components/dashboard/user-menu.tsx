import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, ChevronDown, Settings, Bell, LogOut } from 'lucide-react';
import { ProfileSettings } from '@/components/dashboard/profile-settings';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    logout();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setIsOpen(false);
  };

  const getDisplayName = () => {
    return user?.email || 'User';
  };

  const getInitials = () => {
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
            <AvatarFallback className="bg-primary-custom text-white text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">{getDisplayName()}</div>
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
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <ProfileSettings onClose={() => setShowProfileModal(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}