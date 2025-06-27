const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Artikel {
  id: number;
  judul_halaman: string;
  slug: string;
  deskripsi: string;
  category: string;
  gambar?: string;
  status: 'draft' | 'published' | 'archived';
  user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateArtikelRequest {
  judul_halaman: string;
  slug: string;
  deskripsi: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  gambar?: File;
}

export interface UpdateArtikelRequest {
  judul_halaman: string;
  slug: string;
  deskripsi: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  gambar?: File;
}

export class ArtikelService {
  private static readonly baseUrl = '/api/admin-konten';

  static async getAllArtikels(): Promise<Artikel[]> {
    try {
      const response = await fetch(`${API_URL}/admin-konten`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  static async getArtikelById(id: number): Promise<Artikel> {
    try {
      const response = await fetch(`${API_URL}/admin-konten/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  }

  static async createArtikel(artikel: CreateArtikelRequest): Promise<Artikel> {
    try {
      const formData = new FormData();
      formData.append('judul_halaman', artikel.judul_halaman);
      formData.append('slug', artikel.slug);
      formData.append('deskripsi', artikel.deskripsi);
      formData.append('category', artikel.category);
      formData.append('status', artikel.status);
      
      if (artikel.gambar) {
        formData.append('gambar', artikel.gambar);
      }

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
        throw new Error(errorData.message || 'Failed to create article');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  static async updateArtikel(id: number, artikel: UpdateArtikelRequest): Promise<Artikel> {
    try {
      const formData = new FormData();
      formData.append('judul_halaman', artikel.judul_halaman);
      formData.append('slug', artikel.slug);
      formData.append('deskripsi', artikel.deskripsi);
      formData.append('category', artikel.category);
      formData.append('status', artikel.status);
      formData.append('_method', 'PUT');
      
      if (artikel.gambar) {
        formData.append('gambar', artikel.gambar);
      }

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
        throw new Error(errorData.message || 'Failed to update article');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  static async deleteArtikel(id: number): Promise<void> {
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
        throw new Error(errorData.message || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  static async updateArtikelStatus(id: number, status: 'draft' | 'published' | 'archived'): Promise<Artikel> {
    try {
      const response = await fetch(`${API_URL}/admin-konten/${id}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bersekolah_auth_token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update article status');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating article status:', error);
      throw error;
    }
  }

  static getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/placeholder-avatar.png';
    }
    
    // If the path already includes the domain or starts with http, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('/storage')) {
      return imagePath;
    }
    
    // If it's just a filename, construct the full URL
    if (!imagePath.includes('/')) {
      const baseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000';
      return `${baseUrl}/storage/uploads/konten/${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path that needs the storage prefix
    const baseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${imagePath}`;
  }
}
