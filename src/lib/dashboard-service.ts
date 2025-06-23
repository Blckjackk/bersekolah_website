import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Zod schema for Dashboard Statistics
export const DashboardStatsSchema = z.object({
  total_pendaftar: z.number(),
  total_mentor: z.number(),
  total_beswan: z.number(),
  total_dokumen: z.number(),
  dokumen_terverifikasi: z.number().optional(),
  konten_aktif: z.number().optional(),
  user_aktif: z.number().optional()
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

// Zod schema for Application Statistics
export const ApplicationStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  by_period: z.array(z.object({
    period_id: z.number(),
    period_name: z.string(),
    count: z.number()
  }))
});

export type ApplicationStats = z.infer<typeof ApplicationStatsSchema>;

export const DashboardService = {
  // Get quick actions stats
  getQuickActionStats: async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(`${API_URL}/dashboard/quick-actions`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values to prevent UI from breaking
      return {
        total_pendaftar: 0,
        total_mentor: 0,
        total_beswan: 0,
        total_dokumen: 0
      };
    }
  },
  
  // Get application statistics
  getApplicationStats: async (): Promise<ApplicationStats> => {
    try {
      const response = await fetch(`${API_URL}/applications/statistics`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      // Return default values to prevent UI from breaking
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        by_period: []
      };
    }
  },

  // Get recent activities (could be recent applications, documents, etc)
  getRecentActivities: async () => {
    try {
      // This endpoint might not exist, so we would need to create it
      const response = await fetch(`${API_URL}/recent-activities`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Return empty array if endpoint doesn't exist
      return [];
    }
  }
};
