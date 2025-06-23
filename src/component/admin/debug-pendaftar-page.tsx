"use client"

import React from "react";

export default function DebugPendaftarBeasiswaPage() {
  return (
    <div className="space-y-6 p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold">Debug Pendaftar Beasiswa Page</h1>
      <p className="text-gray-600">This is a debug version of the component to help diagnose rendering issues.</p>
      
      <div className="p-4 bg-blue-100 border border-blue-200 rounded">
        <p>If you're seeing this, the React component is rendering correctly.</p>
        <p>The issue might be with data fetching or API connectivity.</p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-medium mb-2">Common Issues:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>API server is not running</li>
            <li>Authentication token is missing or invalid</li>
            <li>Network connectivity problems</li>
            <li>CORS issues blocking API requests</li>
          </ul>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-medium mb-2">How to Fix:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check browser console for errors</li>
            <li>Ensure you're logged in with valid credentials</li>
            <li>Verify API server is running at correct URL</li>
            <li>Try clearing browser cache and cookies</li>
          </ul>
        </div>
      </div>
      
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => {
          console.log("Debug: Checking localStorage token");
          const token = localStorage.getItem('bersekolah_auth_token');
          alert(token ? "Auth token exists in localStorage" : "No auth token found in localStorage!");
        }}
      >
        Check Authentication Token
      </button>
    </div>
  );
}
