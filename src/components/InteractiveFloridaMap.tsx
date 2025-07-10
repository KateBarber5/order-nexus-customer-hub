
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Shield, Gavel, FileSpreadsheet, Receipt } from 'lucide-react';

interface Municipality {
  name: string;
  services: {
    fullReport: boolean;
    cardReport: boolean;
  };
}

interface County {
  name: string;
  municipalities: Municipality[];
  color: string;
}

const InteractiveFloridaMap = () => {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);

  // Sample data - you can expand this with actual service areas
  const counties: County[] = [
    {
      name: 'Miami-Dade',
      color: '#3B82F6',
      municipalities: [
        { name: 'Miami', services: { fullReport: true, cardReport: true } },
        { name: 'Miami Beach', services: { fullReport: false, cardReport: true } },
        { name: 'Coral Gables', services: { fullReport: true, cardReport: false } },
        { name: 'Homestead', services: { fullReport: true, cardReport: true } }
      ]
    },
    {
      name: 'Orange',
      color: '#10B981',
      municipalities: [
        { name: 'Orlando', services: { fullReport: true, cardReport: true } },
        { name: 'Winter Park', services: { fullReport: true, cardReport: false } },
        { name: 'Apopka', services: { fullReport: false, cardReport: true } }
      ]
    },
    {
      name: 'Hillsborough',
      color: '#F59E0B',
      municipalities: [
        { name: 'Tampa', services: { fullReport: true, cardReport: true } },
        { name: 'Plant City', services: { fullReport: true, cardReport: false } },
        { name: 'Temple Terrace', services: { fullReport: false, cardReport: true } }
      ]
    },
    {
      name: 'Pinellas',
      color: '#EF4444',
      municipalities: [
        { name: 'St. Petersburg', services: { fullReport: true, cardReport: true } },
        { name: 'Clearwater', services: { fullReport: true, cardReport: false } },
        { name: 'Largo', services: { fullReport: false, cardReport: true } }
      ]
    },
    {
      name: 'Broward',
      color: '#8B5CF6',
      municipalities: [
        { name: 'Fort Lauderdale', services: { fullReport: true, cardReport: true } },
        { name: 'Hollywood', services: { fullReport: false, cardReport: true } },
        { name: 'Pembroke Pines', services: { fullReport: true, cardReport: false } }
      ]
    }
  ];

  const handleCountyClick = (county: County) => {
    setSelectedCounty(selectedCounty?.name === county.name ? null : county);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Florida Service Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-50 rounded-lg p-8 min-h-[500px] flex items-center justify-center">
              {/* Simplified Florida map representation */}
              <div className="relative w-full max-w-md">
                <svg viewBox="0 0 400 300" className="w-full h-auto">
                  {/* Simplified Florida outline */}
                  <path
                    d="M50 150 L100 120 L180 100 L250 110 L350 130 L380 160 L360 200 L320 240 L280 260 L200 270 L120 250 L80 220 L60 180 Z"
                    fill="#e5e7eb"
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                  
                  {/* County regions - clickable areas */}
                  {counties.map((county, index) => (
                    <g key={county.name}>
                      {/* County area - simplified rectangles for demo */}
                      <rect
                        x={50 + index * 60}
                        y={120 + index * 20}
                        width={50}
                        height={40}
                        fill={selectedCounty?.name === county.name ? county.color : `${county.color}80`}
                        stroke={county.color}
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleCountyClick(county)}
                      />
                      <text
                        x={75 + index * 60}
                        y={145 + index * 20}
                        className="text-xs font-medium fill-white text-center cursor-pointer"
                        textAnchor="middle"
                        onClick={() => handleCountyClick(county)}
                      >
                        {county.name.split(' ')[0]}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3">
              {counties.map((county) => (
                <div
                  key={county.name}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  onClick={() => handleCountyClick(county)}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: county.color }}
                  />
                  <span className="text-sm font-medium">{county.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* County Details Section */}
      <div className="space-y-4">
        {selectedCounty ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedCounty.color }}
                />
                {selectedCounty.name} County
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                {selectedCounty.municipalities.length} municipalities serviced
              </div>
              
              {selectedCounty.municipalities.map((municipality) => (
                <div key={municipality.name} className="border rounded-lg p-3 space-y-2">
                  <div className="font-medium">{municipality.name}</div>
                  
                  <div className="space-y-2">
                    {municipality.services.fullReport && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                          Full Report
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-green-700">
                          <Building size={10} />
                          <Shield size={10} />
                          <Gavel size={10} />
                        </div>
                      </div>
                    )}
                    
                    {municipality.services.cardReport && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                          Card Report
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-blue-700">
                          <FileSpreadsheet size={10} />
                          <Receipt size={10} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Click on a county to view available services</p>
            </CardContent>
          </Card>
        )}
        
        {/* Service Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Service Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                  Full Report
                </Badge>
              </div>
              <div className="text-xs text-gray-600 pl-2">
                Complete detailed report including Code, Permits, and Liens data
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                  Card Report
                </Badge>
              </div>
              <div className="text-xs text-gray-600 pl-2">
                Summarized report with Property Appraiser and Tax Records
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveFloridaMap;
