"use client"

import React, { useState, useEffect } from "react"
import { 
  Eye, 
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
  Instagram,
  Share2,
  RefreshCw
} from "lucide-react"
import { MediaLinksManager } from "@/component/admin/media-links-manager"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: number;
  user_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  status: 'pending' | 'verified' | 'rejected';
  keterangan?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  document_type_info: {
    name: string;
    description: string;
  };
}

export default function AdminDokumenSosmedPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all")
  const [previewDialog, setPreviewDialog] = useState(false)
  const [verifyDialog, setVerifyDialog] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [verifyStatus, setVerifyStatus] = useState<'verified' | 'rejected'>('verified')
  const [verifyKeterangan, setVerifyKeterangan] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setFetchError(null)

      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) {
        setFetchError("Token tidak ditemukan. Silakan login kembali.")
        return
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/admin/documents/sosial_media`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

      const data = await response.json()
      
      // Log the response for debugging
      console.log('Admin sosmed documents response:', data)
      
      // Handle the response data regardless of success property
      let documentsData = [];
      
      // Check if data has the expected structure with the success property
      if (data.success === false) {
        console.warn('API indicated failure:', data.message);
        throw new Error(data.message || 'Failed to fetch social media documents');
      }
      
      // Handle different response formats
      if (Array.isArray(data)) {
        // If data is directly an array of documents
        documentsData = data;
        console.log(`Found ${documentsData.length} social media documents (array)`, documentsData);
      } else if (data.data && Array.isArray(data.data)) {
        // If data is wrapped in a data property
        documentsData = data.data;
        console.log(`Found ${documentsData.length} social media documents (data.data)`, documentsData);
      } else if (typeof data === 'object' && data !== null) {
        // Try to find any array property in the response
        const possibleDataArrays = Object.entries(data)
          .filter(([_, value]) => Array.isArray(value))
          .map(([key, value]) => ({ key, value }));
        
        if (possibleDataArrays.length > 0) {
          // Use the first array found and explicitly cast it as an array
          documentsData = possibleDataArrays[0].value as Document[];
          console.log(`Found ${documentsData.length} social media documents (${possibleDataArrays[0].key})`, documentsData);
        } else {
          console.log('No array data found in response:', data);
        }
      }
      
      setDocuments(documentsData)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setFetchError(error instanceof Error ? error.message : "Gagal memuat data dokumen sosial media")
      toast({
        title: "Error",
        description: "Gagal memuat data dokumen sosial media",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedDoc) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/documents/${selectedDoc.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: verifyStatus,
          keterangan: verifyKeterangan.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Update failed')
      }

      const result = await response.json()
      console.log('Update response:', result)

      toast({
        title: "Berhasil",
        description: `Dokumen berhasil ${verifyStatus === 'verified' ? 'diverifikasi' : 'ditolak'}`,
      })

      // Refresh data
      await fetchDocuments()
      
      // Close dialog
      setVerifyDialog(false)
      setSelectedDoc(null)
      setVerifyKeterangan("")

    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui status dokumen",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePreview = (doc: Document) => {
    const baseUrl = import.meta.env.PUBLIC_API_BASE_URL_NO_API || 'http://localhost:8000'
    
    let directFileUrl = doc.file_path
    
    // Log untuk debug
    console.log('=== ADMIN PREVIEW DEBUG INFO ===')
    console.log('Original file path:', doc.file_path)
    console.log('Base URL:', baseUrl)
    
    if (directFileUrl.startsWith('http')) {
      // URL sudah lengkap, tapi mungkin salah port/host
      try {
        const url = new URL(directFileUrl)
        console.log('Parsed URL host:', url.host)
        
        // Check if URL needs to be modified
        if (url.host !== '127.0.0.1:8000' && !url.host.includes(baseUrl.replace('http://', '').replace('https://', ''))) {
          directFileUrl = directFileUrl.replace(url.origin, baseUrl)
          console.log('URL host replaced, new URL:', directFileUrl)
        }
      } catch (e) {
        console.error('Error parsing URL:', e)
        // Fallback - treat as relative path
        if (directFileUrl.startsWith('/storage/')) {
          directFileUrl = `${baseUrl}${directFileUrl}`
        } else if (directFileUrl.startsWith('storage/')) {
          directFileUrl = `${baseUrl}/${directFileUrl}`
        } else {
          directFileUrl = `${baseUrl}/storage/${directFileUrl}`
        }
        console.log('Fallback path constructed:', directFileUrl)
      }
    } else {
      // Jika relatif path, gabungkan dengan base URL
      if (directFileUrl.startsWith('/storage/')) {
        directFileUrl = `${baseUrl}${directFileUrl}`
      } else if (directFileUrl.startsWith('storage/')) {
        directFileUrl = `${baseUrl}/${directFileUrl}`
      } else if (directFileUrl.startsWith('/')) {
        // Path starts with slash but not with /storage
        directFileUrl = `${baseUrl}${directFileUrl}`
      } else {
        // Path tanpa /storage prefix dan tanpa slash awal
        directFileUrl = `${baseUrl}/storage/${directFileUrl}`
      }
      console.log('Relative path converted to:', directFileUrl)
    }
    
    // Ensure URL is fully qualified and remove any double slashes (except after protocol)
    directFileUrl = directFileUrl.replace(/([^:]\/)\/+/g, '$1')
    
    // Test URL with fetch
    console.log('Testing URL accessibility with HEAD request...')
    fetch(directFileUrl, { method: 'HEAD' })
      .then(response => {
        console.log('URL test response:', response.status, response.statusText)
        if (!response.ok) {
          console.warn('URL might not be accessible:', directFileUrl)
        } else {
          console.log('URL is accessible:', directFileUrl)
        }
      })
      .catch(error => {
        console.error('Error testing URL:', error)
      })
    
    // Add cache busting parameter
    const cacheBustingUrl = `${directFileUrl}${directFileUrl.includes('?') ? '&' : '?'}cacheBuster=${Date.now()}`
    console.log('URL with cache buster:', cacheBustingUrl)
    
    setSelectedDoc({
      ...doc,
      file_path: cacheBustingUrl
    })
    setPreviewDialog(true)
  }

  const handleVerify = (doc: Document, status: 'verified' | 'rejected') => {
    setSelectedDoc(doc)
    setVerifyStatus(status)
    setVerifyKeterangan("")
    setVerifyDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="text-green-800 bg-green-100 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Terverifikasi
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        )
    }
  }

  const getDocumentTypeName = (code: string | number | any) => {
    // If we have an object with name property (e.g., document_type_info)
    if (typeof code === 'object' && code !== null && code.name) {
      return code.name;
    }

    const codeStr = String(code);
    const typeMap: { [key: string]: string } = {
      'instagram_follow': 'Bukti Follow Instagram',
      'twibbon_post': 'Postingan Twibbon',
      'tiktok_follow': 'Bukti Follow TikTok',
      'youtube_subscribe': 'Bukti Subscribe YouTube',
      // Numeric types
      '4': 'Bukti Follow Instagram',
      '5': 'Postingan Twibbon',
      '11': 'Bukti Follow TikTok',
      '12': 'Bukti Subscribe YouTube'
    }
    return typeMap[codeStr] || codeStr
  }

  const getDocumentTypeIcon = (code: string | number | any) => {
    // Convert to string to handle both string and numeric types
    const codeStr = String(code);
    
    switch (codeStr) {
      case 'instagram_follow':
      case '4':
        return <Instagram className="w-4 h-4 text-pink-500" />
      case 'twibbon_post':
      case '5':
        return <Share2 className="w-4 h-4 text-blue-500" />
      case 'tiktok_follow':
      case '11':
        return <FileText className="w-4 h-4 text-black" />
      case 'youtube_subscribe':
      case '12':
        return <FileText className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    const matchesType = documentTypeFilter === 'all' || doc.document_type === documentTypeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    verified: documents.filter(d => d.status === 'verified').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
    instagram: documents.filter(d => ['instagram_follow', '4'].includes(String(d.document_type))).length,
    twibbon: documents.filter(d => ['twibbon_post', '5'].includes(String(d.document_type))).length
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat data dokumen sosial media...</span>
          </div>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="container py-6 mx-auto">
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <CardTitle>Error Loading Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-red-600">{fetchError}</p>
            <Button onClick={() => fetchDocuments()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Verifikasi Bukti Sosial Media</h1>
        <p className="text-gray-600">
          Kelola dan verifikasi bukti aktivitas sosial media yang diunggah oleh pendaftar beasiswa
        </p>
      </div>
      
      {/* Media Links Manager */}
      <MediaLinksManager />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Dokumen</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terverifikasi</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Instagram</p>
                <p className="text-2xl font-bold text-pink-600">{stats.instagram}</p>
              </div>
              <Instagram className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Twibbon</p>
                <p className="text-2xl font-bold text-blue-600">{stats.twibbon}</p>
              </div>
              <Share2 className="w-8 h-8 text-blue-500" />
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">Cari Pendaftar/File</Label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                <Input
                  id="search"
                  placeholder="Nama, email, atau nama file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-gray-700">Jenis Dokumen</Label>
              <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="instagram_follow">Bukti Follow Instagram</SelectItem>
                  <SelectItem value="twibbon_post">Postingan Twibbon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setDocumentTypeFilter("all")
                }}
                className="flex-1"
              >
                Reset Filter
              </Button>
              <Button 
                variant="outline"
                onClick={() => fetchDocuments(true)}
                disabled={isRefreshing}
                className="w-10 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Bukti Sosial Media</CardTitle>
            <Badge variant="outline">
              {filteredDocuments.length} dokumen
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pendaftar</TableHead>
                <TableHead>Jenis Aktivitas</TableHead>
                <TableHead>File Screenshot</TableHead>
                <TableHead>Tanggal Upload</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{doc.user.name}</div>
                        <div className="text-xs text-gray-500">{doc.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDocumentTypeIcon(doc.document_type)}
                      <div>
                        <div className="font-medium">{getDocumentTypeName(doc.document_type)}</div>
                        <div className="text-xs text-gray-500">{doc.document_type_info.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-[200px]" title={doc.file_name}>
                        {doc.file_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(doc.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePreview(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {doc.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleVerify(doc, 'verified')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleVerify(doc, 'rejected')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      {doc.status !== 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVerify(doc, doc.status === 'verified' ? 'rejected' : 'verified')}
                        >
                          {doc.status === 'verified' ? 'Tolak' : 'Verifikasi'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredDocuments.length === 0 && (
            <div className="py-8 text-center">
              <Instagram className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">Tidak ada dokumen sosial media</h3>
              <p className="text-gray-500">
                Tidak ada bukti sosial media yang sesuai dengan filter pencarian
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Preview */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Screenshot Sosial Media</DialogTitle>
            <DialogDescription>
              {selectedDoc && (
                <div className="flex flex-col gap-2 text-sm">
                  <span>Pendaftar: <strong>{selectedDoc.user.name}</strong></span>
                  <span>Aktivitas: <strong>{getDocumentTypeName(selectedDoc.document_type)}</strong></span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-hidden border rounded-lg">
            {selectedDoc && (
              <div className="flex items-center justify-center w-full h-full bg-gray-50">
                <img 
                  src={selectedDoc.file_path} 
                  alt="Social Media Screenshot" 
                  className="object-contain max-w-full max-h-full"
                  onLoad={() => {
                    console.log('Image loaded successfully for admin preview')
                  }}
                  onError={(e) => {
                    console.error('Failed to load image in admin preview:', selectedDoc.file_path)
                    const target = e.target as HTMLImageElement
                    
                    // Try with cache-busting query param if not already tried
                    if (!target.src.includes('?cacheBuster=')) {
                      console.log('Retrying image load with fresh cache-busting...')
                      const cacheBuster = new Date().getTime()
                      target.src = `${selectedDoc.file_path.split('?')[0]}?cacheBuster=${cacheBuster}`
                      return
                    }
                    
                    // If still fails, show error message
                    target.style.display = 'none'
                    
                    // Create error message with download link
                    const errorDiv = document.createElement('div')
                    errorDiv.className = 'flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center'
                    errorDiv.innerHTML = `
                      <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">Gagal memuat gambar</h3>
                      <p class="text-sm mb-4">Gambar tidak dapat ditampilkan dalam preview. Silakan unduh untuk melihat file.</p>
                      <a 
                        href="${selectedDoc.file_path.split('?')[0]}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Unduh Gambar
                      </a>
                    `
                    target.parentElement?.appendChild(errorDiv)
                  }}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog(false)}>
              Tutup
            </Button>
            {selectedDoc && (
              <Button onClick={() => window.open(selectedDoc.file_path, '_blank')}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Verifikasi */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verifyStatus === 'verified' ? 'Verifikasi' : 'Tolak'} Bukti Sosial Media
            </DialogTitle>
            <DialogDescription>
              {selectedDoc && (
                <div>
                  Aktivitas: <strong>{getDocumentTypeName(selectedDoc.document_type)}</strong><br/>
                  Pendaftar: <strong>{selectedDoc.user.name}</strong>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status-keterangan">
                Keterangan {verifyStatus === 'verified' ? '(Opsional)' : '(Wajib)'}
              </Label>
              <Textarea
                id="status-keterangan"
                placeholder={verifyStatus === 'verified' 
                  ? "Tambahkan catatan verifikasi..." 
                  : "Jelaskan alasan penolakan (screenshot tidak jelas, tidak sesuai, dll)..."
                }
                value={verifyKeterangan}
                onChange={(e) => setVerifyKeterangan(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            {verifyStatus === 'rejected' && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Pastikan alasan penolakan jelas:</p>
                    <ul className="mt-1 text-xs list-disc list-inside">
                      <li>Screenshot tidak jelas atau terpotong</li>
                      <li>Akun yang di-follow bukan akun resmi</li>
                      <li>Postingan twibbon tidak sesuai ketentuan</li>
                      <li>Bukti follow/subscribe palsu</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={isUpdating || (verifyStatus === 'rejected' && !verifyKeterangan.trim())}
              className={verifyStatus === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {verifyStatus === 'verified' ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {verifyStatus === 'verified' ? 'Verifikasi' : 'Tolak'} Bukti
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}