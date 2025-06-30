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

export const ArtikelService = {
  // Helper function untuk mendapatkan URL gambar artikel
  getImageUrl: (imagePath?: string): string => {
    // If no image path provided, return default
    if (!imagePath || imagePath === 'null' || imagePath === '') {
      return '/storage/artikel/default.jpg';
    }
    
    // If it's already 'default.jpg', return the correct path
    if (imagePath === 'default.jpg') {
      return '/storage/artikel/default.jpg';
    }
    
    // If the path already starts with /storage, return as is (for storage files)
    if (imagePath.startsWith('/storage')) {
      return imagePath;
    }
    
    // If the path already includes the domain, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Extract filename from any path structure
    let filename = imagePath;
    if (filename.includes('/')) {
      filename = filename.split('/').pop() || 'default.jpg';
    }
    
    // Return storage path for frontend assets
    return `/storage/artikel/${filename}`;
  },

  getAllArtikels: async (): Promise<Artikel[]> => {
    try {
      const response = await fetch(`${API_URL}/artikels`, {
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
  },

  getArtikelById: async (id: number): Promise<Artikel> => {
    try {
      const response = await fetch(`${API_URL}/artikels/${id}`, {
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
  },

  createArtikel: async (artikel: CreateArtikelRequest): Promise<Artikel> => {
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

      const response = await fetch(`${API_URL}/artikels`, {
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
  },

  updateArtikel: async (id: number, artikel: UpdateArtikelRequest): Promise<Artikel> => {
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

      const response = await fetch(`${API_URL}/artikels/${id}`, {
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
  },

  deleteArtikel: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/artikels/${id}`, {
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
  },

  updateArtikelStatus: async (id: number, status: 'draft' | 'published' | 'archived'): Promise<Artikel> => {
    try {
      const response = await fetch(`${API_URL}/artikels/${id}/status`, {
        method: 'PUT',
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
};