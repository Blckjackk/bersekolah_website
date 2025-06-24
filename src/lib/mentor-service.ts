const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Mentor {
  id: number;
  name: string;
  email: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

export const MentorService = {
  getAllMentors: async (): Promise<Mentor[]> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/mentors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentors: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Mentor API response:', data);
      
      // Handle different response formats
      if (data.data) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error in getAllMentors:', error);
      throw error;
    }
  },
  
  // Get total mentors count
  getTotalMentors: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_URL}/mentors/total`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch total mentors');

      const data = await response.json();
      return data.total || 0;
    } catch (error) {
      console.error('Error fetching mentor total:', error);
      return 0; // Default to 0 if error
    }
  },
  
  getMentorById: async (id: number): Promise<Mentor> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentor: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Mentor detail API response:', data);
      
      return data.data || data;
    } catch (error) {
      console.error(`Error in getMentorById (${id}):`, error);
      throw error;
    }
  },
  
  createMentor: async (mentorData: any, photoFile: File | null): Promise<Mentor> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const formData = new FormData();
        // Add mentor data to form
      formData.append('name', mentorData.name);
      formData.append('email', mentorData.email);
      
      // Specify upload directory
      if (mentorData.upload_to) {
        formData.append('upload_to', mentorData.upload_to);
      }
      
      // Add photo if provided
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      const response = await fetch(`${API_URL}/mentors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create mentor: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error in createMentor:', error);
      throw error;
    }
  },
  
  updateMentor: async (id: number, mentorData: any, photoFile: File | null): Promise<Mentor> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const formData = new FormData();
        // Add mentor data to form
      formData.append('name', mentorData.name);
      formData.append('email', mentorData.email);
      formData.append('_method', 'PUT'); // Laravel form method spoofing
      
      // Specify upload directory
      if (mentorData.upload_to) {
        formData.append('upload_to', mentorData.upload_to);
      }
      
      // Include existing photo path if not uploading new one
      if (mentorData.photo && !photoFile) {
        formData.append('existing_photo', mentorData.photo);
      }
      
      // Add photo if provided
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        method: 'POST', // Using POST with _method for Laravel method spoofing
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update mentor: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error in updateMentor (${id}):`, error);
      throw error;
    }
  },
  
  deleteMentor: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete mentor: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error in deleteMentor (${id}):`, error);
      throw error;
    }
  },
  // updateMentorStatus method removed as it's no longer needed
  
  // Method to get active mentors for public display
  getPublicMentors: async (): Promise<Mentor[]> => {
    try {
      const response = await fetch(`${API_URL}/mentors`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch public mentors: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error in getPublicMentors:', error);
      throw error;
    }
  }
};
