"use client"

import React, { useState, useEffect } from "react"
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Video,
  MessageSquare,
  Eye,
  Edit,
  TrendingUp,
  Award,
  Mail,
  RefreshCw,
  MoreHorizontal,
  Check,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  FileCheck,
  AlertTriangle,
  Star,
  Target,
  Phone
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

// Types
interface BeasiswaApplication {
  id: number;
  beswan_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  beswan: {
    id: number;
    nama_panggilan: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
  };
  period: {
    id: number;
    tahun: number;
    nama_periode: string;
  };
  status: 'pending' | 'lolos_berkas' | 'lolos_wawancara' | 'diterima' | 'ditolak';
  status_display: string;
  status_color: string;
  submitted_at: string;
  finalized_at: string;
  interview_date?: string;
  interview_link?: string;
  catatan_admin?: string;
  reviewer?: {
    id: number;
    name: string;
  };
  verification_progress: number;
  has_complete_documents: boolean;
  created_at: string;
  updated_at: string;
}

interface Statistics {
  overview: {
    total: number;
    pending: number;
    lolos_berkas: number;
    lolos_wawancara: number;
    diterima: number;
    ditolak: number;
  };
  weekly: Array<{
    week: string;
    count: number;
  }>;
  periods: Array<{
    id: number;
    tahun: number;
    nama_periode: string;
  }>;
}

interface ApplicationDetail {
  id: number;
  beswan_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  beswan: {
    id: number;
    nama_panggilan: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
  };
  period: {
    id: number;
    tahun: number;
    nama_periode: string;
  };
  status: 'pending' | 'lolos_berkas' | 'lolos_wawancara' | 'diterima' | 'ditolak';
  status_display: string;
  status_color: string;
  submitted_at: string;
  finalized_at: string;
  interview_date?: string;
  interview_link?: string;
  catatan_admin?: string;
  reviewer?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  keluarga: any;
  alamat: any;
  sekolah: any;
  documents: any;
  verification_progress: {
    percentage: number;
    complete: boolean;
    verified_count: number;
    total_required: number;
  };
}

