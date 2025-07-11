
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Municipality, AVAILABLE_SERVICES } from '@/types/counties-cities';

interface AddMunicipalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMunicipality: (municipality: Omit<Municipality, 'id'>) => void;
  countyId: string;
}

const AddMunicipalityDialog: React.FC<AddMunicipalityDialogProps> = ({
  open,
  onOpenChange,
  onAddMunicipality,
  countyId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    isActive: true,
    services: [] as string[],
    alertMessage: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddMunicipality({
        ...formData,
        name: formData.name.trim(),
        countyId
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      isActive: true,
      services: [],
      alertMessage: ''
    });
    onOpenChange(false);
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Municipality</DialogTitle>
          <DialogDescription>
            Create a new municipality and configure its services and settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Municipality Name */}
            <div className="space-y-2">
              <Label htmlFor="municipality-name">Municipality Name</Label>
              <Input
                id="municipality-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter municipality name"
                required
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="municipality-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="municipality-active">Municipality is active</Label>
            </div>

            {/* Available Services */}
            <div className="space-y-3">
              <Label>Available Services</Label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                {AVAILABLE_SERVICES.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service}`}
                      checked={formData.services.includes(service)}
                      onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                    />
                    <Label htmlFor={`service-${service}`} className="text-sm">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Message */}
            <div className="space-y-2">
              <Label htmlFor="alert-message">Alert Message (Optional)</Label>
              <Textarea
                id="alert-message"
                value={formData.alertMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, alertMessage: e.target.value }))}
                placeholder="Enter an alert message that will be shown to users when they try to place orders in this municipality"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Add Municipality
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMunicipalityDialog;
