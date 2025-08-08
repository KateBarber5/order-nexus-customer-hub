
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, Building, Search, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import AddCountyDialog from '@/components/AddCountyDialog';
import AddMunicipalityDialog from '@/components/AddMunicipalityDialog';
import EditCountyDialog from '@/components/EditCountyDialog';
import EditMunicipalityDialog from '@/components/EditMunicipalityDialog';
import { fetchPlaces, transformPlacesToCounties, County, Municipality, StatusType, ReportType, crudCounty, Place, SubPlace } from '@/services/orderService';

const CountiesCitiesConfig = () => {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCountyDialog, setShowAddCountyDialog] = useState(false);
  const [showAddMunicipalityDialog, setShowAddMunicipalityDialog] = useState(false);
  const [selectedCountyForMunicipality, setSelectedCountyForMunicipality] = useState<string | null>(null);
  const [editingCounty, setEditingCounty] = useState<County | null>(null);
  const [editingMunicipality, setEditingMunicipality] = useState<Municipality | null>(null);
  const [municipalityServicesMap, setMunicipalityServicesMap] = useState<Record<string, string[]>>({});

  // Fetch counties and municipalities data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const places = await fetchPlaces();
      console.log('Fetched places:', places);
      
      if (!places || !Array.isArray(places)) {
        throw new Error('Invalid data received from API');
      }
      
      const transformedCounties = transformPlacesToCounties(places);
      console.log('Transformed counties:', transformedCounties);
      
      if (!Array.isArray(transformedCounties)) {
        throw new Error('Failed to transform places data');
      }
      
      setCounties(transformedCounties);

      // Build a map of municipality ID -> array of service names from API
      const servicesMap: Record<string, string[]> = {};
      (places as Place[]).forEach((place: Place) => {
        const subPlaces: SubPlace[] = Array.isArray(place.SubPlace) ? place.SubPlace : [];
        subPlaces.forEach((subPlace: SubPlace) => {
          const municipalityId = `${place.PlaceID}-${subPlace.SubPlaceName}`;
          const serviceNames = Array.isArray(subPlace.Service)
            ? subPlace.Service
                .map((s) => s?.PlaceServiceName)
                .filter((name): name is string => Boolean(name))
            : [];
          servicesMap[municipalityId] = serviceNames;
        });
      });
      setMunicipalityServicesMap(servicesMap);
    } catch (err) {
      console.error('Error loading counties data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load counties data');
      toast.error('Failed to load counties and municipalities data');
      // Set empty array as fallback
      setCounties([]);
      setMunicipalityServicesMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleDeleteCounty = async (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    if (!county) return;
    
    if (county.municipalities.length > 0) {
      toast.error('Cannot delete county with existing municipalities');
      return;
    }
    
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete "${county.name}" County? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      const requestData = {
        iTrnMode: 'DLT' as const,
        iCountyName: county.name,
        iState: county.state,
        iCountyStatus: 'Active', // Required by API but not used for delete
        iAlertMessage: undefined,
      };
      
      console.log('Submitting county deletion request:', requestData);
      
      const response = await crudCounty(requestData);
      
      // Check if the operation was successful by looking for "Success" in oMessages
      const successMessage = response.oMessages?.find(msg => msg.Id === 'Success');
      
      if (successMessage) {
        setCounties(counties.filter(c => c.id !== countyId));
        toast.success(successMessage.Description || `County "${county.name}" deleted successfully`);
      } else {
        // Find error message if any
        const errorMessage = response.oMessages?.find(msg => msg.Id !== 'Success');
        const errorText = errorMessage?.Description || 'Failed to delete county';
        toast.error(errorText);
      }
    } catch (error) {
      console.error('Error deleting county:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete county');
    }
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

    // Refresh data from API to reflect updated services and keep the current filter
    // Note: searchTerm is preserved in state, so filtering remains intact
    loadData();
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

  const renderServiceBadges = (serviceNames: string[]) => {
    return serviceNames.map((serviceName) => (
      <Badge key={serviceName} variant="secondary">
        {serviceName}
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
        {status === 'unavailable' ? 'Unavailable' : status}
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
              disabled={loading}
            />
          </div>
          <Button 
            onClick={() => setShowAddCountyDialog(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add County
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading counties and municipalities...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p className="text-lg font-medium">Error loading data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
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
                          <span>
                            {county.municipalities.length === 0 
                              ? 'No municipalities' 
                              : `${county.municipalities.length} municipality${county.municipalities.length === 1 ? '' : 's'}`
                            }
                          </span>
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
                                  {renderServiceBadges(municipalityServicesMap[municipality.id] || [])}
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
                        <p>No municipalities available for this county</p>
                        <p className="text-xs mt-1">This county may not have any municipalities in the system</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {!loading && !error && filteredCounties.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No counties found</p>
                <p className="text-sm">Try adjusting your search or add a new county</p>
              </div>
            )}
          </>
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
        counties={counties}
        selectedCounty={selectedCountyForMunicipality ? counties.find(c => c.id === selectedCountyForMunicipality) : undefined}
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
