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
  RefreshCw
} from "lucide-react"
import { DocumentStats } from "./document-stats"

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

export default function AdminDokumenWajibPage() {
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true)
      }
      setFetchError(null);

      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) {
        setFetchError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/admin/documents/wajib`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

      const data = await response.json()
      
      // Log the response for debugging
      console.log('Admin wajib documents response:', data)
      
      // Handle the response data regardless of success property
      let documentsData = [];
      
      // Check if data has the expected structure with the success property
      if (data.success === false) {
        console.warn('API indicated failure:', data.message);
        throw new Error(data.message || 'Failed to fetch documents');
      }
      
      // Handle different response formats
      if (Array.isArray(data)) {
        // If data is directly an array of documents
        documentsData = data;
        console.log(`Found ${documentsData.length} required documents (array)`, documentsData);
      } else if (data.data && Array.isArray(data.data)) {
        // If data is wrapped in a data property
        documentsData = data.data;
        console.log(`Found ${documentsData.length} required documents (data.data)`, documentsData);
      } else if (typeof data === 'object' && data !== null) {
        // Try to find any array property in the response
        const possibleDataArrays = Object.entries(data)
          .filter(([_, value]) => Array.isArray(value))
          .map(([key, value]) => ({ key, value }));
        
        if (possibleDataArrays.length > 0) {
          // Use the first array found
          documentsData = possibleDataArrays[0].value as Document[];
          console.log(`Found ${documentsData.length} required documents (${possibleDataArrays[0].key})`, documentsData);
        } else {
          console.log('No array data found in response:', data);
        }
      }
      
      setDocuments(documentsData)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setFetchError(error instanceof Error ? error.message : "Gagal memuat data dokumen");
      toast({
        title: "Error",
        description: "Gagal memuat data dokumen",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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
    const baseUrl = import.meta.env.PUBLIC_API_BASE_URL_NO_API || 'http://localhost:8000';
    
    let directFileUrl = doc.file_path;
    
    if (directFileUrl.startsWith('http')) {
      // URL sudah lengkap, tapi perlu validasi domain
      const url = new URL(directFileUrl);
      if (url.host !== '127.0.0.1:8000' && !url.host.includes(baseUrl.replace('http://', '').replace('https://', ''))) {
        directFileUrl = directFileUrl.replace(url.origin, baseUrl);
      }
    } else {
      // Jalur relatif, perlu ditambahkan baseUrl
      if (directFileUrl.startsWith('/storage/')) {
        directFileUrl = `${baseUrl}${directFileUrl}`;
      } else if (directFileUrl.startsWith('storage/')) {
        directFileUrl = `${baseUrl}/${directFileUrl}`;
      } else {
        directFileUrl = `${baseUrl}/storage/${directFileUrl}`;
      }
    }
    
    console.log('Preview URL:', directFileUrl);
    
    setSelectedDoc({
      ...doc,
      file_path: directFileUrl
    });
    setPreviewDialog(true);
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
            <CheckCircle2 className="mr-1 w-3 h-3" />
            Terverifikasi
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 w-3 h-3" />
            Ditolak
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 w-3 h-3" />
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
      // Dokumen Wajib (1-3)
      'student_proof': 'Bukti Status Siswa',
      'identity_proof': 'Identitas Diri',
      'photo': 'Foto Diri',
      // Dokumen Sosmed (4-5)
      'instagram_follow': 'Bukti Follow Instagram',
      'twibbon_post': 'Postingan Twibbon',
      'tiktok_follow': 'Bukti Follow TikTok',
      'youtube_subscribe': 'Bukti Subscribe YouTube',
      // Numerik (untuk menangani document_type_id)
      '1': 'Bukti Status Siswa',
      '2': 'Identitas Diri',
      '3': 'Foto Diri',
      '4': 'Bukti Follow Instagram',
      '5': 'Postingan Twibbon'
    }
    
    return typeMap[codeStr] || codeStr;
  }

  const getDocumentTypeIcon = (code: string | number | any) => {
    // Convert to string to handle both string and numeric types
    const codeStr = String(code);
    
    switch (codeStr) {
      case 'student_proof':
      case '1':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'identity_proof':
      case '2':
        return <User className="w-4 h-4 text-green-500" />
      case 'photo':
      case '3':
        return <FileText className="w-4 h-4 text-purple-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const isFilePDF = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.pdf')
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
    rejected: documents.filter(d => d.status === 'rejected').length
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="flex gap-2 items-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat data dokumen...</span>
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

  // Count documents by status
  const documentStats = {
    total: documents.length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    verified: documents.filter(doc => doc.status === 'verified').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length,
    notUploaded: 0 // Admin view doesn't track this since all documents here are uploaded
  }

  return (
    <div className="container py-6 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Verifikasi Dokumen Wajib</h1>
        <p className="text-gray-600">
          Kelola dan verifikasi dokumen wajib yang diunggah oleh pendaftar beasiswa
        </p>
      </div>
      
      {/* Document Statistics */}
      <div className="mb-6">
        <DocumentStats 
          total={documentStats.total}
          pending={documentStats.pending} 
          verified={documentStats.verified} 
          rejected={documentStats.rejected}
          notUploaded={0} // Admin doesn't need this, but we'll include it for interface compatibility
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Pendaftar/File</Label>
              <div className="relative">
                <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
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
              <Label htmlFor="status">Status</Label>
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
              <Label htmlFor="type">Jenis Dokumen</Label>
              <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="student_proof">Bukti Status Siswa</SelectItem>
                  <SelectItem value="identity_proof">Identitas Diri</SelectItem>
                  <SelectItem value="photo">Foto Diri</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 items-end">
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
                className="p-0 w-10"
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
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Dokumen Wajib</CardTitle>
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
                <TableHead>Jenis Dokumen</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Tanggal Upload</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{doc.user.name}</div>
                        <div className="text-xs text-gray-500">{doc.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex gap-2 items-center">
                      {getDocumentTypeIcon(doc.document_type)}
                      {getDocumentTypeName(doc.document_type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">                      {isFilePDF(doc.file_name) ? 
                        <FileText className="w-4 h-4 text-red-400" /> : 
                        <FileText className="w-4 h-4 text-blue-400" />
                      }
                      <span className="truncate max-w-[200px]" title={doc.file_name}>
                        {doc.file_name}
                      </span><span className="truncate max-w-[200px]" title={doc.file_name}>
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
                    <div className="flex gap-2 justify-end">
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
              <FileText className="mx-auto mb-4 w-12 h-12 text-gray-400 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">Tidak ada dokumen</h3>
              <p className="text-gray-500">
                Tidak ada dokumen yang sesuai dengan filter pencarian
              </p>
            </div>
          )}
        </CardContent>
      </Card>      {/* Dialog Preview */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Dokumen</DialogTitle>
            <DialogDescription>
              {selectedDoc && (
                <div className="flex flex-col gap-2 text-sm">
                  <span>Pendaftar: <strong>{selectedDoc.user.name}</strong></span>
                  <span>Jenis: <strong>{getDocumentTypeName(selectedDoc.document_type)}</strong></span>
                  <span>File: <strong>{selectedDoc.file_name}</strong></span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-hidden flex-1 min-h-0 rounded-lg border">
            {selectedDoc && (
              isFilePDF(selectedDoc.file_name) ? (
                <iframe 
                  src={selectedDoc.file_path} 
                  className="w-full h-full" 
                  title="Document Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="flex justify-center items-center w-full h-full bg-gray-50">
                  <img 
                    src={selectedDoc.file_path} 
                    alt="Document Preview" 
                    className="object-contain max-w-full max-h-full"
                    onError={(e) => {
                      console.error('Image failed to load:', selectedDoc.file_path);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjJDNi40NzcgMjIgMiAxNy41MjMgMiAxMkMyIDYuNDc3IDYuNDc3IDIgMTIgMkMxNy41MjMgMiAyMiA2LjQ3NyAyMiAxMkMyMiAxNy41MjMgMTcuNTIzIDIyIDEyIDIyWk0xMiAyMEMxNi40MTggMjAgMjAgMTYuNDE4IDIwIDEyQzIwIDcuNTgyIDE2LjQxOCA0IDEyIDRDNy41ODIgNCA0IDcuNTgyIDQgMTJDNCAxNi40MTggNy41ODIgMjAgMTIgMjBaTTExIDd2MkgxM1Y3SDExWk0xMSAxN0gxM1YxMUgxMVYxN1oiIGZpbGw9IiNmZjAwMDAiLz48L3N2Zz4=';
                      e.currentTarget.classList.add('w-24', 'h-24');
                    }}
                  />
                </div>
              )
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPreviewDialog(false)}>
              Tutup
            </Button>
            {selectedDoc && (
              <Button 
                onClick={() => window.open(selectedDoc.file_path, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-1 w-4 h-4" />
                Download / Buka di Tab Baru
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
              {verifyStatus === 'verified' ? 'Verifikasi' : 'Tolak'} Dokumen
            </DialogTitle>
            <DialogDescription>
              {selectedDoc && (
                <div>
                  Dokumen: <strong>{getDocumentTypeName(selectedDoc.document_type)}</strong><br/>
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
                  : "Jelaskan alasan penolakan..."
                }
                value={verifyKeterangan}
                onChange={(e) => setVerifyKeterangan(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
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
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {verifyStatus === 'verified' ? (
                    <CheckCircle2 className="mr-2 w-4 h-4" />
                  ) : (
                    <XCircle className="mr-2 w-4 h-4" />
                  )}
                  {verifyStatus === 'verified' ? 'Verifikasi' : 'Tolak'} Dokumen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}