export default function SeleksiBeasiswaPage() {
  const [applications, setApplications] = useState<BeasiswaApplication[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [finalizedFilter, setFinalizedFilter] = useState("all")
  const [sortBy, setSortBy] = useState("finalized_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [perPage, setPerPage] = useState(15)

  // Dialog states
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const [statusDialog, setStatusDialog] = useState(false)
  const [bulkDialog, setBulkDialog] = useState(false)
  const [interviewDialog, setInterviewDialog] = useState(false)

  // Form states
  const [selectedApplications, setSelectedApplications] = useState<number[]>([])
  const [statusForm, setStatusForm] = useState({
    status: '',
    catatan_admin: '',
    interview_date: '',      // ✅ date (YYYY-MM-DD)
    interview_time: '',      // ✅ time (HH:MM)
    interview_link: ''
  })
  const [bulkForm, setBulkForm] = useState({
    status: '',
    catatan_admin: ''
  })
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  const { toast } = useToast()

  // Add error state for statistics
  const [statisticsError, setStatisticsError] = useState<string | null>(null)

  // Fetch applications data
  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        })
        return
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        search: searchTerm,
        status: statusFilter,
        period: periodFilter,
        ...(finalizedFilter === 'true' && { finalized: 'true' })
      })

      const response = await fetch(`${baseURL}/admin/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Applications data:', result)

      if (result.success) {
        setApplications(result.data)
        setTotalPages(result.meta.last_page)
        setTotalItems(result.meta.total)
      } else {
        throw new Error(result.message || 'Failed to fetch applications')
      }

    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data aplikasi beasiswa.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setStatisticsError(null);
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) {
        setStatisticsError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/applications/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json()
      if (result.success) {
        setStatistics(result.data)
      } else {
        throw new Error(result.message || 'Gagal mengambil data statistik');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setStatisticsError(error instanceof Error ? error.message : "Gagal mengambil data statistik");
    }
  }

  // Fetch application detail
  const fetchApplicationDetail = async (id: number) => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) return

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/applications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSelectedApplication(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching application detail:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil detail aplikasi.",
        variant: "destructive",
      })
    }
  }

  // ✅ TAMBAHKAN: Validasi form
  const isStatusFormValid = () => {
    if (!statusForm.status) return false
    
    if (statusForm.status === 'lolos_berkas') {
      return statusForm.interview_date.trim() !== '' && 
             statusForm.interview_time.trim() !== '' && 
             statusForm.interview_link.trim() !== ''
    }
    
    return true
  }

  // Update application status
  const updateApplicationStatus = async () => {
    if (!selectedApplication) return

    // ✅ FIXED: Validasi sebelum submit
    if (!isStatusFormValid()) {
      toast({
        title: "Error",
        description: "Untuk status 'Lolos Berkas', tanggal, waktu, dan link wawancara wajib diisi.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingStatus(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/applications/${selectedApplication.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(statusForm)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status')
      }

      toast({
        title: "Berhasil",
        description: "Status aplikasi berhasil diperbarui.",
      })

      setStatusDialog(false)
      setStatusForm({ status: '', catatan_admin: '', interview_date: '', interview_time: '', interview_link: '' })
      fetchApplications(true)

    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui status aplikasi.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Bulk update statuses
  const bulkUpdateStatuses = async () => {
    if (selectedApplications.length === 0) return

    setIsBulkUpdating(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/applications/bulk-update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          application_ids: selectedApplications,
          ...bulkForm
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to bulk update')
      }

      toast({
        title: "Berhasil",
        description: `${result.data.updated_count} aplikasi berhasil diperbarui.`,
      })

      setBulkDialog(false)
      setBulkForm({ status: '', catatan_admin: '' })
      setSelectedApplications([])
      fetchApplications(true)

    } catch (error) {
      console.error('Error bulk updating:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui aplikasi secara massal.",
        variant: "destructive",
      })
    } finally {
      setIsBulkUpdating(false)
    }
  }

  // Get status badge color and text
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, text: "Menunggu Review" },
      lolos_berkas: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: FileCheck, text: "Lolos Berkas" },
      lolos_wawancara: { color: "bg-green-100 text-green-800 border-green-200", icon: Video, text: "Lolos Wawancara" },
      diterima: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Award, text: "Diterima" },
      ditolak: { color: "bg-red-100 text-red-800 border-red-200", icon: X, text: "Ditolak" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const IconComponent = config.icon

    return (
      <Badge variant="outline" className={`${config.color} border`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  // Handle checkbox selection
  const handleSelectApplication = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedApplications(prev => [...prev, id])
    } else {
      setSelectedApplications(prev => prev.filter(appId => appId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app.id))
    } else {
      setSelectedApplications([])
    }
  }

  // Effects
  useEffect(() => {
    fetchApplications()
    fetchStatistics()
  }, [currentPage, perPage, searchTerm, statusFilter, periodFilter, finalizedFilter])

  useEffect(() => {
    // Reset page when filters change
    setCurrentPage(1)
  }, [searchTerm, statusFilter, periodFilter, finalizedFilter])

  // ✅ TAMBAHKAN: Helper function untuk validasi URL
  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      // Validasi khusus untuk Google Meet atau URL meeting lainnya
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold">Memuat Data Aplikasi...</h3>
              <p className="text-sm text-muted-foreground">Mengambil data aplikasi beasiswa</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seleksi Aplikasi Beasiswa</h1>
          <p className="text-muted-foreground">
            Kelola dan review aplikasi beasiswa yang masuk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchApplications(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Show error state if there is a statistics error */}
        {statisticsError && (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <p className="text-red-500">{statisticsError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchStatistics()}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memuat...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Coba Lagi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Only show statistics cards if no error and data exists */}
        {!statisticsError && statistics && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-2xl font-bold">{statistics.overview.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold">{statistics.overview.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Lolos Berkas</p>
                    <p className="text-2xl font-bold">{statistics.overview.lolos_berkas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Lolos Wawancara</p>
                    <p className="text-2xl font-bold">{statistics.overview.lolos_wawancara}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Diterima</p>
                    <p className="text-2xl font-bold">{statistics.overview.diterima}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <X className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Ditolak</p>
                    <p className="text-2xl font-bold">{statistics.overview.ditolak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="search">Cari Aplikasi</Label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="search"
                  placeholder="Nama, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="menunggu_review">Menunggu Review</SelectItem>
                  <SelectItem value="lolos_berkas">Lolos Berkas</SelectItem>
                  <SelectItem value="lolos_wawancara">Lolos Wawancara</SelectItem>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period-filter">Periode</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  {statistics?.periods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.nama_periode} ({period.tahun})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="finalized-filter">Status Finalisasi</Label>
              <Select value={finalizedFilter} onValueChange={setFinalizedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih finalisasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="true">Sudah Difinalisasi</SelectItem>
                  <SelectItem value="false">Belum Difinalisasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="per-page">Items per halaman</Label>
              <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Aplikasi Beasiswa</CardTitle>
              <CardDescription>
                Menampilkan {applications.length} dari {totalItems} aplikasi
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplications.length === applications.length && applications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Pendaftar</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress Dokumen</TableHead>
                  <TableHead>Tanggal Submit</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.includes(app.id)}
                        onCheckedChange={(checked) => handleSelectApplication(app.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.user.name}</div>
                        <div className="text-sm text-muted-foreground">{app.user.email}</div>
                        {app.beswan.nama_panggilan && (
                          <div className="text-sm text-muted-foreground">
                            ({app.beswan.nama_panggilan})
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{app.period.nama_periode}</div>
                        <div className="text-muted-foreground">{app.period.tahun}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={app.verification_progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {app.verification_progress}% lengkap
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {app.finalized_at ? (
                          <>
                            <div>{new Date(app.finalized_at).toLocaleDateString('id-ID')}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(app.finalized_at).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Belum difinalisasi
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.reviewer ? (
                        <div className="text-sm">{app.reviewer.name}</div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Belum direview
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            fetchApplicationDetail(app.id)
                            setDetailDialog(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // ✅ UPDATED: Form state untuk date dan time terpisah
                            const interviewDate = app.interview_date ? new Date(app.interview_date) : null
                            // @ts-ignore - Property exists at runtime
                            const interviewTime = app.interview_time ? app.interview_time.substring(0, 5) : '' // HH:MM

                            // @ts-ignore - Types are compatible at runtime
                            setSelectedApplication(app as unknown as ApplicationDetail)
                            setStatusForm({
                              status: app.status,
                              catatan_admin: app.catatan_admin || '',
                              interview_date: app.interview_date || '',  // ✅ date format
                              interview_time: interviewTime,  // ✅ time format  
                              interview_link: app.interview_link || ''
                            })
                            setStatusDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages} ({totalItems} total aplikasi)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Aplikasi Beasiswa</DialogTitle>
            <DialogDescription>
              Informasi lengkap aplikasi beasiswa
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Informasi Pendaftar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Nama Lengkap</Label>
                      <p className="text-sm">{selectedApplication.user.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedApplication.user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nama Panggilan</Label>
                      <p className="text-sm">{selectedApplication.beswan.nama_panggilan}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tempat, Tanggal Lahir</Label>
                      <p className="text-sm">
                        {selectedApplication.beswan.tempat_lahir}, {" "}
                        {new Date(selectedApplication.beswan.tanggal_lahir).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Jenis Kelamin</Label>
                      <p className="text-sm">{selectedApplication.beswan.jenis_kelamin}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Status Aplikasi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Status Saat Ini</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Periode Beasiswa</Label>
                      <p className="text-sm">
                        {selectedApplication.period.nama_periode} ({selectedApplication.period.tahun})
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tanggal Finalisasi</Label>
                      <p className="text-sm">
                        {selectedApplication.finalized_at 
                          ? new Date(selectedApplication.finalized_at).toLocaleString('id-ID')
                          : 'Belum difinalisasi'
                        }
                      </p>
                    </div>
                    {selectedApplication.reviewer && (
                      <div>
                        <Label className="text-sm font-medium">Reviewer</Label>
                        <p className="text-sm">{selectedApplication.reviewer.name}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Document Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Progress Dokumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Kelengkapan Dokumen</span>
                      <span className="text-sm font-medium">
                        {selectedApplication.verification_progress.verified_count}/
                        {selectedApplication.verification_progress.total_required}
                      </span>
                    </div>
                    <Progress value={selectedApplication.verification_progress.percentage} className="h-3" />
                    <div className="text-xs text-muted-foreground">
                      {selectedApplication.verification_progress.percentage}% dokumen telah terverifikasi
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Info */}
              {(selectedApplication.interview_date || selectedApplication.interview_link) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Informasi Wawancara</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedApplication.interview_date && (
                      <div>
                        <Label className="text-sm font-medium">Tanggal Wawancara</Label>
                        <p className="text-sm">
                          {new Date(selectedApplication.interview_date).toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                    {selectedApplication.interview_link && (
                      <div>
                        <Label className="text-sm font-medium">Link Wawancara</Label>
                        <a 
                          href={selectedApplication.interview_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:underline"
                        >
                          <LinkIcon className="w-3 h-3 mr-1" />
                          {selectedApplication.interview_link}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              {selectedApplication.catatan_admin && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Catatan Admin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.catatan_admin}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status Aplikasi</DialogTitle>
            <DialogDescription>
              Perbarui status dan tambahkan catatan untuk aplikasi ini
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusForm.status} onValueChange={(value) => setStatusForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="lolos_berkas">Lolos Berkas</SelectItem>
                  <SelectItem value="lolos_wawancara">Lolos Wawancara</SelectItem>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="catatan">Catatan Admin</Label>
              <Textarea
                id="catatan"
                placeholder="Tambahkan catatan atau feedback..."
                value={statusForm.catatan_admin}
                onChange={(e) => setStatusForm(prev => ({ ...prev, catatan_admin: e.target.value }))}
                rows={3}
              />
            </div>

            {/* ✅ UPDATED: Fields untuk status lolos_berkas dengan date & time terpisah */}
            {statusForm.status === 'lolos_berkas' && (
              <>
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Perhatian:</strong> Untuk status "Lolos Berkas", tanggal, waktu, dan link wawancara wajib diisi.
                  </AlertDescription>
                </Alert>

                {/* ✅ UPDATED: Tanggal wawancara (date input) */}
                <div>
                  <Label htmlFor="interview_date">
                    Tanggal Wawancara <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="interview_date"
                    type="date"
                    value={statusForm.interview_date}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, interview_date: e.target.value }))}
                    className={statusForm.interview_date.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                    required
                  />
                  {statusForm.interview_date.trim() === '' && (
                    <p className="mt-1 text-xs text-red-500">Tanggal wawancara wajib diisi</p>
                  )}
                </div>

                {/* ✅ UPDATED: Waktu wawancara (time input) */}
                <div>
                  <Label htmlFor="interview_time">
                    Waktu Wawancara <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="interview_time"
                    type="time"
                    value={statusForm.interview_time}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, interview_time: e.target.value }))}
                    className={statusForm.interview_time.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                    required
                  />
                  {statusForm.interview_time.trim() === '' && (
                    <p className="mt-1 text-xs text-red-500">Waktu wawancara wajib diisi</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Format: HH:MM (contoh: 14:30)</p>
                </div>
                
                <div>
                  <Label htmlFor="interview_link">
                    Link Wawancara <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="interview_link"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={statusForm.interview_link}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, interview_link: e.target.value }))}
                    className={statusForm.interview_link.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                    required
                  />
                  {statusForm.interview_link.trim() === '' && (
                    <p className="mt-1 text-xs text-red-500">Link wawancara wajib diisi</p>
                  )}
                  {statusForm.interview_link.trim() !== '' && !isValidUrl(statusForm.interview_link) && (
                    <p className="mt-1 text-xs text-red-500">Format URL tidak valid</p>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={updateApplicationStatus} 
              disabled={isUpdatingStatus || !isStatusFormValid()}
              className={!isStatusFormValid() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                'Perbarui Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status Massal</DialogTitle>
            <DialogDescription>
              Perbarui status untuk {selectedApplications.length} aplikasi terpilih
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-status">Status</Label>
              <Select value={bulkForm.status} onValueChange={(value) => setBulkForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  {/* ✅ FIXED: Disable lolos_berkas untuk bulk update */}
                  <SelectItem value="lolos_berkas" disabled>
                    Lolos Berkas (Gunakan Update Individual)
                  </SelectItem>
                  <SelectItem value="lolos_wawancara">Lolos Wawancara</SelectItem>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              {/* ✅ FIXED: Warning untuk lolos_berkas */}
              {bulkForm.status === 'lolos_berkas' && (
                <p className="mt-1 text-xs text-red-500">
                  Status "Lolos Berkas" memerlukan pengaturan individual untuk tanggal dan link wawancara.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bulk-catatan">Catatan Admin</Label>
              <Textarea
                id="bulk-catatan"
                placeholder="Tambahkan catatan untuk semua aplikasi terpilih..."
                value={bulkForm.catatan_admin}
                onChange={(e) => setBulkForm(prev => ({ ...prev, catatan_admin: e.target.value }))}
                rows={3}
              />
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Tindakan ini akan memperbarui status {selectedApplications.length} aplikasi sekaligus dan tidak dapat dibatalkan.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={bulkUpdateStatuses} 
              disabled={isBulkUpdating || !bulkForm.status || bulkForm.status === 'lolos_berkas'}
            >
              {isBulkUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                `Perbarui ${selectedApplications.length} Aplikasi`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}