import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Zod schema for Mentor data validation - Disesuaikan dengan API backend
export const MentorSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  photo: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Fields tambahan untuk frontend
  position: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

export type Mentor = z.infer<typeof MentorSchema>;

export const MentorService = {
  // Mendapatkan semua mentor dari API
  getAllMentors: async () => {
    try {
      const response = await fetch(`${API_URL}/mentors`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch mentors');

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching mentors:', error);
      throw error;
    }
  },

  // Mendapatkan total mentor dari API
  getTotalMentors: async () => {
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

  // Mendapatkan mentor berdasarkan ID
  getMentorById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch mentor');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching mentor:', error);
      throw error;
    }
  },

  // Membuat mentor baru
  createMentor: async (mentorData: Omit<Mentor, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/mentors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify(mentorData)
      });

      if (!response.ok) throw new Error('Failed to create mentor');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating mentor:', error);
      throw error;
    }
  },

  // Mengupdate mentor yang ada
  updateMentor: async (id: number, mentorData: Partial<Mentor>) => {
    try {
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify(mentorData)
      });

      if (!response.ok) throw new Error('Failed to update mentor');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating mentor:', error);
      throw error;
    }
  },

  // Menghapus mentor
  deleteMentor: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/mentors/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete mentor');

      return true;
    } catch (error) {
      console.error('Error deleting mentor:', error);
      throw error;
    }
  }
};
