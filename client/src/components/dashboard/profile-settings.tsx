import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Profile } from "@shared/schema";
import { User, Settings, Phone, MapPin, Globe, Briefcase, Key } from 'lucide-react';

export function ProfileSettings() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    language: 'en',
    llmApiKey: '',
    bio: '',
    location: '',
    website: '',
    jobTitle: '',
  });

  // Fetch current profile data
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['/api/profile'],
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        company: profile.company || '',
        phone: profile.phone || '',
        language: profile.language || 'en',
        llmApiKey: profile.llmApiKey || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        jobTitle: profile.jobTitle || '',
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        company: profile.company || '',
        phone: profile.phone || '',
        language: profile.language || 'en',
        llmApiKey: profile.llmApiKey || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        jobTitle: profile.jobTitle || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading profile...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal and company information
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.name || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.email || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Company Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter company name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.company || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                {isEditing ? (
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Enter your job title"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.jobTitle || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.phone || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter your location"
                  />
                ) : (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{formData.location || 'Not set'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Key className="h-4 w-4" />
              AI Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                {isEditing ? (
                  <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.language || 'English'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="llmApiKey">LLM API Key</Label>
                {isEditing ? (
                  <Input
                    id="llmApiKey"
                    type="password"
                    value={formData.llmApiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, llmApiKey: e.target.value }))}
                    placeholder="Enter API key for AI providers"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.llmApiKey ? '••••••••••••••••' : 'Not configured'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Additional Information
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="Enter website URL"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.website || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{formData.bio || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}