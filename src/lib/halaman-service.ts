import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const HalamanSchema = z.object({
  id: z.number(),
  judul_halaman: z.string(),
  slug: z.string(),
  deskripsi: z.string(),
  category: z.string(),
  gambar: z.string().nullable().optional(),
  status: z.string(),
  user_id: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Halaman = z.infer<typeof HalamanSchema>;

// Input form schema for creating or updating pages
export const HalamanFormSchema = z.object({
  judul_halaman: z.string()
    .min(5, { message: 'Judul halaman minimal 5 karakter' })
    .max(255, { message: 'Judul halaman maksimal 255 karakter' }),
  slug: z.string()
    .min(3, { message: 'Slug minimal 3 karakter' })
    .max(255, { message: 'Slug maksimal 255 karakter' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung' }),
  deskripsi: z.string()
    .min(10, { message: 'Deskripsi minimal 10 karakter' }),
  category: z.string()
    .min(3, { message: 'Kategori minimal 3 karakter' })
    .max(100, { message: 'Kategori maksimal 100 karakter' }),
  status: z.enum(['draft', 'published', 'archived']),
  gambar: z.instanceof(File).optional().nullable(),
});

export type HalamanFormData = z.infer<typeof HalamanFormSchema>;

export const HalamanService = {
  getAllHalaman: async () => {
    try {
      const response = await fetch(`${API_URL}/admin-konten`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch halaman');

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching halaman:', error);
      throw error;
    }
  },

  getHalamanById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/admin-konten/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch halaman details');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching halaman details:', error);
      throw error;
    }
  },

  createHalaman: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/admin-konten`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create halaman');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating halaman:', error);
      throw error;
    }
  },

  updateHalaman: async (id: number, formData: FormData) => {
    try {
      // Add _method field for Laravel to handle PUT request with FormData
      formData.append('_method', 'PUT');
      
      const response = await fetch(`${API_URL}/admin-konten/${id}`, {
        method: 'POST', // Use POST with _method for Laravel
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update halaman');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating halaman:', error);
      throw error;
    }
  },

  deleteHalaman: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/admin-konten/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete halaman');
      }

      return true;
    } catch (error) {
      console.error('Error deleting halaman:', error);
      throw error;
    }
  },
  
  updateHalamanStatus: async (id: number, status: string) => {
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('_method', 'PUT');
      
      const response = await fetch(`${API_URL}/admin-konten/${id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating halaman status:', error);
      throw error;
    }
  }
};
