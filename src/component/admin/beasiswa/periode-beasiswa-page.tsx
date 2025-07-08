"use client"

import React, { useState, useEffect } from "react"
import { 
  Calendar, 
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Users,
  Target,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react"

import { 
  fetchBeasiswaPeriods, 
  createBeasiswaPeriod, 
  updateBeasiswaPeriod, 
  deleteBeasiswaPeriod
} from "@/lib/beasiswa-periods-service"
import type { BeasiswaPeriod as BeasiswaPeriodType, BeasiswaPeriodForm } from "@/lib/beasiswa-periods-service"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

// Using imported types from the service
type BeasiswaPeriod = BeasiswaPeriodType;
type PeriodForm = BeasiswaPeriodForm;

const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
      const toastEl = document.createElement('div')
      toastEl.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
      }`
      toastEl.innerHTML = `
        <div class="font-semibold">${title}</div>
        <div class="text-sm opacity-90">${description}</div>
      `
      document.body.appendChild(toastEl)
      
      setTimeout(() => {
        toastEl.remove()
      }, 5000)
    }
  }
}

export default function PeriodeBeasiswaPage() {
  const [periods, setPeriods] = useState<BeasiswaPeriod[]>([])
  const [allPeriods, setAllPeriods] = useState<BeasiswaPeriod[]>([]) // Untuk statistik
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<BeasiswaPeriod | null>(null)
  
  // ✅ Update form state sesuai struktur database
  const [formData, setFormData] = useState<PeriodForm>({
    tahun: new Date().getFullYear(),
    nama_periode: '',
    deskripsi: '',
    mulai_pendaftaran: '',
    akhir_pendaftaran: '',
    mulai_beasiswa: '',
    akhir_beasiswa: '',
    status: 'draft',
    is_active: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  // Handle filter changes
  useEffect(() => {
    if (!isLoading) {
      fetchFilteredData()
    }
  }, [statusFilter, searchTerm])

  const fetchFilteredData = async () => {
    try {
      const response = await fetchBeasiswaPeriods({
        per_page: 50,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      })
      setPeriods(response.data || [])
    } catch (error) {
      console.error('Error fetching filtered data:', error)
    }
  }

  const fetchData = async (isRefresh = false) => {
    try {
      // Reset error state at the beginning of the fetch
      setHasError(false)
      
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      // Fetch all periods for statistics (without filters)
      const allResponse = await fetchBeasiswaPeriods({
        per_page: 50
      })
      setAllPeriods(allResponse.data || [])

      // Also fetch filtered data initially
      const response = await fetchBeasiswaPeriods({
        per_page: 50,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      })
      setPeriods(response.data || [])

      if (isRefresh) {
        toast({
          title: "✅ Data Diperbarui",
          description: "Data periode beasiswa berhasil diperbarui dari server.",
        })
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setHasError(true)
      toast({
        title: "Error",
        description: "Gagal memuat data periode beasiswa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleCreatePeriod = async () => {
    setIsSubmitting(true)
    try {
      const result = await createBeasiswaPeriod(formData)
      console.log('Create response:', result)

      toast({
        title: "✅ Periode Beasiswa Dibuat",
        description: "Periode beasiswa baru berhasil dibuat.",
      })

      // ✅ Reset form sesuai struktur baru
      setFormData({
        tahun: new Date().getFullYear(),
        nama_periode: '',
        deskripsi: '',
        mulai_pendaftaran: '',
        akhir_pendaftaran: '',
        mulai_beasiswa: '',
        akhir_beasiswa: '',
        status: 'draft',
        is_active: false
      })
      setCreateDialog(false)
      
      // Refresh data
      await fetchData(true)
      await fetchFilteredData()

    } catch (error) {
      console.error('Create error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal membuat periode beasiswa",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePeriod = async () => {
    if (!selectedPeriod) return

    setIsSubmitting(true)
    try {
      const result = await updateBeasiswaPeriod(selectedPeriod.id, formData)
      console.log('Update response:', result)

      toast({
        title: "✅ Periode Beasiswa Diperbarui",
        description: "Data periode beasiswa berhasil diperbarui.",
      })

      // Close dialog and reset
      setEditDialog(false)
      setSelectedPeriod(null)
      
      // Refresh data
      await fetchData(true)
      await fetchFilteredData()

    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui periode beasiswa",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePeriod = async () => {
    if (!selectedPeriod) return

    setIsSubmitting(true)
    try {
      const result = await deleteBeasiswaPeriod(selectedPeriod.id)
      
      toast({
        title: "✅ Periode Beasiswa Dihapus",
        description: "Periode beasiswa berhasil dihapus.",
      })

      // Close dialog and reset
      setDeleteDialog(false)
      setSelectedPeriod(null)
      
      // Refresh data
      await fetchData(true)
      await fetchFilteredData()

    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus periode beasiswa",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Update status badge menggunakan field yang benar
  const getStatusBadge = (period: BeasiswaPeriod) => {
    const now = new Date()
    const buka = new Date(period.mulai_pendaftaran)
    const tutup = new Date(period.akhir_pendaftaran)

    if (period.status === 'draft') {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          <Edit className="mr-1 w-3 h-3" />
          Draft
        </Badge>
      )
    }

    if (period.status === 'closed') {
      return (
        <Badge variant="outline" className="text-red-700 bg-red-100 border-red-200">
          <X className="mr-1 w-3 h-3" />
          Ditutup
        </Badge>
      )
    }

    if (now < buka) {
      return (
        <Badge variant="outline" className="text-blue-700 bg-blue-100 border-blue-200">
          <Clock className="mr-1 w-3 h-3" />
          Akan Buka
        </Badge>
      )
    }

    if (now >= buka && now <= tutup) {
      return (
        <Badge variant="outline" className="text-green-700 bg-green-100 border-green-200">
          <CheckCircle2 className="mr-1 w-3 h-3" />
          Aktif
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="text-yellow-700 bg-yellow-100 border-yellow-200">
        <AlertCircle className="mr-1 w-3 h-3" />
        Berakhir
      </Badge>
    )
  }
  // Check if there are any active periods (from all periods, not filtered)
  const hasActivePeriod = () => {
    if (!allPeriods || allPeriods.length === 0) return false
    // According to database structure, we only need to check status column
    return allPeriods.some(period => period.status === 'active')
  }

  // Get active period (from all periods, not filtered)
  const getActivePeriod = () => {
    if (!allPeriods || allPeriods.length === 0) return null
    return allPeriods.find(period => period.status === 'active')
  }

  // Check if there's an active period other than the current one being edited
  const hasOtherActivePeriod = (currentPeriodId?: number) => {
    if (!allPeriods || allPeriods.length === 0) return false
    return allPeriods.some(period => 
      period.status === 'active' && period.id !== currentPeriodId
    )
  }

  const openCreateDialog = () => {
    // Check if there's an active period before opening the dialog
    if (hasActivePeriod()) {
      toast({
        title: "⚠️ Tidak dapat membuat periode baru",
        description: "Sudah ada periode beasiswa yang aktif saat ini. Nonaktifkan atau tutup periode aktif terlebih dahulu.",
        variant: "destructive",
      })
      return
    }

    // Continue with normal flow
    setFormData({
      tahun: new Date().getFullYear(),
      nama_periode: '',
      deskripsi: '',
      mulai_pendaftaran: '',
      akhir_pendaftaran: '',
      mulai_beasiswa: '',
      akhir_beasiswa: '',
      status: 'draft',
      is_active: false
    })
    setCreateDialog(true)
  }

  // ✅ Update edit dialog dengan field yang benar
  const openEditDialog = (period: BeasiswaPeriod) => {
    setSelectedPeriod(period)
    setFormData({
      tahun: period.tahun,
      nama_periode: period.nama_periode,
      deskripsi: period.deskripsi,
      mulai_pendaftaran: period.mulai_pendaftaran.split('T')[0], // Format YYYY-MM-DD
      akhir_pendaftaran: period.akhir_pendaftaran.split('T')[0],
      mulai_beasiswa: period.mulai_beasiswa.split('T')[0],
      akhir_beasiswa: period.akhir_beasiswa.split('T')[0],
      status: period.status,
      is_active: period.is_active
    })
    setEditDialog(true)
  }

  const openDeleteDialog = (period: BeasiswaPeriod) => {
    setSelectedPeriod(period)
    setDeleteDialog(true)
  }

  const filteredPeriods = periods.filter(period => {
    const matchesSearch = period.nama_periode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         period.tahun.toString().includes(searchTerm)
    
    if (statusFilter === 'all') return matchesSearch
    return matchesSearch && period.status === statusFilter
  })

  // Track error state
  const [hasError, setHasError] = useState(false)

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="flex gap-2 items-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat data periode beasiswa...</span>
          </div>
        </div>
      </div>
    )
  }
  
  if (hasError) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="p-8 mb-4 text-center bg-red-50 rounded-lg">
            <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-red-800">Gagal memuat data</h3>
            <p className="mb-4 text-sm text-red-600">
              Terjadi kesalahan saat memuat data periode beasiswa
            </p>
            <Button 
              onClick={async () => {
                setHasError(false)
                await fetchData(true)
                await fetchFilteredData()
              }}
              variant="outline"
              className="border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Coba lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Periode Beasiswa</h1>
          <p className="text-gray-600">
            Kelola periode pendaftaran beasiswa
          </p>
        </div>
        <div className="flex gap-2">          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              await fetchData(true)
              await fetchFilteredData()
            }}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={openCreateDialog}
            className="bg-[#406386] hover:bg-[#365577]"
            disabled={hasActivePeriod()}
            title={hasActivePeriod() ? "Tidak dapat membuat periode baru karena ada periode aktif" : "Tambah periode baru"}
          >
            <Plus className="mr-2 w-4 h-4" />
            Tambah Periode
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Periode</p>
                <p className="text-2xl font-bold">{allPeriods.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>        <Card className={hasActivePeriod() ? "border-green-500" : ""}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Periode Aktif</p>
                {hasActivePeriod() ? (
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {getActivePeriod()?.nama_periode}
                    </p>
                    <p className="text-sm text-gray-500">
                      Tahun {getActivePeriod()?.tahun}
                    </p>
                    <Badge variant="outline" className="mt-1 text-green-700 bg-green-100 border-green-200">
                      <CheckCircle2 className="mr-1 w-3 h-3" />
                      Sedang Berjalan
                    </Badge>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-400">
                      Tidak Ada
                    </p>
                    <p className="text-sm text-gray-400">
                      Periode Aktif
                    </p>
                  </div>
                )}
              </div>
              <CheckCircle2 className={`w-8 h-8 ${hasActivePeriod() ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Pendaftar</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allPeriods.reduce((sum, p) => sum + (p.applicants_count || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Periode</Label>
              <div className="relative">
                <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nama periode atau tahun..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="closed">Ditutup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => fetchFilteredData()} 
                disabled={isRefreshing}
                className="w-full"
              >
                <Search className="mr-2 w-4 h-4" />
                Cari
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Update Periods Table - hapus kolom kuota dan nominal, update field tanggal */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Periode Beasiswa</CardTitle>
            <Badge variant="outline">
              {filteredPeriods.length} periode
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-center">Tanggal Pendaftaran</TableHead>
                <TableHead className="text-center">Tanggal Beasiswa</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeriods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{period.nama_periode}</div>
                      <div className="text-sm text-gray-500">Tahun {period.tahun}</div>
                      <div className="text-xs text-gray-400">ID: {period.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">{period.deskripsi}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(period.mulai_pendaftaran).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                      <div className="text-gray-500">s/d</div>
                      <div className="font-medium">
                        {new Date(period.akhir_pendaftaran).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(period.mulai_beasiswa).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                      <div className="text-gray-500">s/d</div>
                      <div className="font-medium">
                        {new Date(period.akhir_beasiswa).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(period)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        
                        <DropdownMenuItem onClick={() => openEditDialog(period)}>
                          <Edit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(period)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 w-4 h-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPeriods.length === 0 && (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-4 w-12 h-12 text-gray-400 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">Tidak ada periode</h3>
              <p className="text-gray-500">
                Tidak ada periode beasiswa yang sesuai dengan filter pencarian
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Update Create Dialog - ganti field tanggal, hapus kuota & nominal */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Periode Beasiswa</DialogTitle>
            <DialogDescription>
              Buat periode baru untuk pendaftaran beasiswa
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tahun">Tahun</Label>
                <Input
                  id="tahun"
                  type="number"
                  value={formData.tahun}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tahun: parseInt(e.target.value) || new Date().getFullYear()
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'active' | 'closed') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="closed">Ditutup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="nama_periode">Nama Periode</Label>
              <Input
                id="nama_periode"
                value={formData.nama_periode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nama_periode: e.target.value
                }))}
                placeholder="Contoh: Beasiswa Semester Genap 2024"
              />
            </div>
            
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  deskripsi: e.target.value
                }))}
                placeholder="Deskripsi periode beasiswa..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mulai_pendaftaran">Mulai Pendaftaran</Label>
                <Input
                  id="mulai_pendaftaran"
                  type="date"
                  value={formData.mulai_pendaftaran}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    mulai_pendaftaran: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="akhir_pendaftaran">Akhir Pendaftaran</Label>
                <Input
                  id="akhir_pendaftaran"
                  type="date"
                  value={formData.akhir_pendaftaran}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    akhir_pendaftaran: e.target.value
                  }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mulai_beasiswa">Mulai Beasiswa</Label>
                <Input
                  id="mulai_beasiswa"
                  type="date"
                  value={formData.mulai_beasiswa}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    mulai_beasiswa: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="akhir_beasiswa">Akhir Beasiswa</Label>
                <Input
                  id="akhir_beasiswa"
                  type="date"
                  value={formData.akhir_beasiswa}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    akhir_beasiswa: e.target.value
                  }))}
                />
              </div>
            </div>
            

          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleCreatePeriod}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Update Edit Dialog - sama seperti create dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Periode Beasiswa</DialogTitle>
            <DialogDescription>
              Perbarui data periode beasiswa
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_tahun">Tahun</Label>
                <Input
                  id="edit_tahun"
                  type="number"
                  value={formData.tahun}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tahun: parseInt(e.target.value) || new Date().getFullYear()
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'closed') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Hanya tampilkan opsi "Aktif" jika tidak ada periode aktif lain atau ini adalah periode aktif yang sedang diedit */}
                    {(!hasOtherActivePeriod(selectedPeriod?.id) || selectedPeriod?.status === 'active') && (
                      <SelectItem value="active">Aktif</SelectItem>
                    )}
                    <SelectItem value="closed">Ditutup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_nama_periode">Nama Periode</Label>
              <Input
                id="edit_nama_periode"
                value={formData.nama_periode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nama_periode: e.target.value
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_deskripsi">Deskripsi</Label>
              <Textarea
                id="edit_deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  deskripsi: e.target.value
                }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_mulai_pendaftaran">Mulai Pendaftaran</Label>
                <Input
                  id="edit_mulai_pendaftaran"
                  type="date"
                  value={formData.mulai_pendaftaran}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    mulai_pendaftaran: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_akhir_pendaftaran">Akhir Pendaftaran</Label>
                <Input
                  id="edit_akhir_pendaftaran"
                  type="date"
                  value={formData.akhir_pendaftaran}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    akhir_pendaftaran: e.target.value
                  }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_mulai_beasiswa">Mulai Beasiswa</Label>
                <Input
                  id="edit_mulai_beasiswa"
                  type="date"
                  value={formData.mulai_beasiswa}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    mulai_beasiswa: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_akhir_beasiswa">Akhir Beasiswa</Label>
                <Input
                  id="edit_akhir_beasiswa"
                  type="date"
                  value={formData.akhir_beasiswa}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    akhir_beasiswa: e.target.value
                  }))}
                />
              </div>
            </div>
            

          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleUpdatePeriod}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  Perbarui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Update Delete Dialog - hapus info recipients */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Periode Beasiswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus periode beasiswa ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPeriod && (
            <div className="py-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium">{selectedPeriod.nama_periode}</h4>
                <p className="text-sm text-gray-600">Tahun {selectedPeriod.tahun}</p>
                <p className="text-sm text-gray-600">
                  {selectedPeriod.applicants_count || 0} pendaftar terdaftar
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePeriod}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 w-4 h-4" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}