"use client"

import React, { useState, useEffect } from "react"
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Download,
  Loader2,
  Lock,
  Send
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEditStatus } from "@/hooks/useEditStatus"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ✅ Tambahkan toast hook yang benar
const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
      // Simple toast implementation
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

interface DocumentType {
  id: number;
  name: string;
  code: string;
  description: string;
  max_size_mb: number;
  allowed_formats: string[];
  is_required: boolean;
  is_active: boolean;
  category: string;
}

interface UserDocument {
  id: number;
  document_type_id: number;
  file_name: string;
  file_path: string;
  status: 'pending' | 'verified' | 'rejected';
  uploaded_at: string;
  verified_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  document_type: DocumentType;
}

export default function UploadWajibPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingType, setUploadingType] = useState<number | null>(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null)
  
  const { toast } = useToast()
  const { 
    editStatus, 
    isLoading: editStatusLoading, 
    canEdit, 
    isFinalized, 
    finalizedAt,
    applicationStatus 
  } = useEditStatus()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        })
        return
      }

      // Fetch document types dan user documents
      const [typesResponse, docsResponse] = await Promise.all([
        fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/document-types?category=wajib`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/my-documents?category=wajib`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ])

      if (!typesResponse.ok || !docsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const typesData = await typesResponse.json()
      const docsData = await docsResponse.json()

      console.log('Document types:', typesData)
      console.log('User documents:', docsData)

      setDocumentTypes(typesData.data || [])
      setUserDocuments(docsData.data || [])

    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data dokumen",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File, documentTypeId: number) => {
    if (!canEdit) {
      toast({
        title: "Tidak Dapat Mengupload",
        description: editStatus?.message || "Aplikasi sudah dikirim dan tidak dapat diubah.",
        variant: "destructive",
      })
      return
    }

    setUploadingType(documentTypeId)
    
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type_id', documentTypeId.toString())

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      console.log('Upload response:', result)

      toast({
        title: "✅ Upload Berhasil",
        description: "Dokumen berhasil diunggah dan sedang dalam proses verifikasi.",
      })

      // Refresh data
      await fetchData()

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengupload dokumen",
        variant: "destructive",
      })
    } finally {
      setUploadingType(null)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (!canEdit) {
      toast({
        title: "Tidak Dapat Menghapus",
        description: editStatus?.message || "Aplikasi sudah dikirim dan tidak dapat diubah.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/delete-document/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Delete failed')
      }

      toast({
        title: "✅ Dokumen Dihapus",
        description: "Dokumen berhasil dihapus.",
      })

      // Refresh data
      await fetchData()

    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus dokumen",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="text-green-700 bg-green-100 border-green-200">
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
          <Badge variant="outline" className="text-yellow-700 bg-yellow-100 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Verifikasi
          </Badge>
        )
    }
  }

  const getUserDocumentForType = (typeId: number) => {
    return userDocuments.find(doc => doc.document_type_id === typeId)
  }

  const calculateProgress = () => {
    if (documentTypes.length === 0) return 0
    const verifiedCount = documentTypes.filter(type => {
      const userDoc = getUserDocumentForType(type.id)
      return userDoc && userDoc.status === 'verified'
    }).length
    return Math.round((verifiedCount / documentTypes.length) * 100)
  }

  if (isLoading || editStatusLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat data dokumen...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">📄 Upload Dokumen Wajib</h1>
        <p className="text-gray-600">
          Unggah dokumen-dokumen wajib yang diperlukan untuk pendaftaran beasiswa
        </p>
      </div>

      {/* Edit Status Alert */}
      {isFinalized && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Send className="w-4 h-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Aplikasi Sudah Dikirim</AlertTitle>
          <AlertDescription className="text-blue-700">
            Aplikasi beasiswa Anda sudah dikirim pada{" "}
            <strong>
              {finalizedAt && new Date(finalizedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </strong>
            {applicationStatus && (
              <span> dengan status <strong>{applicationStatus}</strong></span>
            )}
            . Dokumen tidak dapat diubah lagi.
          </AlertDescription>
        </Alert>
      )}

      {!canEdit && !isFinalized && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Lock className="w-4 h-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Akses Terbatas</AlertTitle>
          <AlertDescription className="text-amber-700">
            {editStatus?.message || "Dokumen tidak dapat diubah saat ini."}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Progress Upload Dokumen Wajib
          </CardTitle>
          <CardDescription>
            {documentTypes.filter(type => {
              const userDoc = getUserDocumentForType(type.id)
              return userDoc && userDoc.status === 'verified'
            }).length} dari {documentTypes.length} dokumen terverifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kelengkapan Dokumen</span>
              <span className="text-sm font-medium">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mulai upload dokumen</span>
              <span>Semua dokumen terverifikasi</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="space-y-6">
        {documentTypes.map((docType) => {
          const userDoc = getUserDocumentForType(docType.id)
          const isUploading = uploadingType === docType.id

          return (
            <Card key={docType.id} className={`${
              userDoc?.status === 'verified' ? 'border-green-200 bg-green-50/30' :
              userDoc?.status === 'rejected' ? 'border-red-200 bg-red-50/30' :
              userDoc?.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' :
              'border-gray-200'
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {docType.name}
                      <span className="ml-2 text-sm font-normal text-red-500">*wajib</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {docType.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Max: {docType.max_size_mb}MB
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Format: {docType.allowed_formats.join(', ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {userDoc ? getStatusBadge(userDoc.status) : (
                      <Badge variant="outline" className="text-gray-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Belum Upload
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {userDoc ? (
                  <div className="space-y-3">
                    {/* Existing Document Info */}
                    <div className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{userDoc.file_name}</p>
                            <p className="text-xs text-gray-500">
                              Diupload: {new Date(userDoc.uploaded_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDocument(userDoc)
                              setViewDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {canEdit && userDoc.status !== 'verified' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteDocument(userDoc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rejection Message */}
                    {userDoc.status === 'rejected' && userDoc.rejection_reason && (
                      <Alert variant="destructive">
                        <XCircle className="w-4 h-4" />
                        <AlertTitle>Dokumen Ditolak</AlertTitle>
                        <AlertDescription>
                          {userDoc.rejection_reason}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Replace Button for Rejected Documents */}
                    {canEdit && userDoc.status === 'rejected' && (
                      <div>
                        <Label htmlFor={`file-${docType.id}`} className="text-sm font-medium">
                          Upload Ulang Dokumen
                        </Label>
                        <div className="mt-1">
                          <Input
                            id={`file-${docType.id}`}
                            type="file"
                            accept={docType.allowed_formats.map(f => `.${f}`).join(',')}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                // Validate file size
                                if (file.size > docType.max_size_mb * 1024 * 1024) {
                                  toast({
                                    title: "File Terlalu Besar",
                                    description: `Ukuran file maksimal ${docType.max_size_mb}MB`,
                                    variant: "destructive",
                                  })
                                  return
                                }
                                handleFileUpload(file, docType.id)
                              }
                            }}
                            disabled={isUploading || !canEdit}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Upload New Document
                  <div className="space-y-3">
                    {canEdit ? (
                      <div>
                        <Label htmlFor={`file-${docType.id}`} className="text-sm font-medium">
                          Pilih File untuk Diupload
                        </Label>
                        <div className="mt-1">
                          <Input
                            id={`file-${docType.id}`}
                            type="file"
                            accept={docType.allowed_formats.map(f => `.${f}`).join(',')}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                // Validate file size
                                if (file.size > docType.max_size_mb * 1024 * 1024) {
                                  toast({
                                    title: "File Terlalu Besar",
                                    description: `Ukuran file maksimal ${docType.max_size_mb}MB`,
                                    variant: "destructive",
                                  })
                                  return
                                }
                                handleFileUpload(file, docType.id)
                              }
                            }}
                            disabled={isUploading}
                          />
                        </div>
                        
                        {isUploading && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengupload dokumen...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Upload dokumen tidak tersedia
                        </p>
                        <p className="text-xs text-gray-400">
                          {editStatus?.message || "Aplikasi sudah dikirim"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Document View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Dokumen</DialogTitle>
            <DialogDescription>
              {selectedDocument && (
                <div className="space-y-2">
                  <div><strong>Nama File:</strong> {selectedDocument.file_name}</div>
                  <div><strong>Jenis:</strong> {selectedDocument.document_type.name}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedDocument.status)}</div>
                  <div><strong>Upload:</strong> {new Date(selectedDocument.uploaded_at).toLocaleDateString('id-ID')}</div>
                  {selectedDocument.verified_at && (
                    <div><strong>Verifikasi:</strong> {new Date(selectedDocument.verified_at).toLocaleDateString('id-ID')}</div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument?.status === 'rejected' && selectedDocument.rejection_reason && (
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertTitle>Alasan Penolakan</AlertTitle>
              <AlertDescription>
                {selectedDocument.rejection_reason}
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>
              Tutup
            </Button>
            {selectedDocument && (
              <Button 
                onClick={() => {
                  window.open(`${import.meta.env.PUBLIC_API_BASE_URL}/storage/${selectedDocument.file_path}`, '_blank')
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}