import axios from 'axios';
import ApiConfig from '../config/api-config';

// Define the Announcement interface based on your database schema
export interface Announcement {
    id: number;
    title: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    tag: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

// Create axios instance with default config from our centralized configuration
const apiClient = axios.create({
    baseURL: ApiConfig.baseURL,
    headers: {
        ...ApiConfig.headers?.common,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
    },
    timeout: ApiConfig.timeout,
    // We're accessing public routes with no authentication
    withCredentials: false
});

class AnnouncementService {
    /**
     * Get all published announcements directly from the database API
     */    static async getPublicAnnouncements(): Promise<Announcement[]> {
        const url = `${ApiConfig.baseURL}${ApiConfig.endpoints.announcements}`;
        console.log('Mengambil pengumuman dari API:', url);
        
        // Track which endpoints we've tried
        const attempts = { fetch: false, axios: false, debug: false };
        
        try {
            // ATTEMPT 1: Fetch API with standard endpoint
            attempts.fetch = true;
            const fetchResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                mode: 'cors',
                credentials: 'omit' // Don't send cookies/credentials
            });
            
            if (!fetchResponse.ok) {
                console.error(`API error - Status: ${fetchResponse.status}, Status Text: ${fetchResponse.statusText}`);
                const errorBody = await fetchResponse.text();
                console.error('Error details:', errorBody);
                throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
            }
            
