import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ApiConfig from "@/lib/config/api-config";

export default function ApiDebugPage() {
  const [apiUrl, setApiUrl] = useState(ApiConfig.baseURL);
  const [testUrl, setTestUrl] = useState(`${ApiConfig.baseURL}/announcements`);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  // Initialize from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUrl = localStorage.getItem("bersekolah_api_url");
      if (storedUrl) {
        setApiUrl(storedUrl);
        setTestUrl(`${storedUrl}/announcements`);
      }
    }
  }, []);

  // Update API configuration
  const updateApiConfig = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("bersekolah_api_url", apiUrl);
      }
      
      // Update test URL to match new API URL
      setTestUrl(`${apiUrl}/announcements`);
      
      alert(`API URL updated to: ${apiUrl}`);
      
      // Force reload to apply changes
      window.location.reload();
    } catch (err) {
      console.error("Failed to update API config:", err);
      setError("Failed to update API configuration");
    }
  };

  // Reset to default configuration
  const resetApiConfig = () => {
    const defaultUrl = "http://localhost:8000/api";
    setApiUrl(defaultUrl);
    setTestUrl(`${defaultUrl}/announcements`);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("bersekolah_api_url");
    }
    
    alert("API configuration reset to default");
    
    // Force reload to apply changes
    window.location.reload();
  };

  // Test API connection
  const testApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Raw fetch request with detailed debugging
      console.log(`Testing connection to: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        mode: "cors",
        credentials: "omit",
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);
      
      // Try to parse the response body
      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data,
        ok: response.ok,
      });
    } catch (err: any) {
      console.error("API test failed:", err);
      setError(`API test failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Connection Diagnostics</h1>
      
      {/* API Configuration Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Update your API connection settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">API Base URL</label>
              <Input 
                type="text" 
                value={apiUrl} 
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="e.g. http://localhost:8000/api"
                className="w-full"
              />
            </div>
            <p className="text-sm text-gray-500">
              This will be stored in localStorage and used for all API requests. Reload the page after changing.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button onClick={updateApiConfig} className="bg-green-600 hover:bg-green-700">
            Save Configuration
          </Button>
          <Button onClick={resetApiConfig} variant="outline">
            Reset to Default
          </Button>
        </CardFooter>
      </Card>
      
      {/* API Testing Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>Test your API connection settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Test URL</label>
              <Input 
                type="text" 
                value={testUrl} 
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="e.g. http://localhost:8000/api/announcements"
                className="w-full"
              />
            </div>
            <div>
              <Button onClick={testApi} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Test Results */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              Test Results - {testResult.ok ? (
                <span className="text-green-600">Success</span>
              ) : (
                <span className="text-red-600">Failed</span>
              )}
            </CardTitle>
            <CardDescription>
              Status: {testResult.status} {testResult.statusText}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowHeaders(!showHeaders)}
                >
                  {showHeaders ? "Hide Headers" : "Show Headers"}
                </Button>
                
                {showHeaders && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Response Headers:</h4>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(testResult.headers, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Response Body:</h4>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {typeof testResult.data === 'object' 
                    ? JSON.stringify(testResult.data, null, 2) 
                    : testResult.data}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
