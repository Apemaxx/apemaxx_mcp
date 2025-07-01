import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../auth-provider';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { X, Upload } from 'lucide-react';

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
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  
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

  // Load profile data using React Query
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: isOpen && !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        company: profile.company || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        job_title: profile.job_title || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      // This would typically be a separate upload endpoint
      // For now, we'll just update the avatar_url with a placeholder
      toast({
        title: "Upload feature",
        description: "Avatar upload will be implemented with file storage service",
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
                disabled={updateProfileMutation.isPending}
                className="bg-primary-custom hover:bg-primary-custom/90"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}