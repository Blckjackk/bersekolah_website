import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const FAQSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
  order: z.number().optional(),
  status: z.enum(['active', 'inactive']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type FAQ = z.infer<typeof FAQSchema>;

export const FAQService = {
  getAllFAQs: async () => {
    try {
      const response = await fetch(`${API_URL}/faq`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch FAQs');

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  },

  getFAQById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/faq/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch FAQ');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      throw error;
    }
  },

  createFAQ: async (faqData: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${API_URL}/faq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify(faqData)
      });

      if (!response.ok) throw new Error('Failed to create FAQ');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  },

  updateFAQ: async (id: number, faqData: Partial<FAQ>) => {
    try {
      const response = await fetch(`${API_URL}/faq/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify(faqData)
      });

      if (!response.ok) throw new Error('Failed to update FAQ');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  },

  deleteFAQ: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/faq/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete FAQ');

      return true;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  }
};
