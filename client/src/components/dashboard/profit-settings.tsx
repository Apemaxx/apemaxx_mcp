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

  const updateProfitSettings = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profit Settings Updated",
        description: "Your profit margins have been saved successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profit settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfitSettings.mutate(margins);
  };

  const handleCancel = () => {
    if (profile) {
      setMargins({
        defaultProfitMargin: profile.defaultProfitMargin || '15.00',
        seaFreightMargin: profile.seaFreightMargin || '12.00',
        airFreightMargin: profile.airFreightMargin || '18.00',
        landFreightMargin: profile.landFreightMargin || '15.00',
        warehouseMargin: profile.warehouseMargin || '20.00',
        customsMargin: profile.customsMargin || '25.00',
        insuranceMargin: profile.insuranceMargin || '30.00',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading profit settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const services = [
    {
      key: 'defaultProfitMargin',
      label: 'Default Margin',
      icon: Settings2,
      description: 'Default profit margin for all services',
      color: 'bg-blue-500',
    },
    {
      key: 'seaFreightMargin',
      label: 'Sea Freight',
      icon: Ship,
      description: 'Ocean freight services',
      color: 'bg-blue-600',
    },
    {
      key: 'airFreightMargin',
      label: 'Air Freight',
      icon: Plane,
      description: 'Air cargo services',
      color: 'bg-sky-500',
    },
    {
      key: 'landFreightMargin',
      label: 'Land Freight',
      icon: Truck,
      description: 'Trucking and rail services',
      color: 'bg-green-600',
    },
    {
      key: 'warehouseMargin',
      label: 'Warehouse',
      icon: Warehouse,
      description: 'Storage and handling',
      color: 'bg-orange-500',
    },
    {
      key: 'customsMargin',
      label: 'Customs',
      icon: FileText,
      description: 'Customs clearance',
      color: 'bg-purple-500',
    },
    {
      key: 'insuranceMargin',
      label: 'Insurance',
      icon: Shield,
      description: 'Cargo insurance',
      color: 'bg-red-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profit Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your profit margins by service type
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateProfitSettings.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProfitSettings.isPending}
                >
                  {updateProfitSettings.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Margins
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            const value = margins[service.key as keyof typeof margins];
            
            return (
              <div key={service.key}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${service.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{service.label}</h4>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => setMargins(prev => ({
                            ...prev,
                            [service.key]: e.target.value
                          }))}
                          className="w-20 text-right"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-sm">
                        {parseFloat(value).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                {index < services.length - 1 && <Separator className="my-2" />}
              </div>
            );
          })}
        </div>

        {!isEditing && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Quick Stats</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Average Margin:</span>
                <div className="font-medium">
                  {(
                    services.reduce((acc, service) => 
                      acc + parseFloat(margins[service.key as keyof typeof margins] || '0'), 0
                    ) / services.length
                  ).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Highest:</span>
                <div className="font-medium text-green-600">
                  {Math.max(...services.map(service => 
                    parseFloat(margins[service.key as keyof typeof margins] || '0')
                  )).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Lowest:</span>
                <div className="font-medium text-orange-600">
                  {Math.min(...services.map(service => 
                    parseFloat(margins[service.key as keyof typeof margins] || '0')
                  )).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Services:</span>
                <div className="font-medium">{services.length}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}