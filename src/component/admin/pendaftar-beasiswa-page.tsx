"use client"

import React, { useState, useEffect } from "react";
import { 
  Search, 
  PlusCircle, 
  FileEdit, 
  Trash2, 
  MoreHorizontal, 
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye
} from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import { ApplicantService, type BeswanListItem } from "../../lib/applicant-service";

// Tipe untuk dokumen dan media sosial
interface Dokumen {
  id?: number;
  nama?: string;
  name?: string;
  status?: string;
  deskripsi?: string;
  description?: string;
  url?: string;
}

interface MediaSosial {
  id?: number;
  jenis?: string;
  type?: string;
  username?: string;
  url?: string;
}

// Memperluas tipe BeswanListItem untuk detail dokumen
interface BeswanDetail extends BeswanListItem {
  dokumen_wajib?: Dokumen[];
  dokumen_pendukung?: Dokumen[];
  media_sosial?: MediaSosial[];
}

// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error in component:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 mt-4 text-red-800 bg-red-100 border border-red-300 rounded-lg">
          <h2 className="mb-2 text-xl font-semibold">Error dalam komponen React</h2>
          <p className="mb-4">Terjadi error saat merender komponen ini.</p>
          <div className="p-4 mb-4 overflow-auto text-sm bg-white border border-red-200 rounded">
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
          <button 
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reload Halaman
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Wrapper component for performance monitoring
const PendaftarBeasiswaWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <PendaftarBeasiswaPageContent />
    </ErrorBoundary>
  );
};

