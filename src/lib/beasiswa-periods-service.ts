const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface BeasiswaPeriod {
  id: number;
  tahun: number;
  nama_periode: string;
  deskripsi: string;
  mulai_pendaftaran: string;
  akhir_pendaftaran: string;
  mulai_beasiswa: string;
  akhir_beasiswa: string;
  status: 'draft' | 'active' | 'closed';
  is_active: boolean;
  applicants_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BeasiswaPeriodsResponse {
  success: boolean;
  message: string;
  data: BeasiswaPeriod[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }
}

export interface BeasiswaPeriodResponse {
  success: boolean;
  message: string;
  data: BeasiswaPeriod;
}

export interface BeasiswaPeriodForm {
  tahun: number;
  nama_periode: string;
  deskripsi: string;
  mulai_pendaftaran: string;
  akhir_pendaftaran: string;
  mulai_beasiswa: string;
  akhir_beasiswa: string;
  status: 'draft' | 'active' | 'closed';
  is_active: boolean;
}

export async function fetchBeasiswaPeriods(params?: {
  search?: string;
  status?: string;
  tahun?: number;
  per_page?: number;
  page?: number;
}): Promise<BeasiswaPeriodsResponse> {
  const token = localStorage.getItem('bersekolah_auth_token');
  if (!token) {
    throw new Error('No authentication token');
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.tahun) queryParams.append('tahun', params.tahun.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());
  }

  const response = await fetch(`${API_URL}/beasiswa-periods?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch beasiswa periods');
  }

  return await response.json();
}

export async function fetchBeasiswaPeriod(id: number | string): Promise<BeasiswaPeriodResponse> {
  const token = localStorage.getItem('bersekolah_auth_token');
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/beasiswa-periods/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch beasiswa period');
  }

  return await response.json();
}

export async function createBeasiswaPeriod(data: BeasiswaPeriodForm): Promise<BeasiswaPeriodResponse> {
  const token = localStorage.getItem('bersekolah_auth_token');
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/beasiswa-periods`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create beasiswa period');
  }

  return await response.json();
}

export async function updateBeasiswaPeriod(id: number | string, data: BeasiswaPeriodForm): Promise<BeasiswaPeriodResponse> {
  const token = localStorage.getItem('bersekolah_auth_token');
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/beasiswa-periods/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update beasiswa period');
  }

  return await response.json();
}

export async function deleteBeasiswaPeriod(id: number | string): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem('bersekolah_auth_token');
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/beasiswa-periods/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete beasiswa period');
  }

  return await response.json();
}

export async function togglePeriodActive(id: number | string): Promise<BeasiswaPeriodResponse> {
  const token = localStorage.getItem('bersekolah_auth_token');
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/beasiswa-periods/${id}/toggle-active`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to toggle period activation status');
  }

  return await response.json();
}
