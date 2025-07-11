
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Building2 } from 'lucide-react';
import CountyList from '@/components/counties-cities/CountyList';
import AddCountyDialog from '@/components/counties-cities/AddCountyDialog';
import AddMunicipalityDialog from '@/components/counties-cities/AddMunicipalityDialog';
import { County, Municipality } from '@/types/counties-cities';

// Mock data - in a real app this would come from your API
const initialCounties: County[] = [
  {
    id: '1',
    name: 'Miami-Dade County',
    municipalities: [
      {
        id: '1',
        name: 'Miami',
        countyId: '1',
        isActive: true,
        services: ['Property Records', 'Building Permits', 'Code Violations'],
        alertMessage: ''
      },
      {
        id: '2',
        name: 'Homestead',
        countyId: '1',
        isActive: false,
        services: ['Property Records'],
        alertMessage: 'Limited services available due to system maintenance.'
      }
    ]
  },
  {
    id: '2',
    name: 'Broward County',
    municipalities: [
      {
        id: '3',
        name: 'Fort Lauderdale',
        countyId: '2',
        isActive: true,
        services: ['Property Records', 'Building Permits'],
        alertMessage: ''
      }
    ]
  }
];

const CountiesCities = () => {
  const [counties, setCounties] = useState<County[]>(initialCounties);
  const [showAddCounty, setShowAddCounty] = useState(false);
  const [showAddMunicipality, setShowAddMunicipality] = useState(false);
  const [selectedCountyId, setSelectedCountyId] = useState<string>('');

  const handleAddCounty = (name: string) => {
    const newCounty: County = {
      id: Date.now().toString(),
      name,
      municipalities: []
    };
    setCounties([...counties, newCounty]);
  };

  const handleAddMunicipality = (municipalityData: Omit<Municipality, 'id'>) => {
    const newMunicipality: Municipality = {
      ...municipalityData,
      id: Date.now().toString()
    };
    
    setCounties(counties.map(county => 
      county.id === selectedCountyId 
        ? { ...county, municipalities: [...county.municipalities, newMunicipality] }
        : county
    ));
  };

  const handleUpdateMunicipality = (updatedMunicipality: Municipality) => {
    setCounties(counties.map(county => ({
      ...county,
      municipalities: county.municipalities.map(municipality =>
        municipality.id === updatedMunicipality.id ? updatedMunicipality : municipality
      )
    })));
  };

  const handleDeleteMunicipality = (municipalityId: string) => {
    setCounties(counties.map(county => ({
      ...county,
      municipalities: county.municipalities.filter(m => m.id !== municipalityId)
    })));
  };

  const handleDeleteCounty = (countyId: string) => {
    setCounties(counties.filter(county => county.id !== countyId));
  };

  const openAddMunicipality = (countyId: string) => {
    setSelectedCountyId(countyId);
    setShowAddMunicipality(true);
  };

  const totalMunicipalities = counties.reduce((sum, county) => sum + county.municipalities.length, 0);
  const activeMunicipalities = counties.reduce((sum, county) => 
    sum + county.municipalities.filter(m => m.isActive).length, 0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Counties and Cities</h1>
            <p className="text-muted-foreground">
              Manage counties, municipalities, and their available services
            </p>
          </div>
          <Button onClick={() => setShowAddCounty(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add County
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Counties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counties.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Municipalities</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMunicipalities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Municipalities</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeMunicipalities}</div>
              <p className="text-xs text-muted-foreground">
                {totalMunicipalities > 0 ? Math.round((activeMunicipalities / totalMunicipalities) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Counties List */}
        <Card>
          <CardHeader>
            <CardTitle>Counties Management</CardTitle>
            <CardDescription>
              Manage counties and their municipalities, configure services and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CountyList 
              counties={counties}
              onAddMunicipality={openAddMunicipality}
              onUpdateMunicipality={handleUpdateMunicipality}
              onDeleteMunicipality={handleDeleteMunicipality}
              onDeleteCounty={handleDeleteCounty}
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddCountyDialog
          open={showAddCounty}
          onOpenChange={setShowAddCounty}
          onAddCounty={handleAddCounty}
        />

        <AddMunicipalityDialog
          open={showAddMunicipality}
          onOpenChange={setShowAddMunicipality}
          onAddMunicipality={handleAddMunicipality}
          countyId={selectedCountyId}
        />
      </div>
    </DashboardLayout>
  );
};

export default CountiesCities;