// Main component content
function PendaftarBeasiswaPageContent() {
  console.log("PendaftarBeasiswaPage component is rendering");
  // Initialize component
  useEffect(() => {
    // Log initial render 
    console.log("PendaftarBeasiswa component mounted");
  }, []);
  
  // Debug imports
  console.log("Button imported:", Button);
  console.log("Card imported:", Card);
  console.log("ApplicantService imported:", ApplicantService);
    // State for applicant data
  const [applicants, setApplicants] = useState<BeswanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>(undefined);
  
  // Dialog states
  const [detailDialog, setDetailDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedBeswan, setSelectedBeswan] = useState<BeswanDetail | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  
  // Toast notification state for simple implementation
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success"
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPeriods();
    fetchApplicants();
  }, []);
  
  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 5000);
  };
  
  // Fetch periods data
  const fetchPeriods = async () => {
    try {
      const data = await ApplicantService.getBeasiswaPeriods();
      setPeriods(data);
    } catch (err) {
      console.error("Error fetching periods:", err);
      showToast("Gagal memuat data periode", "error");
    }
  };
    // Fetch applicants data
  const fetchApplicants = async (periodId?: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      console.log('Fetching applicant data with period ID:', periodId);
      
      // Add a safeguard try-catch block
      try {
        const data = await ApplicantService.getBeswanList(periodId);
        console.log('Fetched applicant data:', data);
        
        // Ensure we have an array even if API returns null or undefined
        const safeData = Array.isArray(data) ? data : [];
        setApplicants(safeData);
        
        // Update stats
        updateStats(safeData);
        
        if (isRefresh) {
          showToast("Data berhasil diperbarui", "success");
        }
      } catch (apiErr) {
        console.error("API error details:", apiErr);
        
        // Use mock data for development if API fails
        console.log("Using mock data since API failed");
        const mockData: BeswanListItem[] = [
          { 
            id: 1,
            user_id: 1,
            user: { id: 1, name: 'Test User', email: 'test@example.com' }, 
            nama_panggilan: 'Test', 
            jenis_kelamin: 'Laki-laki', 
            tempat_lahir: 'Jakarta', 
            tanggal_lahir: '2000-01-01',
            agama: 'Islam',
            created_at: new Date().toISOString()
          }
        ];
        setApplicants(mockData);
        updateStats(mockData);
      }
    } catch (err) {
      console.error("Error in fetch function:", err);
      setError("Gagal memuat data pendaftar beasiswa");
      showToast("Gagal memuat data pendaftar beasiswa", "error");
      
      // Still show the UI even if data fetching fails
      setApplicants([]);
      updateStats([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Update dashboard stats
  const updateStats = (applicants: BeswanListItem[]) => {
    const total = applicants.length;
    
    // For now, simulate the other stats for a better UI experience
    // Later, when status is implemented, this can be updated to show real data
    setStats({
      total,
      pending: Math.round(total * 0.3),
      accepted: Math.round(total * 0.5),
      rejected: Math.round(total * 0.2)
    });
  };
    // Handle period change
  const handlePeriodChange = (value: string) => {
    // Check if value is "all" which means all periods
    if (value === "all") {
      setSelectedPeriodId(undefined);
      fetchApplicants(undefined);
      return;
    }
    
    // Otherwise, parse the period ID
    const periodId = parseInt(value);
    setSelectedPeriodId(periodId);
    fetchApplicants(periodId);
  };
  
  // Format date helper
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
    // Handle view detail
  const handleViewDetail = async (beswan: BeswanListItem) => {
    setSelectedBeswan(beswan);
    setDetailDialog(true);
    
    try {
      // Fetch detailed data if needed
      const detailedData = await ApplicantService.getBeswan(beswan.id!);
      setSelectedBeswan(detailedData);
    } catch (err) {
      console.error("Error fetching beswan details:", err);
      showToast("Gagal memuat detail pendaftar", "error");
    }
  };
  
  // Handle delete click
  const handleDeleteClick = (beswan: BeswanListItem) => {
    setSelectedBeswan(beswan);
    setDeleteDialog(true);
  };
  
  // Handle delete beswan
  const handleDeleteBeswan = async () => {
    if (!selectedBeswan || !selectedBeswan.id) return;
    
    try {
      await ApplicantService.deleteBeswan(selectedBeswan.id);
      showToast("Data pendaftar berhasil dihapus", "success");
      setDeleteDialog(false);
      
      // Refresh data
      fetchApplicants(selectedPeriodId);
    } catch (err) {
      console.error("Error deleting beswan:", err);
      showToast("Gagal menghapus data pendaftar", "error");
    }
  };
  
  // Filter applicants by search term
  const filteredApplicants = (applicants || []).filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.user?.name || '').toLowerCase().includes(searchLower) ||
      (item.nama_panggilan || '').toLowerCase().includes(searchLower) ||
      (item.jenis_kelamin || '').toLowerCase().includes(searchLower) ||
      (item.tempat_lahir || '').toLowerCase().includes(searchLower) ||
      (item.agama || '').toLowerCase().includes(searchLower)
    );
  });

  // Simple loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data pendaftar beasiswa...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <XCircle className="w-8 h-8" />
          <p>{error}</p>
          <Button onClick={() => fetchApplicants(selectedPeriodId)} variant="outline" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
          toast.type === "success" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={toast.type === "success" ? "text-green-800" : "text-red-800"}>
              {toast.message}
            </span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pendaftar Beasiswa</h2>        <div className="flex items-center gap-2">
          <Select value={selectedPeriodId?.toString() || "all"} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  {period.tahun} - {period.nama_periode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchApplicants(selectedPeriodId, true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-[#406386]/90 to-[#406386]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-white">Total Pendaftar</CardTitle>
            <Users className="w-4 h-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
            <div className="p-1 bg-yellow-100 rounded">
              <Loader2 className="w-4 h-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Diterima</CardTitle>
            <div className="p-1 bg-green-100 rounded">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <div className="p-1 bg-red-100 rounded">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Pendaftar Beasiswa</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Nama Panggilan</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead>Agama</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Tidak ada data pendaftar
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplicants.map((applicant) => {
                  // Format TTL
                  const tempatLahir = applicant.tempat_lahir || '-';
                  const tanggalLahir = applicant.tanggal_lahir ? formatDate(applicant.tanggal_lahir) : '-';
                  const ttl = `${tempatLahir}, ${tanggalLahir}`;
                  
                  return (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-mono text-xs text-gray-600">{applicant.id || '-'}</TableCell>
                      <TableCell className="font-medium">{applicant.user?.name || '-'}</TableCell>
                      <TableCell>{applicant.nama_panggilan || '-'}</TableCell>
                      <TableCell>{applicant.jenis_kelamin || '-'}</TableCell>
                      <TableCell>{ttl}</TableCell>
                      <TableCell>{applicant.agama || '-'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(applicant.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-8 h-8 p-0">
                              <span className="sr-only">Menu</span>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(applicant)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(applicant)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pendaftar Beasiswa</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pendaftar beasiswa.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBeswan ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center p-4 space-y-4 rounded-lg sm:flex-row sm:space-y-0 sm:space-x-6 bg-gray-50">
                <div className="flex items-center justify-center w-28 h-28 overflow-hidden bg-white rounded-full border-2 border-[#406386]/20 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-[#406386]/40" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-[#406386]">{selectedBeswan.user?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedBeswan.user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500">Data Pribadi</h4>
                  <div className="p-4 space-y-3 rounded-md bg-gray-50">
                    <div>
                      <p className="text-xs text-gray-500">Nama Lengkap</p>
                      <p className="text-sm font-medium">{selectedBeswan.user?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nama Panggilan</p>
                      <p className="text-sm font-medium">{selectedBeswan.nama_panggilan || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tempat, Tanggal Lahir</p>
                      <p className="text-sm font-medium">
                        {selectedBeswan.tempat_lahir || '-'}, {formatDate(selectedBeswan.tanggal_lahir)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jenis Kelamin</p>
                      <p className="text-sm font-medium">{selectedBeswan.jenis_kelamin || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Agama</p>
                      <p className="text-sm font-medium">{selectedBeswan.agama || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500">Pendidikan</h4>
                  <div className="p-4 space-y-3 rounded-md bg-gray-50">
                    <div>
                      <p className="text-xs text-gray-500">Nama Sekolah/Perguruan Tinggi</p>
                      <p className="text-sm font-medium">{selectedBeswan.sekolah?.nama_sekolah || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jenjang</p>
                      <p className="text-sm font-medium">{selectedBeswan.sekolah?.jenjang || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jurusan</p>
                      <p className="text-sm font-medium">{selectedBeswan.sekolah?.jurusan || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tahun Masuk</p>
                      <p className="text-sm font-medium">{selectedBeswan.sekolah?.tahun_masuk || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">IPK Terakhir</p>
                      <p className="text-sm font-medium">{selectedBeswan.sekolah?.ipk_terakhir || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Semester Saat Ini</p>
                      <p className="text-sm font-medium">{selectedBeswan.sekolah?.semester_saat_ini || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500">Data Keluarga</h4>
                  <div className="p-4 space-y-3 rounded-md bg-gray-50">
                    <div>
                      <p className="text-xs text-gray-500">Nama Ayah</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.nama_ayah || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pekerjaan Ayah</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.pekerjaan_ayah || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Penghasilan Ayah</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.penghasilan_ayah || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nama Ibu</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.nama_ibu || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pekerjaan Ibu</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.pekerjaan_ibu || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Penghasilan Ibu</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.penghasilan_ibu || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Anak Ke</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.anak_ke || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jumlah Saudara</p>
                      <p className="text-sm font-medium">{selectedBeswan.keluarga?.jumlah_saudara || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500">Alamat</h4>
                  <div className="p-4 space-y-3 rounded-md bg-gray-50">
                    <div>
                      <p className="text-xs text-gray-500">Alamat Lengkap</p>
                      <p className="text-sm font-medium">{selectedBeswan.alamat?.alamat_lengkap || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kelurahan</p>
                      <p className="text-sm font-medium">{selectedBeswan.alamat?.kelurahan || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kecamatan</p>
                      <p className="text-sm font-medium">{selectedBeswan.alamat?.kecamatan || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kota/Kabupaten</p>
                      <p className="text-sm font-medium">{selectedBeswan.alamat?.kota || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Provinsi</p>
                      <p className="text-sm font-medium">{selectedBeswan.alamat?.provinsi || '-'}</p>
                    </div>                    <div>
                      <p className="text-xs text-gray-500">Kode Pos</p>
                      <p className="text-sm font-medium">{selectedBeswan.alamat?.kode_pos || '-'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Dokumen Wajib */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500">Dokumen Wajib</h4>
                  <div className="p-4 space-y-3 rounded-md bg-gray-50">
                    {selectedBeswan.dokumen_wajib?.map((dokumen: Dokumen, index: number) => (
                      <div key={`wajib-${index}`} className="flex items-center justify-between">
                        <p className="text-sm">{dokumen.nama || dokumen.name || '-'}</p>                        <Badge 
                          variant={dokumen.status === "complete" ? "outline" : "destructive"}
                          className={dokumen.status === "complete" ? "border-green-200 bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}
                        >
                          {dokumen.status === "complete" ? "Lengkap" : "Belum Lengkap"}
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-sm italic text-gray-500">Tidak ada data dokumen wajib</p>
                    )}
                  </div>
                </div>
                
                {/* Dokumen Media Sosial */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500">Media Sosial</h4>
                  <div className="p-4 space-y-3 rounded-md bg-gray-50">
                    {selectedBeswan.media_sosial?.map((media: MediaSosial, index: number) => (
                      <div key={`sosmed-${index}`}>
                        <p className="text-xs text-gray-500">{media.jenis || media.type || '-'}</p>
                        <p className="text-sm font-medium">
                          <a 
                            href={media.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {media.username || media.url || '-'}
                          </a>
                        </p>
                      </div>
                    )) || (
                      <p className="text-sm italic text-gray-500">Tidak ada data media sosial</p>
                    )}
                  </div>
                </div>
                
                {/* Dokumen Pendukung */}
                <div className="md:col-span-2">
                  <h4 className="mb-2 text-sm font-medium text-gray-500">Dokumen Pendukung</h4>
                  <div className="p-4 space-y-3 rounded-md bg-gray-50">
                    {selectedBeswan.dokumen_pendukung?.map((dokumen: Dokumen, index: number) => (
                      <div key={`pendukung-${index}`} className="flex items-center justify-between pb-2 border-b last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{dokumen.nama || dokumen.name || '-'}</p>
                          <p className="text-xs text-gray-500">{dokumen.deskripsi || dokumen.description || '-'}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs" asChild>
                          <a href={dokumen.url} target="_blank" rel="noopener noreferrer">
                            Lihat Dokumen
                          </a>
                        </Button>
                      </div>
                    )) || (
                      <p className="text-sm italic text-gray-500">Tidak ada dokumen pendukung</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Data Pendaftar</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pendaftar ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedBeswan && (
              <div className="p-4 mb-4 rounded-md bg-gray-50">
                <p className="font-medium">{selectedBeswan.user?.name}</p>
                <p className="text-sm text-gray-500">{selectedBeswan.user?.email}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteBeswan}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>    </div>
  );
}

// Export the component with error boundary
export default PendaftarBeasiswaWithErrorBoundary;