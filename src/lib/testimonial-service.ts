import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const TestimonialSchema = z.object({
  id: z.number(),
  name: z.string(),
  angkatan_beswan: z.string(),
  sekarang_dimana: z.string(),
  isi_testimoni: z.string(),
  foto_testimoni: z.string(),
  status: z.enum(['active', 'inactive']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Testimonial = z.infer<typeof TestimonialSchema>;

export const TestimonialService = {
  getAllTestimonials: async () => {
    try {
      const response = await fetch(`${API_URL}/testimoni`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch testimonials');

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  getTestimonialById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/testimoni/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch testimonial');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      throw error;
    }
  },

  createTestimonial: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/testimoni`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create testimonial');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  },

  updateTestimonial: async (id: number, formData: FormData) => {
    try {
      formData.append('_method', 'PUT'); // For Laravel to recognize this as PUT request
      const response = await fetch(`${API_URL}/testimoni/${id}`, {
        method: 'POST', // Using POST with _method field for file uploads
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update testimonial');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },

  deleteTestimonial: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/testimoni/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete testimonial');

      return true;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
};
