// Announcement Service
// This service handles API calls for announcements

export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  tag: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions for API requests
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bersekolah_auth_token');
  }
  return null;
};

// Generic API request function
const apiRequest = async <T>(
  url: string, 
  method: string = 'GET', 
  body?: any, 
  requiresAuth: boolean = true
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (requiresAuth) {
    const token = getAuthToken();
    // For debugging purposes, continue even without token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Using token:', token ? 'Yes' : 'No');
  }

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const requestUrl = `${API_BASE_URL}${url}`;
  console.log(`Making ${method} request to: ${requestUrl}`);
  
  try {
    const response = await fetch(requestUrl, options);
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Error response:', errorData);
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    return responseData;
  } catch (error) {
    console.error(`API Request failed for ${url}:`, error);
    throw error;
  }
};

// Announcement Service
export const AnnouncementService = {
  // Get all announcements (admin)
  getAllAnnouncements: async (): Promise<Announcement[]> => {
    console.log('Getting all announcements');
    
    try {
      // Try admin endpoint first
      try {
        const response = await apiRequest<{success: boolean, data: Announcement[]} | Announcement[]>('/announcements');
        
        if (Array.isArray(response)) {
          return response;
        } else if (response && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        }
      } catch (adminError) {
        console.warn('Admin endpoint failed:', adminError);
        
        // If admin endpoint fails, try public endpoint
        try {
          const publicResponse = await apiRequest<{success: boolean, data: Announcement[]} | Announcement[]>(
            '/announcements', 
            'GET', 
            undefined, 
            false
          );
          
          if (Array.isArray(publicResponse)) {
            return publicResponse;
          } else if (publicResponse && 'data' in publicResponse && Array.isArray(publicResponse.data)) {
            return publicResponse.data;
          }
        } catch (publicError) {
          console.error('Public endpoint also failed:', publicError);
          throw publicError;
        }
      }
      
      return [];
    } catch (error: any) {
      console.error('Error in getAllAnnouncements:', error);
      throw error;
    }
  },

  // Get public announcements
  getPublicAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const response = await apiRequest<{success: boolean, data: Announcement[]} | Announcement[]>(
        '/announcements', 
        'GET', 
        undefined, 
        false
      );
      
      if (Array.isArray(response)) {
        return response;
      } else if ('data' in response && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting public announcements:', error);
      return [];
    }
  },

  // Get a single announcement
  getAnnouncement: async (id: number): Promise<Announcement> => {
    try {
      const response = await apiRequest<{success: boolean, data: Announcement}>(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting announcement ${id}:`, error);
      throw error;
    }
  },

  // Create a new announcement
  createAnnouncement: async (data: Partial<Announcement>): Promise<Announcement> => {
    try {
      const response = await apiRequest<{success: boolean, data: Announcement}>('/announcements', 'POST', data);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update an announcement
  updateAnnouncement: async (id: number, data: Partial<Announcement>): Promise<Announcement> => {
    try {
      const response = await apiRequest<{success: boolean, data: Announcement}>(
        `/announcements/${id}`, 
        'PUT', 
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating announcement ${id}:`, error);
      throw error;
    }
  },

  // Delete an announcement
  deleteAnnouncement: async (id: number): Promise<void> => {
    try {
      await apiRequest<{success: boolean, message: string}>(`/announcements/${id}`, 'DELETE');
    } catch (error) {
      console.error(`Error deleting announcement ${id}:`, error);
      throw error;
    }
  },

  // Update announcement status
  updateAnnouncementStatus: async (id: number, status: 'draft' | 'published' | 'archived'): Promise<Announcement> => {
    try {
      const response = await apiRequest<{success: boolean, data: Announcement}>(
        `/announcements/${id}/status`, 
        'PATCH', 
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating announcement ${id} status:`, error);
      throw error;
    }
  },
};
