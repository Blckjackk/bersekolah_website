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

export interface CreateTestimoniRequest {
  nama: string;
  angkatan_beswan: string;
  sekarang_dimana?: string;
  isi_testimoni: string;
  foto_testimoni?: File;
  status: 'active' | 'inactive';
}

export interface UpdateTestimoniRequest {
  nama: string;
  angkatan_beswan: string;
  sekarang_dimana?: string;
  isi_testimoni: string;
  foto_testimoni?: File;
  status: 'active' | 'inactive';
}

export const TestimoniService = {
  // Helper function to get correct image URL
  getImageUrl: (imagePath?: string): string => {
    // If no image path provided, return default
    if (!imagePath || imagePath === 'null' || imagePath === '') {
      return '/assets/image/testimoni/default.jpg';
    }
    
    // If it's already 'default.jpg', return the correct path
    if (imagePath === 'default.jpg') {
      return '/assets/image/testimoni/default.jpg';
    }
    
    // If the path already starts with /assets, return as is
    if (imagePath.startsWith('/assets')) {
      return imagePath;
    }
    
    // If the path already includes the domain, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Extract filename
    let filename = imagePath;
    if (filename.includes('/')) {
      filename = filename.split('/').pop() || 'default.jpg';
    }
    
    // Return local path for frontend assets
    return `/assets/image/testimoni/${filename}`;
  },

  getAllTestimoni: async (): Promise<Testimoni[]> => {
    try {
      const response = await fetch(`${API_URL}/testimonis`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  getTestimoniById: async (id: number): Promise<Testimoni> => {
    try {
      const response = await fetch(`${API_URL}/testimonis/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonial');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      throw error;
    }
  },

  createTestimoni: async (testimoni: CreateTestimoniRequest): Promise<Testimoni> => {
    try {
      const formData = new FormData();
      formData.append('nama', testimoni.nama);
      formData.append('angkatan_beswan', testimoni.angkatan_beswan);
      if (testimoni.sekarang_dimana) {
        formData.append('sekarang_dimana', testimoni.sekarang_dimana);
      }
      formData.append('isi_testimoni', testimoni.isi_testimoni);
      formData.append('status', testimoni.status);
      
      if (testimoni.foto_testimoni) {
        formData.append('foto_testimoni', testimoni.foto_testimoni);
      }

      const response = await fetch(`${API_URL}/testimonis`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create testimonial');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  },

  updateTestimoni: async (id: number, testimoni: UpdateTestimoniRequest): Promise<Testimoni> => {
    try {
      const formData = new FormData();
      formData.append('nama', testimoni.nama);
      formData.append('angkatan_beswan', testimoni.angkatan_beswan);
      if (testimoni.sekarang_dimana) {
        formData.append('sekarang_dimana', testimoni.sekarang_dimana);
      }
      formData.append('isi_testimoni', testimoni.isi_testimoni);
      formData.append('status', testimoni.status);
      formData.append('_method', 'PUT');
      
      if (testimoni.foto_testimoni) {
        formData.append('foto_testimoni', testimoni.foto_testimoni);
      }

      const response = await fetch(`${API_URL}/testimonis/${id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update testimonial');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },

  deleteTestimoni: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/testimonis/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  },

  updateTestimoniStatus: async (id: number, status: 'active' | 'inactive'): Promise<Testimoni> => {
    try {
      const response = await fetch(`${API_URL}/testimonis/${id}/status`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update testimonial status');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      throw error;
    }
  },

  getTestimoniTotal: async (): Promise<{total: number, active: number, inactive: number}> => {
    try {
      const response = await fetch(`${API_URL}/testimonis/total`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonial stats');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching testimonial stats:', error);
      throw error;
    }
  }
};
