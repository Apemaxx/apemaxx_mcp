import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface NewBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewBookingModal({ open, onOpenChange }: NewBookingModalProps) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    serviceType: 'LCL',
    volume: '',
    weight: '',
    estimatedCost: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBookingMutation = useMutation({
    mutationFn: (data: typeof formData) => postAPI('/api/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpi-metrics'] });
      toast({
        title: 'Booking created',
        description: 'Your new booking has been successfully created.',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create booking',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      serviceType: 'LCL',
      volume: '',
      weight: '',
      estimatedCost: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin || !formData.destination) {
      toast({
        title: 'Missing information',
        description: 'Please fill in origin and destination.',
        variant: 'destructive',
      });
      return;
    }

    createBookingMutation.mutate({
      ...formData,
      volume: formData.volume ? parseFloat(formData.volume) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Create New Booking
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin" className="text-sm font-medium text-gray-700">
                Origin *
              </Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Miami, FL"
                required
              />
            </div>
            <div>
              <Label htmlFor="destination" className="text-sm font-medium text-gray-700">
                Destination *
              </Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Santos, Brazil"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
              Service Type
            </Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LCL">LCL (Less than Container Load)</SelectItem>
                <SelectItem value="FCL">FCL (Full Container Load)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="volume" className="text-sm font-medium text-gray-700">
                Volume (CBM)
              </Label>
              <Input
                id="volume"
                type="number"
                step="0.01"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                placeholder="15.5"
              />
            </div>
            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                Weight (KG)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="2500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimatedCost" className="text-sm font-medium text-gray-700">
              Estimated Cost (USD)
            </Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="1250.00"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createBookingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="bg-primary-custom hover:bg-primary-custom/90 text-white"
            >
              {createBookingMutation.isPending ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
