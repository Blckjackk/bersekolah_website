const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Testimoni {
  id: number;
  nama: string;
  angkatan_beswan: string;
  sekarang_dimana?: string;
  isi_testimoni: string;
  foto_testimoni?: string;
  status: 'active' | 'inactive';
  tanggal_input: string;
}

export const TestimoniService = {
  getAllTestimoni: async (): Promise<Testimoni[]> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      console.log('Fetching all testimonials from:', `${API_URL}/admin/testimonials`);
      
      const response = await fetch(`${API_URL}/admin/testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch testimonials:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Testimoni API response:', data);
      
      // Handle response format
      if (data.success && data.data) {
        console.log('Using data.data format, found', data.data.length, 'testimonials');
        return data.data;
      } else if (Array.isArray(data)) {
        console.log('Using array format, found', data.length, 'testimonials');
        return data;
      }
      console.log('No testimonials found in response');
      return [];
    } catch (error) {
      console.error('Error in getAllTestimoni:', error);
      throw error;
    }
  },
  // Get total testimoni count  
  getTotalTestimoni: async (): Promise<number> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      // We'll just use the main endpoint and count the items
      const response = await fetch(`${API_URL}/admin/testimonials`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch total testimoni');

      const data = await response.json();
      
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data.length : 0;
      } else if (Array.isArray(data)) {
        return data.length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching testimoni total:', error);
      return 0; // Default to 0 if error
    }
  },
    getTestimoniById: async (id: number): Promise<Testimoni> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const response = await fetch(`${API_URL}/admin/testimonials/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Testimoni detail API response:', data);
      
      return data.success ? data.data : data;
    } catch (error) {
      console.error(`Error in getTestimoniById (${id}):`, error);
      throw error;
    }
  },
    createTestimoni: async (testimoniData: any, photoFile: File | null): Promise<Testimoni> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const formData = new FormData();
      
      // Add testimoni data to form
      formData.append('nama', testimoniData.nama);
      formData.append('angkatan_beswan', testimoniData.angkatan_beswan);
      
      if (testimoniData.sekarang_dimana) {
        formData.append('sekarang_dimana', testimoniData.sekarang_dimana);
      }
      
      formData.append('isi_testimoni', testimoniData.isi_testimoni);
      formData.append('status', testimoniData.status);
      
      // Add photo if provided
      if (photoFile) {
        formData.append('foto_testimoni', photoFile);
      }
      
      console.log('Creating testimoni with data:', testimoniData);
      
      const response = await fetch(`${API_URL}/admin/testimonials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to create testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Create testimoni API response:', data);
      return data.success ? data.data : data;
    } catch (error) {
      console.error('Error in createTestimoni:', error);
      throw error;
    }
  },
    updateTestimoni: async (id: number, testimoniData: any, photoFile: File | null): Promise<Testimoni> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      const formData = new FormData();
      
      // Add testimoni data to form
      formData.append('nama', testimoniData.nama);
      formData.append('angkatan_beswan', testimoniData.angkatan_beswan);
      
      if (testimoniData.sekarang_dimana) {
        formData.append('sekarang_dimana', testimoniData.sekarang_dimana);
      }
      
      formData.append('isi_testimoni', testimoniData.isi_testimoni);
      formData.append('status', testimoniData.status);
      
      formData.append('_method', 'PUT'); // Laravel form method spoofing
      
      // Add photo if provided
      if (photoFile) {
        formData.append('foto_testimoni', photoFile);
      }
      
      console.log(`Updating testimoni ${id} with data:`, testimoniData);
      
      const response = await fetch(`${API_URL}/admin/testimonials/${id}`, {
        method: 'POST', // Using POST with _method for Laravel method spoofing
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to update testimoni: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Update testimoni API response:', data);
      return data.success ? data.data : data;
    } catch (error) {
      console.error(`Error in updateTestimoni (${id}):`, error);
      throw error;
    }
  },
    deleteTestimoni: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      console.log(`Deleting testimoni ${id}`);
      
      const response = await fetch(`${API_URL}/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to delete testimoni: ${response.status}`);
      }
      
      console.log(`Testimoni ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error in deleteTestimoni (${id}):`, error);
      throw error;
    }
  },
    updateTestimoniStatus: async (id: number, status: 'active' | 'inactive'): Promise<void> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }
      
      console.log(`Updating testimoni ${id} status to ${status}`);
      
      const response = await fetch(`${API_URL}/admin/testimonials/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to update testimoni status: ${response.status}`);
      }
      
      console.log(`Testimoni ${id} status updated to ${status} successfully`);
    } catch (error) {
      console.error(`Error in updateTestimoniStatus (${id}):`, error);
      throw error;
    }
  },
};
