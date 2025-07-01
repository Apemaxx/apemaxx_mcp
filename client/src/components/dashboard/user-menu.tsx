import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { User, ChevronDown, Settings, Bell, LogOut } from 'lucide-react';
import ProfileSettingsV2 from '@/components/dashboard/profile-settings-v2';
import { Profile } from '@shared/schema';
import { supabase } from '@/lib/supabase';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useAuth();

  // Fetch real profile data directly from Supabase
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        return existingProfile as Profile;
      }

      // If no profile exists, create one with Supabase user metadata
      const { data: supabaseUser } = await supabase.auth.getUser();
      const userMeta = supabaseUser.user?.user_metadata;
      
      const newProfile = {
        id: user.id,
        user_id: user.id,
        email: user.email,
        name: userMeta?.full_name || userMeta?.first_name + ' ' + userMeta?.last_name || null,
        company: userMeta?.company || null,
        phone: userMeta?.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }

      return createdProfile as Profile;
    },
    enabled: !!user?.id,
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
    return 'Flavio Campos'; // From your Supabase user metadata
  };

  const getInitials = () => {
    if (profile?.name) {
      const names = profile.name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return profile.name.charAt(0).toUpperCase();
    }
    return 'FC'; // Flavio Campos initials
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
            <AvatarImage src={(profile as any)?.avatar_url || ''} alt="Profile picture" />
            <AvatarFallback className="bg-primary-custom text-white text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">{getDisplayName()}</div>
            {(profile as any)?.job_title && (
              <div className="text-xs text-gray-500">{(profile as any).job_title}</div>
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

      <ProfileSettingsV2 isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}
