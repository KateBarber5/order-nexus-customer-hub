
import React from 'react';
import { County, Municipality } from '@/types/counties-cities';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MapPin, AlertTriangle } from 'lucide-react';
import MunicipalityItem from './MunicipalityItem';

interface CountyListProps {
  counties: County[];
  onAddMunicipality: (countyId: string) => void;
  onUpdateMunicipality: (municipality: Municipality) => void;
  onDeleteMunicipality: (municipalityId: string) => void;
  onDeleteCounty: (countyId: string) => void;
}

const CountyList: React.FC<CountyListProps> = ({
  counties,
  onAddMunicipality,
  onUpdateMunicipality,
  onDeleteMunicipality,
  onDeleteCounty
}) => {
  if (counties.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No counties</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by adding a new county.
        </p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {counties.map((county) => {
        const activeMunicipalities = county.municipalities.filter(m => m.isActive).length;
        const totalMunicipalities = county.municipalities.length;
        
        return (
          <AccordionItem key={county.id} value={county.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{county.name}</h3>
                  <Badge variant="secondary">
                    {totalMunicipalities} municipalities
                  </Badge>
                  {activeMunicipalities < totalMunicipalities && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {totalMunicipalities - activeMunicipalities} inactive
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCounty(county.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-muted-foreground">Municipalities</h4>
                  <Button
                    size="sm"
                    onClick={() => onAddMunicipality(county.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Municipality
                  </Button>
                </div>
                
                {county.municipalities.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No municipalities in this county yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {county.municipalities.map((municipality) => (
                      <MunicipalityItem
                        key={municipality.id}
                        municipality={municipality}
                        onUpdate={onUpdateMunicipality}
                        onDelete={onDeleteMunicipality}
                      />
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default CountyList;
