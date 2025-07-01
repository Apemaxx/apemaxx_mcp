import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../auth-provider';
import { useToast } from '../../hooks/use-toast';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileSettingsV2Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  job_title: string | null;
  avatar_url: string | null;
  language: string | null;
  llm_api_key: string | null;
  organization_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export default function ProfileSettingsV2({ isOpen, onClose }: ProfileSettingsV2Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    job_title: '',
    avatar_url: '',
  });

  // Fetch profile data directly from Supabase
  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log('🔍 ProfileSettings - Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ ProfileSettings - Profile fetch error:', error);
        return;
      }

      console.log('✅ ProfileSettings - Profile data fetched:', data);
      setProfileData(data);
      
      // Update form data with fetched profile
      setFormData({
        name: data?.name || '',
        email: data?.email || '',
        company: data?.company || '',
        phone: data?.phone || '',
        bio: data?.bio || '',
        location: data?.location || '',
        website: data?.website || '',
        job_title: data?.job_title || '',
        avatar_url: data?.avatar_url || '',
      });
    } catch (error) {
      console.error('❌ ProfileSettings - Profile fetch exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function using direct Supabase
  const updateProfile = async (profileData: any) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log('🔄 ProfileSettings - Updating profile:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ ProfileSettings - Update error:', error);
        throw error;
      }

      console.log('✅ ProfileSettings - Profile updated:', data);
      setProfileData(data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onClose();
    } catch (error: any) {
      console.error('❌ ProfileSettings - Update exception:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchProfile();
    }
  }, [isOpen, user?.id]);

  // Update form data when profile loads
  useEffect(() => {
    console.log('Profile data loaded:', profileData);
    if (profileData) {
      const newFormData = {
        name: profileData.name || '',
        email: profileData.email || '',
        company: profileData.company || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        job_title: profileData.job_title || '',
        avatar_url: profileData.avatar_url || '',
      };
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
    }
  }, [profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (error) {
        console.error('Storage upload error:', error);
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload avatar",
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update form data with new avatar URL
      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been uploaded successfully",
      });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Profile Settings
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-medium text-gray-600">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </label>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter your company"
                />
              </div>

              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  placeholder="Enter your job title"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter your location"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Enter your website URL"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Enter a short bio"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary-custom hover:bg-primary-custom/90"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}