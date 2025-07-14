
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, MapPin, Building, Search } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import AddCountyDialog from '@/components/AddCountyDialog';
import AddMunicipalityDialog from '@/components/AddMunicipalityDialog';
import EditCountyDialog from '@/components/EditCountyDialog';
import EditMunicipalityDialog from '@/components/EditMunicipalityDialog';

export interface County {
  id: string;
  name: string;
  state: string;
  municipalities: Municipality[];
}

export interface Municipality {
  id: string;
  name: string;
  countyId: string;
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
      municipalities: [
        {
          id: '1',
          name: 'Miami',
          countyId: '1',
          availableServices: { code: true, permits: true, liens: true, utilities: true },
          reportTypes: ['full', 'card']
        },
        {
          id: '2',
          name: 'Miami Beach',
          countyId: '1',
          availableServices: { code: false, permits: false, liens: true, utilities: false },
          reportTypes: ['card']
        }
      ]
    },
    {
      id: '2',
      name: 'Broward',
      state: 'FL',
      municipalities: [
        {
          id: '3',
          name: 'Fort Lauderdale',
          countyId: '2',
          availableServices: { code: true, permits: true, liens: true, utilities: true },
          reportTypes: ['full', 'card']
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('counties');
  const [showAddCountyDialog, setShowAddCountyDialog] = useState(false);
  const [showAddMunicipalityDialog, setShowAddMunicipalityDialog] = useState(false);
  const [editingCounty, setEditingCounty] = useState<County | null>(null);
  const [editingMunicipality, setEditingMunicipality] = useState<Municipality | null>(null);

  const allMunicipalities = counties.flatMap(county => 
    county.municipalities.map(municipality => ({
      ...municipality,
      countyName: county.name
    }))
  );

  const filteredCounties = counties.filter(county =>
    county.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMunicipalities = allMunicipalities.filter(municipality =>
    municipality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    municipality.countyName.toLowerCase().includes(searchTerm.toLowerCase())
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
    const municipality = allMunicipalities.find(m => m.id === municipalityId);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Counties & Cities Configuration</h1>
            <p className="text-muted-foreground">
              Manage counties, municipalities, and their available services
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search counties or municipalities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="counties" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Counties ({counties.length})
            </TabsTrigger>
            <TabsTrigger value="municipalities" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Municipalities ({allMunicipalities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="counties" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Counties</h2>
              <Button onClick={() => setShowAddCountyDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add County
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredCounties.map((county) => (
                <Card key={county.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {county.name} County, {county.state}
                        </CardTitle>
                        <CardDescription>
                          {county.municipalities.length} municipalities
                        </CardDescription>
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
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Municipalities:</Label>
                      <div className="flex flex-wrap gap-2">
                        {county.municipalities.length > 0 ? (
                          county.municipalities.map((municipality) => (
                            <Badge key={municipality.id} variant="outline">
                              {municipality.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No municipalities added</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="municipalities" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Municipalities</h2>
              <Button onClick={() => setShowAddMunicipalityDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Municipality
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredMunicipalities.map((municipality) => (
                <Card key={municipality.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {municipality.name}
                        </CardTitle>
                        <CardDescription>
                          {municipality.countyName} County
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMunicipality(municipality)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMunicipality(municipality.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Available Services:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getServiceBadges(municipality.availableServices)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Report Types:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getReportTypeBadges(municipality.reportTypes)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddCountyDialog
        open={showAddCountyDialog}
        onOpenChange={setShowAddCountyDialog}
        onAdd={handleAddCounty}
      />

      <AddMunicipalityDialog
        open={showAddMunicipalityDialog}
        onOpenChange={setShowAddMunicipalityDialog}
        counties={counties}
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
