// API Configuration File
// This file provides centralized configuration for API connections

/**
 * API Configuration
 * - baseURL: The base URL for API calls
 * - timeout: Timeout in milliseconds
 * - endpoints: Specific API endpoints
 */

// Get the API URL from sources in order of preference:
// 1. localStorage (if in browser)
// 2. Default value - no longer using environment variables
let baseURL = 'http://localhost:8000/api';

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  const storedApiUrl = localStorage.getItem('bersekolah_api_url');
  if (storedApiUrl) {
    baseURL = storedApiUrl;
  }
}

// Log API Base URL for debugging
console.log('Menggunakan API Base URL:', baseURL);

const ApiConfig = {
  // Base configuration
  baseURL,
  timeout: 15000,
    // API Endpoints
  endpoints: {
    announcements: '/announcements',
    announcement: (id: number) => `/announcements/${id}`,
    // Debug endpoints
    debug: {
      cors: '/debug/cors-test',
      announcements: '/debug/announcements',
    },
    // Other endpoints
    users: '/users',
    authentication: {
      login: '/login',
      register: '/register',
      logout: '/logout',
    }
  },
  
  // Headers
  headers: {
    common: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }
};

export default ApiConfig;