            const jsonData = await fetchResponse.json();
            console.log('Success: Response dari API (fetch):', jsonData);
            return this.extractAnnouncementsFromResponse(jsonData);
            
        } catch (fetchError) {
            console.warn('Fetch API gagal, beralih ke axios:', fetchError);
            
            try {
                // ATTEMPT 2: Axios with standard endpoint
                attempts.axios = true;
                const response = await apiClient.get(ApiConfig.endpoints.announcements);
                console.log('Success: Response dari API (axios):', response.data);
                return this.extractAnnouncementsFromResponse(response.data);
                
            } catch (axiosError) {
                console.error('Axios juga gagal, mencoba endpoint debug:', axiosError);
                
                try {
                    // ATTEMPT 3: Try debug endpoint
                    attempts.debug = true;
                    return await this.getAnnouncementsFromDebugEndpoint();
                    
                } catch (debugError) {
                    console.error('Semua metode fetching gagal:', {fetchError, axiosError, debugError, attempts});
                    
                    // Include diagnostic info in error message
                    const errorInfo = {
                        message: 'Failed to fetch announcements after multiple attempts',
                        attempts,
                        lastError: debugError instanceof Error ? debugError.message : 'Unknown error',
                        apiUrl: ApiConfig.baseURL
                    };
                    
                    throw new Error(JSON.stringify(errorInfo));
                }
            }
        }
    }
    
    /**
     * Helper method to extract announcements from various response structures
     */
    private static extractAnnouncementsFromResponse(data: any): Announcement[] {
        // Handle Laravel API response structure
        if (data && data.success && Array.isArray(data.data)) {
            console.log('Data ditemukan dalam format success.data:', data.data.length, 'pengumuman');
            return data.data;
        } 
        
        if (data && Array.isArray(data.data)) {
            console.log('Data ditemukan dalam format data array:', data.data.length, 'pengumuman');
            return data.data;
        } 
        
        if (data && Array.isArray(data)) {
            console.log('Data ditemukan dalam format array langsung:', data.length, 'pengumuman');
            return data;
        }
        
        // Try to extract data from any object structure
        if (data && typeof data === 'object') {            const possibleData = Object.values(data).find(val => 
                Array.isArray(val) && val.length > 0 && val[0] && 
                (val[0].hasOwnProperty('title') || val[0].hasOwnProperty('content'))
            );
            
            if (possibleData && Array.isArray(possibleData)) {
                console.log('Data ditemukan dalam struktur tidak standar:', possibleData.length, 'pengumuman');
                return possibleData as Announcement[];
            }
        }
        
        console.warn('Tidak dapat menemukan data pengumuman dalam respon');
        return []; // Return empty array as last resort
    }

    /**
     * Get a specific announcement by ID directly from the database
     */
    static async getAnnouncement(id: number): Promise<Announcement> {
        try {
            const response = await apiClient.get(ApiConfig.endpoints.announcement(id));
            
            // Handle Laravel API response structure
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            
            return response.data;
        } catch (error) {
            console.error(`Error fetching announcement with ID ${id}:`, error);
            
            // Try to find the announcement in mock data as fallback
            const mockData = this.getMockAnnouncements();
            const mockAnnouncement = mockData.find(a => a.id === id);
            
            if (mockAnnouncement) {
                return mockAnnouncement;
            }
            
            // If all fails, rethrow the error
            throw error;
        }
    }

    /**
     * Get fallback mock announcements that match the database structure
     * Used when API calls fail
     */
    static getMockAnnouncements(): Announcement[] {
        // Mock data based on the database entries you showed
        return [
            {
                id: 1,
                title: "Pendaftaran Beasiswa Periode 2025",
                content: "<p>Pendaftaran beasiswa periode 2025 telah dibuka. Silakan mendaftar melalui website resmi kami.</p><p>Syarat dan ketentuan dapat dilihat pada halaman informasi beasiswa.</p>",
                status: "published",
                tag: "beasiswa",
                published_at: "2025-06-16 16:29:28",
                created_at: "2025-06-16 16:29:28",
                updated_at: "2025-06-16 16:29:28"
            },
            {
                id: 2,
                title: "Workshop Pengembangan Diri",
                content: "<p>Diberitahukan kepada seluruh penerima beasiswa bahwa akan diadakan workshop pengembangan diri pada tanggal 15 Juli 2025.</p><p>Workshop ini wajib diikuti oleh seluruh penerima beasiswa.</p>",
                status: "published",
                tag: "event",
                published_at: "2025-06-18 16:29:28",
                created_at: "2025-06-18 16:29:28",
                updated_at: "2025-06-18 16:29:28"
            },
            {
                id: 3,
                title: "Pengumuman Hasil Seleksi Tahap 1",
                content: "<p>Pengumuman hasil seleksi tahap 1 telah dirilis. Silakan cek status pendaftaran Anda melalui dashboard aplikasi.</p>",
                status: "published",
                tag: "pengumuman",
                published_at: "2025-06-20 16:29:28",
                created_at: "2025-06-20 16:29:28",
                updated_at: "2025-06-20 16:29:28"
            },
            {
                id: 4,
                title: "Maintenance Website",
                content: "<p>Akan dilakukan maintenance website pada tanggal 25 Juni 2025 pukul 00:00 - 03:00 WIB.</p><p>Mohon maaf atas ketidaknyamanannya.</p>",
                status: "published",
                tag: "info",
                published_at: "2025-06-21 17:28:49",
                created_at: "2025-06-21 16:29:28",
                updated_at: "2025-06-21 17:28:49"
            }
        ];
    }

    /**
     * Get announcements with fallback to mock data
     */
    static async getAnnouncementsWithFallback(): Promise<Announcement[]> {
        try {
            // First try to get data from API
            const apiData = await this.getPublicAnnouncements();
            
            // If we got data, return it
            if (apiData && apiData.length > 0) {
                console.log('Menggunakan data dari API:', apiData.length, 'pengumuman');
                return apiData;
            }
            
            // If API returned empty array, use mock data
            console.log('API tidak mengembalikan data, menggunakan data mock');
            return this.getMockAnnouncements();
        } catch (error) {
            console.error('Error in getAnnouncementsWithFallback, using mock data:', error);
            return this.getMockAnnouncements();
        }
    }

    /**
     * Try to fetch announcements from the debug endpoint
     * Used as a fallback when the main API endpoint fails
     */
    static async getAnnouncementsFromDebugEndpoint(): Promise<Announcement[]> {
        const url = `${ApiConfig.baseURL}${ApiConfig.endpoints.debug.announcements}`;
        console.log('Mencoba endpoint debug:', url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Debug-Mode': 'true'
                },
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`Debug endpoint error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response dari debug API:', data);
            
            return this.extractAnnouncementsFromResponse(data);
        } catch (error) {
            console.error('Debug endpoint juga gagal:', error);
            throw error;
        }
    }
}

export default AnnouncementService;
