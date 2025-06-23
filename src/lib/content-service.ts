import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const ContentSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  author_id: z.number(),
  category: z.string(),
  featured_image: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  view_count: z.number().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Content = z.infer<typeof ContentSchema>;

export const ContentService = {
  getAllContent: async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error('Authentication token missing. Please login again.');
      }
      
      const response = await fetch(`${API_URL}/content`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch content: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },
  
  getContentStats: async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        return { total: 0, published: 0, draft: 0, archived: 0 };
      }
      
      const response = await fetch(`${API_URL}/content/stats`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return { total: 0, published: 0, draft: 0, archived: 0 };
      }

      const data = await response.json();
      return data.data || { total: 0, published: 0, draft: 0, archived: 0 };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      return { total: 0, published: 0, draft: 0, archived: 0 };
    }
  },

  getContentById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/content/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch content');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  createContent: async (contentData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: contentData
      });

      if (!response.ok) throw new Error('Failed to create content');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  updateContent: async (id: number, contentData: FormData) => {
    try {
      contentData.append('_method', 'PUT'); // For Laravel to recognize this as PUT request
      const response = await fetch(`${API_URL}/content/${id}`, {
        method: 'POST', // Using POST with _method field for file uploads
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: contentData
      });

      if (!response.ok) throw new Error('Failed to update content');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  deleteContent: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/content/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete content');

      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }
};
