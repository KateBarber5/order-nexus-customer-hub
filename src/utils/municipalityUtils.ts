
import { County } from '@/types/counties-cities';

const STORAGE_KEY = 'counties-cities-data';

export const getMunicipalityAlertMessage = (municipalityName: string): string => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return '';
    
    const counties: County[] = JSON.parse(savedData);
    
    // Search through all counties to find the municipality
    for (const county of counties) {
      const municipality = county.municipalities.find(
        m => m.name.toLowerCase() === municipalityName.toLowerCase()
      );
      
      if (municipality && municipality.alertMessage) {
        return municipality.alertMessage;
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error retrieving municipality alert message:', error);
    return '';
  }
};

export const getAllMunicipalities = (): Array<{ name: string; county: string; isActive: boolean; alertMessage: string }> => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return [];
    
    const counties: County[] = JSON.parse(savedData);
    const municipalities: Array<{ name: string; county: string; isActive: boolean; alertMessage: string }> = [];
    
    counties.forEach(county => {
      county.municipalities.forEach(municipality => {
        municipalities.push({
          name: municipality.name,
          county: county.name,
          isActive: municipality.isActive,
          alertMessage: municipality.alertMessage
        });
      });
    });
    
    return municipalities;
  } catch (error) {
    console.error('Error retrieving municipalities:', error);
    return [];
  }
};
