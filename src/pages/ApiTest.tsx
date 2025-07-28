import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ApiTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing API connection...\n');
    
    try {
      // Test 1: Direct API call
      setTestResult(prev => prev + 'Testing direct API call...\n');
      const response = await fetch('/api/GovMetricAPI/GovmetricLogin?iUserName=test@example.com&iUserPassword=test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      setTestResult(prev => prev + `Response status: ${response.status}\n`);
      setTestResult(prev => prev + `Response status text: ${response.statusText}\n`);
      
      const contentType = response.headers.get('content-type');
      setTestResult(prev => prev + `Content-Type: ${contentType}\n`);
      
      const responseText = await response.text();
      setTestResult(prev => prev + `Response length: ${responseText.length}\n`);
      setTestResult(prev => prev + `Response preview: ${responseText.substring(0, 200)}...\n`);
      
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html>')) {
        setTestResult(prev => prev + '❌ Response is HTML (error page)\n');
      } else {
        setTestResult(prev => prev + '✅ Response appears to be JSON\n');
      }
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testApiConnection} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </Button>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {testResult || 'Click the button to test API connection'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;