
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, Building, Search } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import AddCountyDialog from '@/components/AddCountyDialog';
import AddMunicipalityDialog from '@/components/AddMunicipalityDialog';
import EditCountyDialog from '@/components/EditCountyDialog';
import EditMunicipalityDialog from '@/components/EditMunicipalityDialog';

export type StatusType = 'active' | 'inactive' | 'unavailable';

export interface County {
  id: string;
  name: string;
  state: string;
  status: StatusType;
  alertMessage?: string;
  municipalities: Municipality[];
}

export interface Municipality {
  id: string;
  name: string;
  countyId: string;
  status: StatusType;
  alertMessage?: string;
  availableServices: ServiceAvailability;
  reportTypes: ReportType[];
}

export interface ServiceAvailability {
  code: boolean;
  permits: boolean;
  liens: boolean;
  utilities: boolean;
}

export type ReportType = 'full' | 'card';

const CountiesCitiesConfig = () => {
  // Mock data - in a real app, this would come from your backend
  const [counties, setCounties] = useState<County[]>([
    {
      id: '1',
      name: 'Miami-Dade',
      state: 'FL',
      status: 'active',
      municipalities: [
        {
          id: '1',
          name: 'Miami',
          countyId: '1',
          status: 'unavailable',
          alertMessage: 'The City of Miami Code Enforcement and Permitting sites are currently down for maintenance. All new orders will resume processing once the site maintenance has concluded.',
          availableServices: { code: true, permits: true, liens: true, utilities: true },
          reportTypes: ['full', 'card']
        },
        {
          id: '2',
          name: 'Miami Beach',
          countyId: '1',
          status: 'unavailable',
          alertMessage: 'System maintenance in progress',
          availableServices: { code: false, permits: false, liens: true, utilities: false },
          reportTypes: ['card']
        }
      ]
    },
    {
      id: '2',
      name: 'Broward',
      state: 'FL',
      status: 'active',
      municipalities: [
        {
          id: '3',
          name: 'Fort Lauderdale',
          countyId: '2',
          status: 'active',
          availableServices: { code: true, permits: true, liens: true, utilities: true },
          reportTypes: ['full', 'card']
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCountyDialog, setShowAddCountyDialog] = useState(false);
  const [showAddMunicipalityDialog, setShowAddMunicipalityDialog] = useState(false);
  const [selectedCountyForMunicipality, setSelectedCountyForMunicipality] = useState<string | null>(null);
  const [editingCounty, setEditingCounty] = useState<County | null>(null);
  const [editingMunicipality, setEditingMunicipality] = useState<Municipality | null>(null);

  const filteredCounties = counties.filter(county =>
    county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    county.municipalities.some(municipality =>
      municipality.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddCounty = (countyData: Omit<County, 'id' | 'municipalities'>) => {
    const newCounty: County = {
      ...countyData,
      id: Date.now().toString(),
      municipalities: []
    };
    setCounties([...counties, newCounty]);
    toast.success(`County "${countyData.name}" added successfully`);
  };

  const handleEditCounty = (countyData: Omit<County, 'id' | 'municipalities'>) => {
    if (!editingCounty) return;
    
    setCounties(counties.map(county =>
      county.id === editingCounty.id
        ? { ...county, ...countyData }
        : county
    ));
    toast.success(`County "${countyData.name}" updated successfully`);
    setEditingCounty(null);
  };

  const handleDeleteCounty = (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    if (!county) return;
    
    if (county.municipalities.length > 0) {
      toast.error('Cannot delete county with existing municipalities');
      return;
    }
    
    setCounties(counties.filter(c => c.id !== countyId));
    toast.success(`County "${county.name}" deleted successfully`);
  };

  const handleAddMunicipality = (municipalityData: Omit<Municipality, 'id'>) => {
    const newMunicipality: Municipality = {
      ...municipalityData,
      id: Date.now().toString()
    };
    
    setCounties(counties.map(county =>
      county.id === municipalityData.countyId
        ? { ...county, municipalities: [...county.municipalities, newMunicipality] }
        : county
    ));
    toast.success(`Municipality "${municipalityData.name}" added successfully`);
    setSelectedCountyForMunicipality(null);
  };

  const handleEditMunicipality = (municipalityData: Omit<Municipality, 'id'>) => {
    if (!editingMunicipality) return;
    
    setCounties(counties.map(county => ({
      ...county,
      municipalities: county.municipalities.map(municipality =>
        municipality.id === editingMunicipality.id
          ? { ...municipality, ...municipalityData }
          : municipality
      )
    })));
    toast.success(`Municipality "${municipalityData.name}" updated successfully`);
    setEditingMunicipality(null);
  };

  const handleDeleteMunicipality = (municipalityId: string) => {
    const municipality = counties.flatMap(c => c.municipalities).find(m => m.id === municipalityId);
    if (!municipality) return;
    
    setCounties(counties.map(county => ({
      ...county,
      municipalities: county.municipalities.filter(m => m.id !== municipalityId)
    })));
    toast.success(`Municipality "${municipality.name}" deleted successfully`);
  };

  const getServiceBadges = (services: ServiceAvailability) => {
    const activeServices = Object.entries(services)
      .filter(([_, active]) => active)
      .map(([service, _]) => service);
    
    return activeServices.map(service => (
      <Badge key={service} variant="secondary" className="capitalize">
        {service}
      </Badge>
    ));
  };

  const getReportTypeBadges = (reportTypes: ReportType[]) => {
    return reportTypes.map(type => (
      <Badge 
        key={type} 
        variant={type === 'full' ? 'default' : 'outline'}
        className="capitalize"
      >
        {type} Report
      </Badge>
    ));
  };

  const getStatusBadge = (status: StatusType) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      unavailable: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status === 'unavailable' ? 'Currently Unavailable' : status}
      </Badge>
    );
  };

  const openAddMunicipalityDialog = (countyId: string) => {
    setSelectedCountyForMunicipality(countyId);
    setShowAddMunicipalityDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Counties & Cities Configuration</h1>
            <p className="text-muted-foreground">
              Manage counties and their municipalities with available services
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search counties or municipalities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setShowAddCountyDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add County
          </Button>
        </div>

        <div className="grid gap-6">
          {filteredCounties.map((county) => (
            <Card key={county.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {county.name} County, {county.state}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <span>{county.municipalities.length} municipalities</span>
                      {getStatusBadge(county.status)}
                    </CardDescription>
                    {county.status === 'unavailable' && county.alertMessage && (
                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                        <strong>Alert:</strong> {county.alertMessage}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCounty(county)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCounty(county.id)}
                      disabled={county.municipalities.length > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Municipalities:</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAddMunicipalityDialog(county.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Municipality
                  </Button>
                </div>
                
                {county.municipalities.length > 0 ? (
                  <div className="space-y-3">
                    {county.municipalities.map((municipality) => (
                      <div
                        key={municipality.id}
                        className="border rounded-lg p-4 space-y-3 bg-muted/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">{municipality.name}</span>
                            {getStatusBadge(municipality.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMunicipality(municipality)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMunicipality(municipality.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {municipality.status === 'unavailable' && municipality.alertMessage && (
                          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                            <strong>Alert:</strong> {municipality.alertMessage}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Available Services:</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {getServiceBadges(municipality.availableServices)}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Report Types:</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {getReportTypeBadges(municipality.reportTypes)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No municipalities added yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => openAddMunicipalityDialog(county.id)}
                    >
                      Add the first municipality
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCounties.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No counties found</p>
            <p className="text-sm">Try adjusting your search or add a new county</p>
          </div>
        )}
      </div>

      <AddCountyDialog
        open={showAddCountyDialog}
        onOpenChange={setShowAddCountyDialog}
        onAdd={handleAddCounty}
      />

      <AddMunicipalityDialog
        open={showAddMunicipalityDialog}
        onOpenChange={(open) => {
          setShowAddMunicipalityDialog(open);
          if (!open) setSelectedCountyForMunicipality(null);
        }}
        counties={selectedCountyForMunicipality ? counties.filter(c => c.id === selectedCountyForMunicipality) : counties}
        onAdd={handleAddMunicipality}
      />

      {editingCounty && (
        <EditCountyDialog
          open={!!editingCounty}
          onOpenChange={(open) => !open && setEditingCounty(null)}
          county={editingCounty}
          onEdit={handleEditCounty}
        />
      )}

      {editingMunicipality && (
        <EditMunicipalityDialog
          open={!!editingMunicipality}
          onOpenChange={(open) => !open && setEditingMunicipality(null)}
          municipality={editingMunicipality}
          counties={counties}
          onEdit={handleEditMunicipality}
        />
      )}
    </DashboardLayout>
  );
};

export default CountiesCitiesConfig;
