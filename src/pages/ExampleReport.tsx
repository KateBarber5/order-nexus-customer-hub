import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Download Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={downloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* PDF Report Container */}
        <div id="pdf-content" className="bg-white shadow-lg rounded-lg overflow-hidden">
          
          {/* Top Header Section */}
          <div className="bg-[#1976d2] text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">GovMetric</h1>
                <p className="text-blue-100">Municipal Lien Search Report</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">Order #: GOV001</p>
                <p className="text-blue-100">Customer: John Smith</p>
              </div>
            </div>
          </div>

          {/* Secondary Header Section */}
          <div className="bg-gray-50 p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Property Address</h3>
                <p className="text-gray-900">123 Main Street<br />Miami, FL 33101</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Owner Name</h3>
                <p className="text-gray-900">Jane Doe</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Parcel ID</h3>
                <p className="text-gray-900 font-mono">25-3218-000-0010</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6 space-y-6">
            
            {/* Taxes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#1976d2]">Property Taxes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>2023 Tax Year</span>
                    <span className="font-semibold text-green-600">PAID</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2022 Tax Year</span>
                    <span className="font-semibold text-green-600">PAID</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding Amount</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Violations Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#1976d2]">Code Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Violation #CV-2023-0145</p>
                        <p className="text-sm text-gray-600">Overgrown vegetation in front yard</p>
                        <p className="text-sm text-gray-500">Date: March 15, 2023</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">OPEN</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Violation #CV-2022-0892</p>
                        <p className="text-sm text-gray-600">Missing house numbers</p>
                        <p className="text-sm text-gray-500">Date: August 10, 2022</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">CLOSED</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permits Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#1976d2]">Building Permits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Permit #BP-2023-1247</p>
                        <p className="text-sm text-gray-600">Roof Repair</p>
                        <p className="text-sm text-gray-500">Issued: February 20, 2023</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">ACTIVE</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Permit #BP-2021-3456</p>
                        <p className="text-sm text-gray-600">Kitchen Renovation</p>
                        <p className="text-sm text-gray-500">Issued: June 5, 2021</p>
                      </div>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">COMPLETED</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liens Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#1976d2]">Municipal Liens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 font-semibold">No Active Liens Found</p>
              </CardContent>
            </Card>

          </div>

          <Separator />

          {/* Footer Section */}
          <div className="bg-gray-50 p-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-gray-700">GovMetric Support</h3>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600">
                <span>📧 support@govmetric.com</span>
                <span>🌐 www.govmetric.com</span>
                <span>📞 (555) 123-4567</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExampleReport;
