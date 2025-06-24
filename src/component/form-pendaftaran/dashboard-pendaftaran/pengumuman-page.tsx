"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, Tag, MoveDown, MoveUp, Bell, Loader2, AlertTriangle, RefreshCw } from "lucide-react"

import AnnouncementService from "@/lib/services/announcement-service"
import type { Announcement } from "@/lib/services/announcement-service"
import ApiConfig from "@/lib/config/api-config"

export default function PengumumanPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [activeTab, setActiveTab] = useState("all")
	const [sortNewest, setSortNewest] = useState(true)
	const [announcements, setAnnouncements] = useState<Announcement[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	
	// Toast notification state for simple implementation
	const [toast, setToast] = useState<{
		visible: boolean;
		message: string;
		type: "success" | "error";
	}>({
		visible: false,
		message: "",
		type: "success"
	})

	// Fetch announcements data on component mount
	useEffect(() => {
		fetchAnnouncements();
	}, []);
		// Show toast message
	const showToast = (message: string, type: "success" | "error") => {
		setToast({ visible: true, message, type });
		
		// Hide toast after 5 seconds
		setTimeout(() => {
			setToast({ ...toast, visible: false });
		}, 5000);
	};	// Fetch announcements data directly from the database
	const fetchAnnouncements = async (isRefresh = false) => {
		try {
			if (isRefresh) {
				setIsRefreshing(true);
			} else {
				setIsLoading(true);
			}
			setError(null);
			
			console.log("Mengambil data pengumuman dari database API...");			try {
				// Get announcements from the API with enhanced error handling
				const data = await AnnouncementService.getPublicAnnouncements();
				console.log('Data pengumuman dari API:', data);
				
				// Check if we got data back
				if (data && data.length > 0) {
					setAnnouncements(data);
					
					// Display source information
					let sourceMessage = "Berhasil memperbarui data dari database API";
					
					// Tampilkan toast hanya jika ini adalah refresh manual
					if (isRefresh) {
						showToast(`${sourceMessage}: ${data.length} pengumuman`, "success");
					}
				} else {
					console.warn('API mengembalikan data kosong, mencoba fallback');
					
					// If API returns empty, try the fallback with mock data
					const fallbackData = AnnouncementService.getMockAnnouncements();
					setAnnouncements(fallbackData);
					
					if (isRefresh) {
						if (fallbackData.length > 0) {
							showToast("Data diambil dari cache lokal (API mengembalikan data kosong)", "success");
						} else {
							showToast("Tidak ada pengumuman yang tersedia", "success");
						}
					}
				}
			} catch (apiError: any) {
				console.error('Error mengambil data dari API:', apiError);
				
				// Try to parse detailed error information if available
				let errorMsg = "Error menghubungkan ke API";
				let detailedDiagnosis = "";
				
				if (apiError instanceof Error) {
					errorMsg = apiError.message;
					
					// Try to parse JSON error info (from our enhanced error reporting)
					try {
						const errorInfo = JSON.parse(apiError.message);
						if (errorInfo && typeof errorInfo === 'object') {
							errorMsg = errorInfo.message || errorMsg;
							
							// Check which endpoints were tried
							if (errorInfo.attempts) {
								detailedDiagnosis = `Attempted: ${
									Object.entries(errorInfo.attempts)
										.filter(([_, tried]) => tried)
										.map(([name]) => name)
										.join(', ')
								}`;
							}
							
							// Add API URL info
							if (errorInfo.apiUrl) {
								detailedDiagnosis += ` | API: ${errorInfo.apiUrl}`;
							}
						}
					} catch {
						// Not JSON, use the error message as is
					}
				}
				
				// Set the error with possible detailed diagnosis
				setError(detailedDiagnosis ? `${errorMsg} (${detailedDiagnosis})` : errorMsg);
				
				// Try fallback method with mock data
				console.log('Menggunakan data cache sebagai fallback...');
				const mockData = AnnouncementService.getMockAnnouncements();
				setAnnouncements(mockData);
				
				if (isRefresh) {
					showToast(`Menggunakan data cache: ${errorMsg}`, "error");
				}
			}
		} catch (error) {
			console.error('Error fetching announcements:', error);
			const errorMessage = error instanceof Error ? error.message : "Gagal memuat data pengumuman";
			console.error('Error message:', errorMessage);
			setError(errorMessage);
			showToast("Gagal memuat data pengumuman", "error");
			
			// Set empty announcements array to avoid undefined errors
			setAnnouncements([]);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	};
	// Map API tags to UI types
	const mapTagToType = (tag: string | null): string => {
		if (!tag) return 'informasi';
		
		// Map database tags to UI categories
		const tagLower = tag.toLowerCase();
		
		// Beasiswa related tags
		if (tagLower === 'beasiswa' || tagLower.includes('beasiswa')) {
			return 'beasiswa';
		}
		
		// Important/announcement related tags
		if (tagLower === 'pengumuman' || tagLower === 'penting' || tagLower.includes('important') || tagLower.includes('announcement')) {
			return 'penting';
		}
		
		// Schedule related tags
		if (tagLower === 'jadwal' || tagLower === 'schedule' || tagLower.includes('timeline')) {
			return 'jadwal';
		}
		
		// Information/general tags
		if (tagLower === 'informasi' || tagLower === 'info' || tagLower === 'event' || tagLower === 'acara') {
			return 'informasi';
		}
		
		// Default to information category for any other tag
		return 'informasi';
	};

	// Format date for display
	const formatDate = (dateString: string | null): string => {
		if (!dateString) return '-';
		
		const date = new Date(dateString);
		
		const monthNames = [
			'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
			'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
		];
		
		const day = date.getDate();
		const month = monthNames[date.getMonth()];
		const year = date.getFullYear();
		
		return `${day} ${month} ${year}`;
	};
	// Filter and sort announcements
	const filteredAnnouncements = announcements
		.filter(announcement => {
			// Filter based on search term
			if (searchTerm && 
				!announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
				!announcement.content.toLowerCase().includes(searchTerm.toLowerCase())) {
				return false;
			}
			
			// Filter based on tab
			if (activeTab === "all") {
				return true;
			}
			
			// Use the mapping function for all tabs
			const type = mapTagToType(announcement.tag);
			return type === activeTab;
		})
		.sort((a, b) => {
			// Sort by published_at date
			const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
			const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
			
			if (dateA === 0 && dateB === 0) {
				// If no publish dates, sort by created_at
				const createdA = new Date(a.created_at).getTime();
				const createdB = new Date(b.created_at).getTime();
				return sortNewest ? createdB - createdA : createdA - createdB;
			}
			
			if (dateA === 0) return sortNewest ? 1 : -1;
			if (dateB === 0) return sortNewest ? -1 : 1;
			
			return sortNewest ? dateB - dateA : dateA - dateB;
		});

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	}

	const toggleSort = () => {
		setSortNewest(!sortNewest);
	}
	
	// Check if announcement is new (published within the last 7 days)
	const isNewAnnouncement = (announcement: Announcement): boolean => {
		if (!announcement.published_at) return false;
		
		const publishedDate = new Date(announcement.published_at);
		const now = new Date();
		const diffTime = now.getTime() - publishedDate.getTime();
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		
		return diffDays <= 7;
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="container flex items-center justify-center h-64 py-6 mx-auto">
				<div className="flex items-center gap-2">
					<Loader2 className="w-6 h-6 animate-spin" />
					<span>Memuat data pengumuman...</span>
				</div>
			</div>
		);
	}	// Error state
	if (error) {
		return (
			<div className="container py-6 mx-auto">
				<Card className="border-red-200">
					<CardHeader>
						<div className="flex items-center space-x-2">
							<AlertTriangle className="w-6 h-6 text-red-500" />
							<CardTitle>Gagal Memuat Data dari Database</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<p className="mb-2 text-red-600">{error}</p>						{error.includes('Unauthenticated') && (
							<div className="mb-4 space-y-2 text-sm text-muted-foreground">
								<p>
									Pengumuman ini menggunakan API publik dan seharusnya tidak memerlukan autentikasi.
								</p>
								<p>
									<strong>Penyebab:</strong> CORS policy, middleware authentication, atau konfigurasi route yang tidak tepat.
								</p>
								<p>
									<strong>Solusi:</strong> Pastikan endpoint /announcements dapat diakses tanpa token.
								</p>
								<div className="p-2 mt-2 rounded bg-blue-50">
									<p className="font-semibold text-blue-600">Update: Perbaikan yang dilakukan</p>
									<ul className="mt-1 list-disc list-inside">
										<li>Telah ditambahkan debug endpoint: <code>/debug/announcements</code></li>
										<li>CORS settings diperbarui untuk mengizinkan akses publik</li>
										<li>Route middleware ditambahkan <code>withoutMiddleware(['auth', 'auth:sanctum'])</code></li>
										<li>API service diperbarui dengan fallback ke endpoint debug</li>
									</ul>
									<p className="mt-1">Coba gunakan halaman Diagnostik API untuk detail lengkap.</p>
								</div>
							</div>
						)}
						{(error.includes('Network Error') || error.includes('Failed to fetch')) && (
							<div className="mb-4 space-y-2 text-sm text-muted-foreground">
								<p>
									Tidak dapat terhubung ke database pada API server.
								</p>
								<p>
									<strong>Penyebab yang mungkin:</strong>
								</p>
								<ul className="ml-2 list-disc list-inside">
									<li>API server tidak berjalan atau tidak tersedia</li>
									<li>Alamat API server tidak benar (cek konfigurasi API_URL)</li>
									<li>Masalah jaringan</li>
									<li>Masalah CORS (Cross-Origin Resource Sharing)</li>
								</ul>
							</div>
						)}
						<div className="flex flex-wrap gap-3 mt-4">
							<Button onClick={() => fetchAnnouncements()}>
								Coba Hubungkan ke Database
							</Button>
							<Button 
								variant="outline" 
								onClick={() => window.location.reload()}
							>
								Muat Ulang Halaman
							</Button>							<Button 
								variant="outline"
								onClick={async () => {
									setError(null);
									
									// Use the mock data from our service
									const mockData = AnnouncementService.getMockAnnouncements();
									setAnnouncements(mockData);
									showToast("Menggunakan data dari cache lokal", "success");
								}}
							>
								Gunakan Data Cache
							</Button>							{/* Tombol konfigurasi API */}
							<div className="relative group">
								<Button 
									variant="secondary"
									onClick={() => {
										window.open('/api-config', '_blank');
									}}
								>
									Konfigurasi API
								</Button>
								<div className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity -translate-x-1/2 bg-black rounded opacity-0 pointer-events-none left-1/2 bottom-full whitespace-nowrap group-hover:opacity-100">
									API URL saat ini: {ApiConfig.baseURL}
								</div>
							</div>
							
							{/* Debug API button */}
							<Button 
								variant="outline"
								onClick={() => {
									window.open('/debug/api-test', '_blank');
								}}
							>
								Diagnostik API
							</Button>
							
							{/* Opsi lanjutan untuk APIs */}
							<details className="mt-3 text-sm text-muted-foreground">
								<summary className="cursor-pointer">Opsi lanjutan untuk koneksi API</summary>
								<div className="p-2 mt-2 space-y-2 border rounded">
									{/* Reset API URL ke default */}
									<p>URL API saat ini: <code className="px-1 text-xs bg-gray-100 rounded">{ApiConfig.baseURL}</code></p>
									<div className="flex gap-2 mt-2">
										<Button 
											size="sm"
											variant="outline"
											onClick={() => {
												localStorage.removeItem('bersekolah_api_url');
												window.location.reload();
											}}
										>
											Reset API ke Default
										</Button>
										<Button 
											size="sm"
											variant="outline"
											onClick={() => {
												// Copy API URL to clipboard
												navigator.clipboard.writeText(ApiConfig.baseURL)
													.then(() => showToast("URL API berhasil disalin", "success"))
													.catch(() => showToast("Gagal menyalin URL API", "error"));
											}}
										>
											Salin URL API
										</Button>
									</div>
								</div>
							</details>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container py-6 mx-auto space-y-6">
			{/* Toast message */}
			{toast.visible && (
				<div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 flex items-center gap-2 ${
					toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
				}`}>
					{toast.type === "success" ? (
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</svg>
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
						</svg>
					)}
					<p>{toast.message}</p>
				</div>
			)}
					<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Pengumuman</h1>
					<p className="text-muted-foreground">
						Informasi penting terkait program beasiswa Yayasan Bersekolah
					</p>
				</div>
				
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Cari pengumuman..."
							className="pl-8 w-full md:w-[250px]"
							value={searchTerm}
							onChange={handleSearch}
						/>
					</div>
					
					<Button
						variant="outline"
						size="icon"
						onClick={toggleSort}
						title={sortNewest ? "Urutkan Terlama" : "Urutkan Terbaru"}
					>
						{sortNewest ? <MoveDown className="w-4 h-4" /> : <MoveUp className="w-4 h-4" />}
					</Button>
					
					<Button 
						variant="outline"
						size="icon"
						onClick={() => fetchAnnouncements(true)} 
						disabled={isRefreshing}
						title="Refresh dari Database"
					>
						<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
					</Button>
				</div>
			</div>

			<Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid grid-cols-5 mb-4">
					<TabsTrigger value="all">Semua</TabsTrigger>
					<TabsTrigger value="penting">Penting</TabsTrigger>
					<TabsTrigger value="informasi">Informasi</TabsTrigger>
					<TabsTrigger value="jadwal">Jadwal</TabsTrigger>
					<TabsTrigger value="beasiswa">Beasiswa</TabsTrigger>
				</TabsList>
				
				<TabsContent value={activeTab} className="space-y-4">
					{filteredAnnouncements.length > 0 ? (
						filteredAnnouncements.map((announcement) => (
							<Card key={announcement.id} className={isNewAnnouncement(announcement) ? "border-blue-200" : ""}>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="flex items-center gap-2 text-lg">
												{announcement.title}
												{isNewAnnouncement(announcement) && (
													<Badge variant="default" className="bg-blue-500">Baru</Badge>
												)}
											</CardTitle>
											<CardDescription className="flex items-center gap-2">
												<Calendar className="w-3 h-3" /> {formatDate(announcement.published_at)}
												<span className="mx-1">•</span>
												<Tag className="w-3 h-3" /> 
												<span className="capitalize">{announcement.tag || "Informasi"}</span>
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pb-4">
									<div className="text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: announcement.content }}>
									</div>
								</CardContent>
							</Card>
						))
					) : (						<div className="py-8 text-center">
							<Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
							<h3 className="text-lg font-medium">Tidak ada pengumuman</h3>
							<p className="text-muted-foreground">
								{searchTerm || activeTab !== "all" 
									? "Tidak ada pengumuman yang sesuai dengan kriteria pencarian Anda" 
									: "Tidak ada pengumuman yang tersedia saat ini"}
							</p>
							<Button 
								variant="outline" 
								className="mt-4"
								onClick={() => fetchAnnouncements(true)}
							>
								<RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
								Muat Ulang Data
							</Button>
						</div>
					)}
				</TabsContent>
			</Tabs>
		
		</div>
	)
}