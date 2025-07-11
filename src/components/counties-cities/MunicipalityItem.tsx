
import React, { useState } from 'react';
import { Municipality } from '@/types/counties-cities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, AlertTriangle, Settings } from 'lucide-react';
import EditMunicipalityDialog from './EditMunicipalityDialog';

interface MunicipalityItemProps {
  municipality: Municipality;
  onUpdate: (municipality: Municipality) => void;
  onDelete: (municipalityId: string) => void;
}

const MunicipalityItem: React.FC<MunicipalityItemProps> = ({
  municipality,
  onUpdate,
  onDelete
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleToggleActive = (checked: boolean) => {
    onUpdate({ ...municipality, isActive: checked });
  };

  return (
    <>
      <Card className={`transition-all ${municipality.isActive ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-semibold">{municipality.name}</h4>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`active-${municipality.id}`} className="text-sm font-medium">
                  Active
                </Label>
                <Switch
                  id={`active-${municipality.id}`}
                  checked={municipality.isActive}
                  onCheckedChange={handleToggleActive}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(municipality.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Services */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Available Services</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {municipality.services.length > 0 ? (
                  municipality.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No services configured</span>
                )}
              </div>
            </div>

            {/* Alert Message */}
            {municipality.alertMessage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <Label className="text-sm font-medium text-yellow-800">Alert Message</Label>
                    <p className="text-sm text-yellow-700 mt-1">{municipality.alertMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditMunicipalityDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        municipality={municipality}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default MunicipalityItem;
