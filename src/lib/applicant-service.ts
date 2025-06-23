import axios, { AxiosError } from 'axios';
import { z } from 'zod';

// Base URL dari environment atau fallback ke localhost
const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => localStorage.getItem('bersekolah_auth_token');

// =======================
// Zod Schemas
// =======================
export const StageSchema = z.object({
  name: z.string(),
  status: z.enum(["completed", "in_progress", "pending"]),
  date: z.string()
});

export const ApplicationDetailsSchema = z.object({
  program: z.string(),
  batch: z.string(),
  currentStage: z.string(),
  stages: z.array(StageSchema)
});

export const PersonalDataSchema = z.object({
  fullName: z.string(),
  nickname: z.string(),
  birthDate: z.string(),
  address: z.string(),
  gender: z.string(),
  school: z.string(),
  religion: z.string(),
  childNumber: z.number(),
  totalSiblings: z.number(),
  whatsapp: z.string()
});

export const FamilyDataSchema = z.object({
  fatherName: z.string(),
  fatherJob: z.string(),
  fatherIncome: z.string(),
  motherName: z.string(),
  motherJob: z.string(),
  motherIncome: z.string()
});

export const DocumentSchema = z.object({
  name: z.string(),
  status: z.enum(["complete", "incomplete"])
});

export const EssaySchema = z.object({
  title: z.string(),
  content: z.string()
});

export const ApplicantSchema = z.object({
  id: z.string(),
  status: z.enum(["Pending", "Diterima", "Ditolak"]),
  applicationDate: z.string(),
  applicationDetails: ApplicationDetailsSchema,
  personalData: PersonalDataSchema,
  familyData: FamilyDataSchema,
  documents: z.array(DocumentSchema),
  essays: z.array(EssaySchema)
});

export const BeswanSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  university: z.string(),
  program: z.string(),
  gpa: z.number(),
  semester: z.number(),
  major: z.string(),
  address: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  created_at: z.string()
});

// =======================
// Types
// =======================
export type Stage = z.infer<typeof StageSchema>;
export type ApplicationDetails = z.infer<typeof ApplicationDetailsSchema>;
export type PersonalData = z.infer<typeof PersonalDataSchema>;
export type FamilyData = z.infer<typeof FamilyDataSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Essay = z.infer<typeof EssaySchema>;
export type Applicant = z.infer<typeof ApplicantSchema>;
export type Beswan = z.infer<typeof BeswanSchema>;

export interface BeswanListItem {
  id?: number;
  user_id: number;
  nama_panggilan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
  };
  keluarga?: {
    id: number;
    beswan_id: number;
    nama_ayah: string;
    pekerjaan_ayah: string;
    penghasilan_ayah: string;
    nama_ibu: string;
    pekerjaan_ibu: string;
    penghasilan_ibu: string;
    anak_ke: number;
    jumlah_saudara: number;
    created_at?: string;
    updated_at?: string;
  };
  sekolah?: {
    id: number;
    beswan_id: number;
    nama_sekolah: string;
    jenjang: string;
    jurusan: string;
    tahun_masuk: string;
    ipk_terakhir: string;
    semester_saat_ini: string;
    created_at?: string;
    updated_at?: string;
  };
  alamat?: {
    id: number;
    beswan_id: number;
    alamat_lengkap: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
    created_at?: string;
    updated_at?: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// =======================
// Applicant Service
// =======================
export const ApplicantService = {
  getApplicants: async (page = 1, limit = 10): Promise<PaginatedResponse<Applicant>> => {
    try {
      const response = await axios.get(`${API_URL}/applicants`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'fetching applicants');
    }
  },

  getApplicant: async (id: string): Promise<Applicant> => {
    try {
      const response = await axios.get(`${API_URL}/applicants/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return ApplicantSchema.parse(response.data);
    } catch (error) {
      handleAxiosError(error, `fetching applicant ${id}`);
    }
  },

  updateApplicantStatus: async (id: string, status: Applicant['status'], notes?: string): Promise<void> => {
    try {
      await axios.patch(`${API_URL}/applicants/${id}/status`, { status, notes }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } catch (error) {
      handleAxiosError(error, `updating status for applicant ${id}`);
    }
  },

  addReviewerNotes: async (id: string, notes: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/applicants/${id}/notes`, { notes }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } catch (error) {
      handleAxiosError(error, `adding notes for applicant ${id}`);
    }
  },

  getApplicantDocuments: async (id: string): Promise<Document[]> => {
    try {
      const response = await axios.get(`${API_URL}/applicants/${id}/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, `fetching documents for applicant ${id}`);
    }
  },
  getBeswanList: async (periodId?: number): Promise<BeswanListItem[]> => {
    try {
      let url = `${API_URL}/beswan`;
      if (periodId) {
        url += `?period_id=${periodId}`;
      }
      
      console.log(`Fetching beswan list from: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      console.log('Beswan API response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching beswan list:', error);
      throw error;
    }
  },
  
  getBeasiswaPeriods: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/beasiswa-periods`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching beasiswa periods:', error);
      throw error;
    }
  },
  createBeswan: async (data: any) => {
    try {
      const response = await axios.post(`${API_URL}/beswan`, data, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating beswan:', error);
      throw error;
    }
  },

  deleteBeswan: async (id: number) => {
    try {
      const response = await axios.delete(`${API_URL}/beswan/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting beswan:', error);
      throw error;
    }
  },
    getBeswan: async (id: number): Promise<BeswanListItem> => {
    try {
      const response = await axios.get(`${API_URL}/beswan/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      console.log(`Fetched details for beswan ID ${id}:`, response.data);
      
      const beswanData = response.data.data;
      if (!beswanData) {
        throw new Error('Data pendaftar tidak ditemukan atau kosong');
      }
      
      return beswanData;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new Error('Data pendaftar tidak ditemukan');
      } else if (error instanceof Error) {
        console.error(`Error fetching beswan ${id}:`, error);
        throw error;
      } else {
        console.error(`Unexpected error fetching beswan ${id}:`, error);
        throw new Error('Terjadi kesalahan saat mengambil data pendaftar');
      }
    }
  }
};

// =======================
// Utility Error Handler
// =======================
function handleAxiosError(error: unknown, context: string): never {
  if (error instanceof AxiosError) {
    console.error(`Axios error during ${context}:`, error.response?.data || error.message);
  } else {
    console.error(`Unexpected error during ${context}:`, error);
  }
  throw error;
}

// =======================
// Default Export (for convenience)
// =======================
export default ApplicantService;
