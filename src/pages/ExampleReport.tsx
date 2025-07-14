
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, Check, X, MapPin } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ExampleReport = () => {
  const downloadPDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('govmetric-report-GOV001.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Download Button */}
        <div className="mb-4 flex justify-end">
          <Button onClick={downloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* PDF Report Container */}
        <div id="pdf-content" className="bg-white shadow-lg rounded-lg overflow-hidden">
          
          {/* Top Header Section */}
          <div className="bg-[#1976d2] text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">GovMetric</h1>
                <p className="text-blue-100 text-sm">Municipal Lien Search Report</p>
                <p className="text-blue-100 text-xs mt-1">Report Date: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold">Order #: GOV001</p>
                <p className="text-blue-100 text-sm">Customer: John Smith</p>
              </div>
            </div>
          </div>

          {/* Secondary Header Section */}
          <div className="bg-gray-50 p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 text-sm">Property Address</h3>
                <p className="text-gray-900 text-sm">123 Main Street<br />Miami, FL 33101</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 text-sm">Owner Name</h3>
                <p className="text-gray-900 text-sm">Jane Doe</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 text-sm">Parcel ID</h3>
                <p className="text-gray-900 font-mono text-sm">25-3218-000-0010</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-4 space-y-4">
            
            {/* Municipalities Searched Section */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-base text-[#1976d2] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Municipalities Searched
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 border rounded bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">City of Miami</p>
                        <p className="text-xs text-gray-600">Miami-Dade County</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">SEARCHED</span>
                    </div>
                  </div>
                  <div className="p-2 border rounded bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Miami-Dade County</p>
                        <p className="text-xs text-gray-600">County Government</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">SEARCHED</span>
                    </div>
                  </div>
                  <div className="p-2 border rounded bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Miami Beach</p>
                        <p className="text-xs text-gray-600">Miami-Dade County</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">SEARCHED</span>
                    </div>
                  </div>
                  <div className="p-2 border rounded bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Coral Gables</p>
                        <p className="text-xs text-gray-600">Miami-Dade County</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">SEARCHED</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Taxes Section */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-base text-[#1976d2] flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Property Taxes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>2023 Tax Year</span>
                    <span className="font-semibold text-green-600">PAID</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>2022 Tax Year</span>
                    <span className="font-semibold text-green-600">PAID</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Outstanding Amount</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Violations Section */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-base text-[#1976d2] flex items-center gap-2">
                  <X className="h-4 w-4 text-red-600" />
                  Code Violations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">Violation #CV-2023-0145</p>
                        <p className="text-xs text-gray-600">Overgrown vegetation in front yard</p>
                        <p className="text-xs text-gray-500">Date: March 15, 2023</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">OPEN</span>
                    </div>
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">Violation #CV-2022-0892</p>
                        <p className="text-xs text-gray-600">Missing house numbers</p>
                        <p className="text-xs text-gray-500">Date: August 10, 2022</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">CLOSED</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permits Section */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-base text-[#1976d2] flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Building Permits
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="p-2 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">Permit #BP-2023-1247</p>
                        <p className="text-xs text-gray-600">Roof Repair</p>
                        <p className="text-xs text-gray-500">Issued: February 20, 2023</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">ACTIVE</span>
                    </div>
                  </div>
                  <div className="p-2 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">Permit #BP-2021-3456</p>
                        <p className="text-xs text-gray-600">Kitchen Renovation</p>
                        <p className="text-xs text-gray-500">Issued: June 5, 2021</p>
                      </div>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">COMPLETED</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liens Section */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-base text-[#1976d2] flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Municipal Liens
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-green-600 font-semibold text-sm">No Active Liens Found</p>
              </CardContent>
            </Card>

          </div>

          <Separator />

          {/* Footer Section */}
          <div className="bg-gray-50 p-3">
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-gray-700 text-sm">GovMetric Support</h3>
              <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs text-gray-600">
                <span>🌐 www.govmetric.com</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExampleReport;
