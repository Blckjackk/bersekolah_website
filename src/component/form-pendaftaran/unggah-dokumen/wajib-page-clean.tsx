"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  FileUp, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Upload, 
  FileText, 
  Loader2,
  Info,
  X,
  Clock,
  Trash2,
  XCircle
} from "lucide-react"
import { DocumentStats } from "./document-stats"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/hooks/use-toast"

interface UploadedDocument {
  id: number;
  document_type: string;
  document_type_id: number;
  document_type_name?: string;
  document_type_code?: string; // Add this property for compatibility
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'verified' | 'rejected';
  keterangan?: string;
  verified_at?: string | null;
  verified_by?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at?: string;
}

interface DocumentType {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  is_required: boolean;
  allowed_formats: string[];
  max_file_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function DokumenWajibPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDialog, setUploadDialog] = useState(false)
  const [previewDialog, setPreviewDialog] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null)
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  // Fetch document types dan uploaded documents
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch document types first
      await fetchDocumentTypes()
      
      // Then fetch uploaded documents
      await fetchDocuments()
      
      // Force component update
      setForceUpdateCounter(prev => prev + 1)
      
      return true
    } catch (error) {
      console.error('Error in fetchData:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data dokumen",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const forceRefreshData = async () => {
    setIsLoading(true)
    
    // Clear existing data first
    setUploadedDocs([])
    setDocumentTypes([])
    
    // Add significant delay and then fetch fresh data
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      // Force a complete data refresh with strong cache busting
      const result = await fetchData()
      if (result) {
        toast({
          title: "Berhasil",
          description: "Data dokumen telah diperbarui",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Error during force refresh:', error)
      toast({
        title: "Error", 
        description: "Gagal memperbarui data, silakan coba lagi",
        variant: "destructive",
      })
    }
  }

  // Fetch data saat komponen dimuat dan setelah upload
  useEffect(() => {
    fetchData()
    
    // Set up interval to periodically refresh document status
    const refreshInterval = setInterval(() => {
      fetchData()
    }, 60000) // Refresh every 60 seconds
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(refreshInterval)
    }
  }, [])
  
  useEffect(() => {
    if (forceUpdateCounter > 0) {
      // State changed, component will re-render
    }
  }, [forceUpdateCounter, uploadedDocs])

  // Fetch document types dari API
  const fetchDocumentTypes = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) {
        toast({
          title: "Error",
          description: "Sesi anda telah berakhir. Silakan login kembali",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/document-types?category=wajib`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch document types')

      const data = await response.json()
      setDocumentTypes(data.data || [])
    } catch (error) {
      console.error('Error fetching document types:', error)
      toast({
        title: "Error",
        description: "Gagal memuat jenis dokumen",
        variant: "destructive",
      })
    }
  }

  // Fetch uploaded documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) return

      // Add cache buster to avoid browser caching
      const cacheBuster = new Date().getTime()
      
      // Explicitly request wajib category documents
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/my-documents?category=wajib&nocache=${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText)
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        // Process data before setting it - filter for wajib document types (1-3)
        const processedDocs = data.data
          .filter((doc: any) => {
            // Get document type information - first try document_type object, then fallback to other properties
            const docTypeId = doc.document_type?.id || doc.document_type_id || 0;
            const docTypeCode = doc.document_type?.code || doc.document_type_code || doc.document_type || '';
            const docTypeCategory = doc.document_type?.category || '';
            
            // Include documents that match either:
            // 1. Document type IDs 1-3 (wajib category documents)
            // 2. Document codes for wajib documents
            // 3. Documents explicitly in wajib category
            const isWajibDoc = (
              // By ID (1-3, which are wajib type documents)
              (docTypeId >= 1 && docTypeId <= 3) ||
              // By code for wajib documents
              ['student_proof', 'identity_proof', 'photo'].includes(docTypeCode) ||
              // By explicit category
              (docTypeCategory === 'wajib')
            );
            
            return isWajibDoc;
          })
          .map((doc: any) => {
            // Enhanced document data extraction with nested properties support
            const docType = doc.document_type || {};
            
            const processedDoc = {
              id: doc.id || 0,
              document_type: docType.code || doc.document_type_code || doc.document_type || 'unknown',
              document_type_id: docType.id || doc.document_type_id || 0,
              document_type_name: docType.name || '',
              document_type_code: docType.code || doc.document_type_code || doc.document_type || 'unknown', // Add this for compatibility
              status: doc.status || 'pending',
              file_path: doc.file_path || '',
              file_name: doc.file_name || 'Document file',
              file_type: doc.file_type || '',
              file_size: doc.file_size || 0,
              keterangan: doc.keterangan || '',
              created_at: doc.created_at || new Date().toISOString(),
              updated_at: doc.updated_at || null,
              verified_at: doc.verified_at || null,
              verified_by: doc.verified_by || null
            };
            
            return processedDoc;
          });
        
        // Update documents state
        setUploadedDocs(processedDocs)
        
        // Add a brief delay to ensure state is fully updated before forcing re-render
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Force re-render with updated counter
        setForceUpdateCounter(prevCounter => prevCounter + 1)
      } else {
        setUploadedDocs([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data dokumen",
        variant: "destructive",
      })
      // Set empty array to prevent undefined errors
      setUploadedDocs([])
    }
  }

  // Get document status based on document type code
  const getDocumentStatus = (docCode: string): UploadedDocument | undefined => {
    // Make sure we have uploadedDocs before attempting to find
    if (!uploadedDocs || !Array.isArray(uploadedDocs) || uploadedDocs.length === 0) {
      return undefined;
    }
    
    // Find document by type code - check multiple possible properties
    const foundDoc = uploadedDocs.find(doc => {
      if (!doc) return false;
      
      // Try different ways to match document type code
      const docTypeCode = doc.document_type || doc.document_type_code || '';
      const match = docTypeCode.toLowerCase() === docCode.toLowerCase();
      
      return match;
    });
    
    return foundDoc;
  }

  const getUploadedDocuments = () => {
    if (!documentTypes || documentTypes.length === 0) {
      return []
    }
    
    const mappedDocuments = documentTypes.map(docType => {
      const uploadedDoc = getDocumentStatus(docType.code)
      
      const mappedDoc = {
        ...docType,
        uploaded_doc: uploadedDoc,
        uploaded_at: uploadedDoc?.created_at ? new Date(uploadedDoc.created_at).toLocaleDateString('id-ID') : '-',
        // Generate a unique key that changes when any relevant property changes to force re-render
        key: `${docType.id}-${uploadedDoc?.id || 'none'}-${uploadedDoc?.status || 'none'}-${forceUpdateCounter}`
      }
      
      return mappedDoc
    })
    
    return mappedDocuments
  }

  // Generate endpoint berdasarkan document code
  const getUploadEndpoint = (code: string): string => {
    const endpointMap: { [key: string]: string } = {
      'student_proof': '/upload-bukti-status-siswa',
      'identity_proof': '/upload-identitas-diri',
      'photo': '/upload-foto-diri',
      'instagram_follow': '/upload-bukti-follow',
      'twibbon_post': '/upload-twibon'
    }
    
    return endpointMap[code] || `/upload-document/${code}`
  }

  // Validate file berdasarkan document type
  const validateFile = (file: File, docType: DocumentType): boolean => {
    const allowedFormats = docType.allowed_formats || ['jpg', 'jpeg', 'png', 'pdf']
    const maxSize = docType.max_file_size || (10 * 1024 * 1024) // Default 10MB

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      toast({
        title: "Error",
        description: `Format file tidak didukung. Gunakan: ${allowedFormats.join(', ').toUpperCase()}`,
        variant: "destructive",
      })
      return false
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1)
      toast({
        title: "Error",
        description: `Ukuran file maksimal ${maxSizeMB}MB`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Handler untuk file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeDocument) return

    // Validate file
    if (!validateFile(file, activeDocument)) {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
  }

  // Upload document
  const handleUpload = async () => {
    if (!selectedFile || !activeDocument) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No auth token')

      const formData = new FormData()
      formData.append('file', selectedFile)

      const endpoint = getUploadEndpoint(activeDocument.code)
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      // Refresh documents after successful upload
      await fetchData()

      toast({
        title: "Berhasil",
        description: `${activeDocument.name} berhasil diunggah`,
      })

      // Close dialog dan reset state
      setUploadDialog(false)
      setSelectedFile(null)
      setActiveDocument(null)

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengunggah dokumen",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadClick = (docType: DocumentType) => {
    setActiveDocument(docType)
    setSelectedFile(null)
    setUploadDialog(true)
  }
  const handlePreview = (uploadedDoc: UploadedDocument) => {
    // Convert API file path to direct storage URL
    const baseUrl = import.meta.env.PUBLIC_API_BASE_URL_NO_API || 'http://localhost:8000';
    
    let directFileUrl = uploadedDoc.file_path;
    
    // Log untuk debug
    console.log('Original file path:', uploadedDoc.file_path);
    console.log('Base URL:', baseUrl);
    
    // Jika file_path adalah URL lengkap, gunakan apa adanya
    if (directFileUrl.startsWith('http')) {
      // URL sudah lengkap, tapi mungkin salah port/host
      try {
        const url = new URL(directFileUrl);
        console.log('Parsed URL host:', url.host);
        
        // Check if URL needs to be modified
        if (url.host !== '127.0.0.1:8000' && !url.host.includes(baseUrl.replace('http://', '').replace('https://', ''))) {
          directFileUrl = directFileUrl.replace(url.origin, baseUrl);
          console.log('URL host replaced, new URL:', directFileUrl);
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
        // Fallback - treat as relative path
        if (directFileUrl.startsWith('/storage/')) {
          directFileUrl = `${baseUrl}${directFileUrl}`;
        } else if (directFileUrl.startsWith('storage/')) {
          directFileUrl = `${baseUrl}/${directFileUrl}`;
        } else {
          directFileUrl = `${baseUrl}/storage/${directFileUrl}`;
        }
      }
    } else {
      // Jika relatif path, gabungkan dengan base URL
      if (directFileUrl.startsWith('/storage/')) {
        directFileUrl = `${baseUrl}${directFileUrl}`;
      } else if (directFileUrl.startsWith('storage/')) {
        directFileUrl = `${baseUrl}/${directFileUrl}`;
      } else {
        // Path tanpa /storage prefix
        directFileUrl = `${baseUrl}/storage/${directFileUrl}`;
      }
      console.log('Relative path converted to:', directFileUrl);
    }
    
    const docWithCorrectedPath = {
      ...uploadedDoc,
      file_path: directFileUrl
    };
    
    console.log('Final document for preview:', docWithCorrectedPath);
    
    setPreviewDoc(docWithCorrectedPath);
    setPreviewDialog(true);
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="text-white bg-green-600 border-green-600 shadow-sm hover:bg-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Terverifikasi
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="text-white bg-red-600 border-red-600 shadow-sm hover:bg-red-700">
            <X className="w-3 h-3 mr-1" /> Ditolak
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="text-white bg-yellow-600 border-yellow-600 shadow-sm hover:bg-yellow-700">
            <AlertCircle className="w-3 h-3 mr-1" /> Menunggu
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300 shadow-sm bg-gray-50 hover:bg-gray-100">
            <FileText className="w-3 h-3 mr-1" /> Belum Diunggah
          </Badge>
        )
    }
  }

  // Check if file is a PDF based on file extension or type
  const isFilePDF = (fileName: string): boolean => {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith('.pdf');
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format allowed formats untuk display
  const formatAllowedFormats = (formats: string[]): string => {
    return formats.map(f => f.toUpperCase()).join(', ')
  }

  // Format max file size untuk display
  const formatMaxFileSize = (bytes: number): string => {
    return formatFileSize(bytes)
  }

  const documentsData = getUploadedDocuments()
  const totalDocs = documentsData.length
  const completedDocs = documentsData.filter(doc => doc.uploaded_doc?.status === 'verified').length

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Memuat data dokumen...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto space-y-6">
      {/* Alert Info */}
      <div className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Informasi Dokumen Wajib</AlertTitle>
          <AlertDescription className="text-blue-700">
            {totalDocs === 0 ? (
              <>Belum ada jenis dokumen wajib yang tersedia. Silakan hubungi admin atau refresh halaman.</>
            ) : completedDocs === totalDocs ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Semua dokumen wajib telah terverifikasi!</span>
                </div>
                Anda telah menyelesaikan semua persyaratan dokumen wajib untuk beasiswa.
              </>
            ) : (
              <>
                <div className="mb-2">
                  Unggah semua dokumen yang diperlukan untuk melengkapi persyaratan beasiswa. 
                  Pastikan dokumen yang diunggah jelas dan sesuai dengan ketentuan.
                </div>
                <div className="text-sm">
                  Progress saat ini: {completedDocs}/{totalDocs} dokumen terverifikasi.
                </div>
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Document Statistics */}      
      <div className="mb-6">
        <DocumentStats 
          total={totalDocs}
          notUploaded={totalDocs - documentsData.filter(doc => doc.uploaded_doc).length}
          pending={documentsData.filter(doc => doc.uploaded_doc?.status === 'pending').length} 
          verified={documentsData.filter(doc => doc.uploaded_doc?.status === 'verified').length} 
          rejected={documentsData.filter(doc => doc.uploaded_doc?.status === 'rejected').length} 
        />
      </div>

      <Card>        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Dokumen Wajib</CardTitle>
              <CardDescription>
                Dokumen yang harus dilengkapi untuk pendaftaran beasiswa
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => forceRefreshData()} 
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                  )}
                  {isLoading ? "Menyegarkan..." : "Segarkan"}
                </Button>
                <Badge 
                  variant={completedDocs === totalDocs ? "default" : "outline"} 
                  className={
                    completedDocs === totalDocs 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : completedDocs > 0 
                        ? "text-yellow-700 bg-yellow-50 border-yellow-200" 
                        : "text-gray-600"
                  }
                >
                  {completedDocs === totalDocs ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Semua Selesai</>
                  ) : (
                    <><FileText className="w-3 h-3 mr-1" /> {completedDocs}/{totalDocs} Dokumen Selesai</>
                  )}
                </Badge>
              </div>
              
              {documentsData.filter(doc => doc.uploaded_doc?.status === 'pending').length > 0 && (
                <span className="text-xs text-yellow-600">
                  {documentsData.filter(doc => doc.uploaded_doc?.status === 'pending').length} dokumen menunggu verifikasi
                </span>
              )}
              
              {documentsData.filter(doc => doc.uploaded_doc?.status === 'rejected').length > 0 && (
                <span className="text-xs font-medium text-red-600">
                  {documentsData.filter(doc => doc.uploaded_doc?.status === 'rejected').length} dokumen ditolak
                </span>
              )}
            </div>
          </div>
        </CardHeader>        
        <CardContent>
          {documentsData.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">Tidak ada dokumen</h3>
              <p className="text-gray-500">
                Belum ada jenis dokumen wajib yang tersedia. Silakan refresh halaman atau hubungi admin.
              </p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => forceRefreshData()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  'Refresh Data'
                )}
              </Button>
            </div>
          ) : (
            <Table key={`documents-table-${forceUpdateCounter}`}>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Dokumen</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Tanggal Upload</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentsData.map((doc) => (                
                  <TableRow 
                    key={`doc-${doc.id}-${doc.uploaded_doc?.id || 'none'}-${doc.uploaded_doc?.status || 'none'}-${forceUpdateCounter}`}
                    className={doc.uploaded_doc ? 
                      doc.uploaded_doc.status === 'verified' ? 'bg-green-50/40 hover:bg-green-50/60' : 
                      doc.uploaded_doc.status === 'pending' ? 'bg-yellow-50/40 hover:bg-yellow-50/60' : 
                      doc.uploaded_doc.status === 'rejected' ? 'bg-red-50/30 hover:bg-red-50/50' : '' 
                      : 'bg-gray-50/30 hover:bg-gray-50/50'}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {doc.uploaded_doc ? (
                          <div className="flex items-center gap-2">
                            <FileText className={`h-4 w-4 ${
                              doc.uploaded_doc.status === 'verified' ? 'text-green-600' : 
                              doc.uploaded_doc.status === 'pending' ? 'text-yellow-600' : 
                              doc.uploaded_doc.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                            <span>{doc.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{doc.name}</span>
                          </div>
                        )}
                        {doc.is_required && (
                          <Badge variant="secondary" className="text-xs">Wajib</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">{doc.description}</p>
                        <div className="text-xs text-gray-500">
                          Format: {formatAllowedFormats(doc.allowed_formats)} | 
                          Max: {formatMaxFileSize(doc.max_file_size)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {doc.uploaded_doc ? (
                          <div className="space-y-1">
                            <div>{doc.uploaded_at}</div>
                            <div className="text-xs text-gray-500">
                              {doc.uploaded_doc.file_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.uploaded_doc ? getStatusBadge(doc.uploaded_doc.status) : getStatusBadge('none')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.uploaded_doc && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(doc.uploaded_doc!)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUploadClick(doc)}
                          disabled={isUploading}
                          className={!doc.uploaded_doc ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                        >
                          {doc.uploaded_doc ? (
                            doc.uploaded_doc.status === 'verified' ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Unggah Ulang
                              </>
                            ) : doc.uploaded_doc.status === 'rejected' ? (
                              <>
                                <Upload className="w-4 h-4 mr-1" />
                                Unggah Ulang
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-1" />
                                Unggah Ulang
                              </>
                            )
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-1" />
                              Unggah Dokumen
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Upload */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getDocumentStatus(activeDocument?.code || '') ? 'Update' : 'Upload'} {activeDocument?.name}
            </DialogTitle>
            <DialogDescription>
              {activeDocument?.description}
            </DialogDescription>
            {getDocumentStatus(activeDocument?.code || '') && (
              <div className="p-3 mt-2 border rounded-md bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>File yang ada akan diganti dengan file baru</span>
                </div>
              </div>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Pilih File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                accept={activeDocument?.allowed_formats.map(f => `.${f}`).join(',')}
                onChange={handleFileSelect}
                className="mt-1"
              />
              {activeDocument && (
                <p className="mt-1 text-xs text-gray-500">
                  Format: {formatAllowedFormats(activeDocument.allowed_formats)} | 
                  Maksimal: {formatMaxFileSize(activeDocument.max_file_size)}
                </p>
              )}
            </div>

            {selectedFile && (
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-sm">
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-gray-500">{formatFileSize(selectedFile.size)}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {getDocumentStatus(activeDocument?.code || '') ? 'Update' : 'Upload'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>      {/* Dialog Preview */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Dokumen</DialogTitle>
            {previewDoc && (
              <DialogDescription>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Nama file:</span>
                    <span>{previewDoc.file_name}</span>
                    {getStatusBadge(previewDoc.status)}
                  </div>
                  {previewDoc.keterangan && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-gray-50 rounded-md border">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Keterangan:</span>
                        <span className="text-gray-700">{previewDoc.keterangan}</span>
                      </div>
                    </div>
                  )}
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-hidden border rounded-lg">
            {previewDoc && (
              isFilePDF(previewDoc.file_name) ? (
                <iframe 
                  src={previewDoc.file_path} 
                  className="w-full h-full" 
                  title="Document Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-50">
                  <img 
                    src={previewDoc.file_path} 
                    alt="Document Preview" 
                    className="object-contain max-w-full max-h-full"
                    onError={(e) => {
                      console.error('Image failed to load:', previewDoc.file_path);
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYWdhbCBtZW11YXQgZ2FtYmFyPC90ZXh0Pjwvc3ZnPg==';
                      target.classList.add('w-24', 'h-24');
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
            {previewDoc && (
              <Button 
                onClick={() => window.open(previewDoc.file_path, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileUp className="w-4 h-4 mr-1" />
                Buka di Tab Baru
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
