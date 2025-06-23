import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Interface untuk data dokumen
export interface RequiredDocument {
  id: number;
  name: string;
  description: string;
  required: boolean;
  accepted_formats: string;
  max_size: number;
  template_url?: string;
}

// Interface untuk dokumen yang sudah diunggah
export interface UploadedDocument {
  id?: number;
  document_id: number;
  file_path?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at?: string;
  keterangan?: string;
  status?: string;
}

export const BerkasService = {
  // Mendapatkan daftar dokumen wajib
  getRequiredDocuments: async (): Promise<RequiredDocument[]> => {
    try {
      const response = await axios.get(`${API_URL}/upload-type`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching required documents:', error);
      throw error;
    }
  },

  // Mendapatkan dokumen yang sudah diunggah oleh user
  getUserDocuments: async (): Promise<UploadedDocument[]> => {
    try {
      const response = await axios.get(`${API_URL}/berkas-calon-beswan`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  },

  // Mengunggah dokumen baru
  uploadDocument: async (documentId: number, file: File, keterangan?: string): Promise<UploadedDocument> => {
    try {
      const formData = new FormData();
      formData.append('document_id', documentId.toString());
      formData.append('file', file);
      if (keterangan) formData.append('keterangan', keterangan);

      const response = await axios.post(`${API_URL}/berkas-calon-beswan`, formData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Anda bisa menggunakan ini untuk menampilkan progress upload
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Menghapus dokumen
  deleteDocument: async (documentId: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/berkas-calon-beswan/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};