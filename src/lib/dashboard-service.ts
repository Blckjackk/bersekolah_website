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

// Document Statistics Schema
export const DocumentStatsSchema = z.object({
  total_documents: z.number(),
  pending_documents: z.number(),
  approved_documents: z.number(),
  rejected_documents: z.number()
});

export type DocumentStats = z.infer<typeof DocumentStatsSchema>;

// Mentor Schema
export const MentorSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  photo: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Mentor = z.infer<typeof MentorSchema>;

// BeasiswaApplication Schema
export const BeasiswaApplicationSchema = z.object({
  id: z.number(),
  beswan_id: z.number(),
  beasiswa_period_id: z.number(),
  status: z.enum(['pending', 'lolos_berkas', 'lolos_wawancara', 'diterima', 'ditolak']),
  submitted_at: z.string().nullable(),
  catatan_admin: z.string().nullable(),
  interview_link: z.string().nullable(),
  interview_date: z.string().nullable(),
  interview_time: z.string().nullable(),
  finalized_at: z.string().nullable(),
  reviewed_by: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  user_data: z.object({
    name: z.string(),
    email: z.string(),
    calon_beswan: z.object({
      id: z.number(),
      user_id: z.number(),
      nik: z.string(),
      nama_lengkap: z.string(),
      sekolah_beswan: z.object({
        nama_sekolah: z.string(),
        jenjang: z.string(),
        jurusan: z.string()
      }).optional()
    }).optional()
  }).optional()
});

export type BeasiswaApplication = z.infer<typeof BeasiswaApplicationSchema>;

export const DashboardService = {  // Get quick actions stats by aggregating data from multiple endpoints
  getQuickActionStats: async (): Promise<DashboardStats> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      
      // Make parallel API requests for better performance
      const [mentorsResponse, documentsResponse, applicationsResponse, dashboardResponse] = await Promise.all([
        // Get total mentors count
        fetch(`${API_URL}/mentors/total`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        // Get documents statistics
        fetch(`${API_URL}/admin/documents-statistics`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        // Get applications statistics
        fetch(`${API_URL}/admin/applications/statistics`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        // Try the dashboard quick-actions endpoint
        fetch(`${API_URL}/dashboard/quick-actions`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ]);
      
      // Try to use dashboard stats first if available
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('Dashboard API response:', dashboardData);
        return {
          total_pendaftar: dashboardData.total_pendaftar || 0,
          total_beswan: dashboardData.total_beswan || 0,
          total_mentor: dashboardData.total_mentor || 0,
          total_dokumen: dashboardData.total_dokumen || 0,
          dokumen_terverifikasi: dashboardData.dokumen_terverifikasi || 0,
          konten_aktif: dashboardData.konten_aktif || 0,
          user_aktif: dashboardData.user_aktif || 0
        };
      }
      
      // Fall back to parsing individual responses
      console.log('Falling back to individual API responses');
      const mentorsData = mentorsResponse.ok ? await mentorsResponse.json() : { data: { total: 0 } };
      console.log('Mentors API response:', mentorsData);
      
      const documentsData = documentsResponse.ok ? await documentsResponse.json() : { data: { total: 0, verified: 0 } };
      console.log('Documents API response:', documentsData);
      
      const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : { data: { overview: { total: 0 } } };
      console.log('Applications API response:', applicationsData);
      
      // Construct dashboard stats from the aggregated data
      return {
        total_pendaftar: applicationsData.data?.overview?.total || 0,
        total_mentor: mentorsData.data?.total || mentorsData.total || 0,
        total_beswan: applicationsData.data?.overview?.diterima || 0, 
        total_dokumen: documentsData.data?.total || 0,
        dokumen_terverifikasi: documentsData.data?.verified || 0,
        konten_aktif: 0, // This would need another endpoint
        user_aktif: 0 // This would need another endpoint
      };
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
      const token = localStorage.getItem('bersekolah_auth_token');
      console.log('Fetching application statistics...');
      
      const response = await fetch(`${API_URL}/admin/applications/statistics`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application stats');
      }

      const data = await response.json();
      console.log('Application statistics response:', data);
      
      // Handle different response formats
      if (data.data && data.data.overview) {
        // Map from the AdminBeasiswaApplicationController structure
        const overview = data.data.overview;
        const periods = data.data.periods || [];
        
        console.log('Overview data:', overview);
        console.log('Periods data:', periods);
        
        // Find applications count by period
        let periodStats = periods.map((period: {id: number, nama_periode: string, tahun: string}) => {
          return {
            period_id: period.id,
            period_name: `${period.nama_periode} ${period.tahun}`,
            count: 0 // We'll need to calculate this from weekly data or another source
          };
        });        return {
          total: overview.total || 0,
          pending: overview.pending || 0,
          // Match both possible field names for approved/rejected applications
          approved: overview.diterima || 0,
          rejected: overview.ditolak || 0,
          by_period: periodStats
        };
      }
      
      // Fall back to old format if it exists
      if (data.total !== undefined) {
        console.log('Using fallback application stats format');
        return {
          total: data.total || 0,
          pending: data.pending || 0,
          approved: data.approved || 0,
          rejected: data.rejected || 0,
          by_period: data.by_period || []
        };
      }
      
      // Last resort - just return default structure
      console.log('Using default application stats structure');
      return {
        total: 0,
        pending: 0,
        approved: 0, 
        rejected: 0,
        by_period: []
      };
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

  // Get mentors total
  getMentorsTotal: async (): Promise<{ total: number }> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      const response = await fetch(`${API_URL}/mentors/total`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mentors total');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching mentors total:', error);
      return { total: 0 };
    }
  },
  
  // Get document statistics
  getDocumentStatistics: async (): Promise<DocumentStats> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      const response = await fetch(`${API_URL}/admin/documents-statistics`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document statistics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching document statistics:', error);
      return {
        total_documents: 0,
        pending_documents: 0,
        approved_documents: 0,
        rejected_documents: 0
      };
    }
  },
  
  // Get application data
  getApplications: async (): Promise<BeasiswaApplication[]> => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      const response = await fetch(`${API_URL}/admin/applications`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }
};
