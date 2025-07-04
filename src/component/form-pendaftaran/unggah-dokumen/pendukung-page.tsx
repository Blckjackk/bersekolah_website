// /app/form-pendaftaran/dokumen/pendukung/page.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { 
  FileUp, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Upload, 
  FileText, 
  Trash2, 
  Plus,
  Info,
  Loader2,
  X,
  Download
} from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if file is a PDF based on file extension or type
const isFilePDF = (fileName: string, fileType?: string): boolean => {
  if (!fileName && !fileType) return false;
  
  // Check file type if available
  if (fileType) {
    if (fileType.toLowerCase() === 'pdf' || 
        fileType.toLowerCase() === 'application/pdf' || 
        fileType.toLowerCase().includes('pdf')) {
      return true;
    }
  }
  
  // Check filename extension
  if (fileName) {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return true;
    }
    
    // Also check for "pdf" in the filename as a fallback
    if (fileName.toLowerCase().includes('pdf')) {
      return true;
    }
  }
  
  return false;
}

// Check if file is an image based on extension or type
const isFileImage = (fileName: string, fileType?: string): boolean => {
  if (!fileName && !fileType) return false;
  
  // Check file type if available
  if (fileType) {
    if (fileType.toLowerCase().includes('image/') || 
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext => fileType.toLowerCase().includes(ext))) {
      return true;
    }
  }
  
  // Check file extension
  if (fileName) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }
  
  return false;
}

// Define interfaces for type safety
interface DocumentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  allowed_formats: string[];
  max_file_size: number;
  category: string;
}

interface UploadedDocument {
  id: number;
  user_id?: number;
  document_type: string;
  document_type_id: number;
  document_type_name?: string;
  document_type_code?: string; // Add this property for compatibility
  file_path: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  status: string;
  keterangan?: string;
  verified_at?: string | null;
  verified_by?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function DokumenPendukungPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [previewDialog, setPreviewDialog] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [keterangan, setKeterangan] = useState("")
  const [uploading, setUploading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null)
  const [lastUploadTime, setLastUploadTime] = useState(0)
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Add upload cooldown check
  const checkUploadCooldown = () => {
    const now = Date.now()
    const timeSinceLastUpload = now - lastUploadTime
    const COOLDOWN_MS = 2000 // 2 seconds cooldown

    if (timeSinceLastUpload < COOLDOWN_MS) {
      toast({
        title: "Tunggu sebentar",
        description: "Mohon tunggu beberapa detik sebelum mengunggah dokumen lagi",
      })
      return false
    }
    return true
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log('Starting to fetch data...')
        await Promise.all([
          fetchDocumentTypes(),
          fetchDocuments()
        ])
        console.log('Data fetched successfully')
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch document types untuk kategori pendukung
  const fetchDocumentTypes = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) {
        throw new Error('Token autentikasi tidak ditemukan')
      }

      console.log('Fetching document types from:', `${import.meta.env.PUBLIC_API_BASE_URL}/document-types?category=pendukung`)
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/document-types?category=pendukung`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      console.log('Document types response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `Failed to fetch document types: ${response.status}`)
      }

      const data = await response.json()
      console.log('Document types raw data:', data)
      
      if (!data.data) {
        throw new Error('Invalid response format: missing data property')
      }
        // Process document types
      const processedDocTypes = (data.data || [])
        // Filter untuk hanya Essay dan Sertifikat Prestasi saja
        .filter((docType: any) => 
          docType.name === 'Essay' || 
          docType.name === 'Sertifikat Prestasi' || 
          docType.name === 'Essay Motivasi' ||
          docType.name === 'Prestasi' ||
          docType.code === 'essay' || 
          docType.code === 'sertifikat_prestasi' || 
          docType.code === 'essay_motivasi' ||
          docType.code === 'prestasi'
        )
        .map((docType: any) => ({
          ...docType,
          allowed_formats: typeof docType.allowed_formats === 'string' 
            ? JSON.parse(docType.allowed_formats) 
            : docType.allowed_formats || []
        }))
      
      // Jika tidak ada jenis dokumen dari API, buat default
      if (processedDocTypes.length === 0) {
        console.log('No document types found, using default types')
        processedDocTypes.push({
          id: 101,
          code: 'essay',
          name: 'Essay Motivasi',
          description: 'Essay yang menjelaskan motivasi, tujuan, dan harapan Anda',
          category: 'pendukung',
          is_required: false,
          allowed_formats: ['pdf', 'doc', 'docx'],
          max_file_size: 5 * 1024 * 1024, // 5MB
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        processedDocTypes.push({
          id: 102,
          code: 'sertifikat_prestasi',
          name: 'Sertifikat Prestasi',
          description: 'Sertifikat kejuaraan, penghargaan, atau prestasi lainnya',
          category: 'pendukung',
          is_required: false,
          allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
          max_file_size: 5 * 1024 * 1024, // 5MB
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      console.log('Processed document types:', processedDocTypes)
      setDocumentTypes(processedDocTypes)
    } catch (error) {
      console.error('Error in fetchDocumentTypes:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memuat jenis dokumen",
        variant: "destructive",
      })
      throw error // Re-throw to be caught by the main error handler
    }
  }
  // Fetch uploaded documents untuk kategori pendukung
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) {
        throw new Error('Token autentikasi tidak ditemukan')
      }

      // Add cache buster to avoid browser caching
      const cacheBuster = new Date().getTime()
      console.log(`Fetching pendukung documents with cache buster: ${cacheBuster}`)

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/my-documents?category=pendukung&nocache=${cacheBuster}`, {
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

      console.log('Documents response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `Failed to fetch documents: ${response.status}`)
      }      const data = await response.json()
      console.log('Pendukung documents raw data:', data)
        
      // API returns {message: '...', data: Array} format, not {success: true, data: Array}
      if (data.data && Array.isArray(data.data)) {
        // Process data before setting it - filter for pendukung document types (6-10)
        const processedDocs = data.data
          .filter((doc: any) => {
            // Get document type information - first try document_type object, then fallback to other properties
            const docTypeId = doc.document_type?.id || doc.document_type_id || 0;
            const docTypeCode = doc.document_type?.code || doc.document_type_code || doc.document_type || '';
            const docTypeCategory = doc.document_type?.category || '';            // Include documents that match either:
            // 1. Document type IDs 6+ (pendukung category documents)
            // 2. Document codes for pendukung documents
            // 3. Documents explicitly in pendukung category
            const isPendukungDoc = (
              // By ID (6+, which should be pendukung type documents)
              (docTypeId >= 6) ||
              // By code for pendukung documents
              ['achievement_certificate', 'recommendation_letter', 'essay_motivation', 'cv_resume', 'other_document'].includes(docTypeCode) ||
              // By explicit category
              (docTypeCategory === 'pendukung')
            );
            
            console.log(`Document ${doc.id}: TypeID=${docTypeId}, Code=${docTypeCode}, Category=${docTypeCategory}, IsPendukung=${isPendukungDoc}`)
            return isPendukungDoc;
          })
          .map((doc: any) => {
            // Enhanced document data extraction with nested properties support
            const docType = doc.document_type || {};
            
            const processedDoc = {
              id: doc.id || 0,
              user_id: doc.user_id || 0,
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
            
            console.log('Processed pendukung document:', processedDoc);
            return processedDoc;
          });
        
        console.log('Filtered and processed pendukung documents:', processedDocs);
        console.log(`Found ${processedDocs.length} pendukung documents uploaded by user`);
          // Update documents state
        setUploadedDocs(processedDocs)
        
        // Add a brief delay to ensure state is fully updated before forcing re-render
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Force re-render with updated counter
        setForceUpdateCounter(prevCounter => prevCounter + 1)
      } else {
        console.log('No pendukung documents found in response or unsuccessful response:', data);
        setUploadedDocs([])
      }
    } catch (error) {
      console.error('Error in fetchDocuments:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memuat data dokumen",
        variant: "destructive",
      })
      // Set empty array to prevent undefined errors
      setUploadedDocs([])
      throw error // Re-throw to be caught by the main error handler
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType) {
      toast({
        title: "Error",
        description: "Silakan pilih jenis dokumen dan file yang akan diunggah",
        variant: "destructive",
      })
      return
    }

    // Check upload cooldown
    if (!checkUploadCooldown()) {
      return
    }

    // Validate file size
    if (selectedDocTypeData && selectedFile.size > selectedDocTypeData.max_file_size) {
      toast({
        title: "Error",
        description: `Ukuran file melebihi batas maksimum (${formatFileSize(selectedDocTypeData.max_file_size)})`,
        variant: "destructive",
      })
      return
    }

    // Validate file format
    if (selectedDocTypeData?.allowed_formats) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (!fileExtension || !selectedDocTypeData.allowed_formats.includes(fileExtension)) {
        toast({
          title: "Error",
          description: `Format file tidak sesuai. Format yang diizinkan: ${selectedDocTypeData.allowed_formats.join(', ').toUpperCase()}`,
          variant: "destructive",
        })
        return
      }
    }

    setUploading(true)
    try {      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('Token autentikasi tidak ditemukan')
      
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (keterangan.trim()) {
        formData.append('keterangan', keterangan.trim())
      }
      formData.append('document_type', selectedDocType)
      
      // Also send document_type_id if we have it (more reliable than code)
      if (selectedDocTypeData?.id) {
        formData.append('document_type_id', selectedDocTypeData.id.toString())
      }      // For pendukung documents, use the correct API pattern
      // The backend expects: /upload-document/{documentCode}
      const uploadUrl = `${import.meta.env.PUBLIC_API_BASE_URL}/upload-document/${selectedDocType}`
      
      console.log('Attempting upload to:', uploadUrl)
      console.log('Document type:', selectedDocType)
      console.log('Document type data:', selectedDocTypeData)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }))
        throw new Error(errorData.message || `Upload failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Upload response:', result)

      // Update last upload time
      setLastUploadTime(Date.now())

      const docTypeName = documentTypes.find(dt => dt.code === selectedDocType)?.name || 'Dokumen'
      
      toast({
        title: "Berhasil",
        description: `${docTypeName} berhasil diunggah`,
      })      // Set last upload time for cooldown
      setLastUploadTime(Date.now())
      
      // Close dialog and reset form (better UX to do this before fetching)
      setIsAddDialogOpen(false)
      setSelectedFile(null)
      setSelectedDocType("")
      setKeterangan("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Add a small delay before refreshing to ensure the server has processed the upload
      await delay(500)
      
      // Refresh document list
      await fetchDocuments()

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengunggah dokumen",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: number) => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/documents/${documentId}`, {
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
        title: "Berhasil",
        description: "Dokumen berhasil dihapus",
      })

      // Refresh data
      await fetchDocuments()

    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus dokumen",
        variant: "destructive",
      })
    }
  }

  const handlePreview = (uploadedDoc: UploadedDocument) => {
    // Convert API file path to direct storage URL
    const baseUrl = import.meta.env.PUBLIC_API_BASE_URL_NO_API || 'http://localhost:8000';
    
    let directFileUrl = uploadedDoc.file_path;
    
    // Log untuk debug
    console.log('=== PREVIEW DEBUG INFO ===');
    console.log('Original file path:', uploadedDoc.file_path);
    console.log('Document file type:', uploadedDoc.file_type);
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
        console.log('Fallback path constructed:', directFileUrl);
      }
    } else {
      // Jika relatif path, gabungkan dengan base URL
      if (directFileUrl.startsWith('/storage/')) {
        directFileUrl = `${baseUrl}${directFileUrl}`;
      } else if (directFileUrl.startsWith('storage/')) {
        directFileUrl = `${baseUrl}/${directFileUrl}`;
      } else if (directFileUrl.startsWith('/')) {
        // Path starts with slash but not with /storage
        directFileUrl = `${baseUrl}${directFileUrl}`;
      } else {
        // Path tanpa /storage prefix dan tanpa slash awal
        directFileUrl = `${baseUrl}/storage/${directFileUrl}`;
      }
      console.log('Relative path converted to:', directFileUrl);
    }
    
    // Ensure URL is fully qualified and remove any double slashes (except after protocol)
    directFileUrl = directFileUrl.replace(/([^:]\/)\/+/g, '$1');
    
    // Test URL with fetch
    console.log('Testing URL accessibility with HEAD request...');
    fetch(directFileUrl, { method: 'HEAD' })
      .then(response => {
        console.log('URL test response:', response.status, response.statusText);
        if (!response.ok) {
          console.warn('URL might not be accessible:', directFileUrl);
        } else {
          console.log('URL is accessible:', directFileUrl);
        }
      })
      .catch(error => {
        console.error('Error testing URL:', error);
      });
    
    const docWithCorrectedPath = {
      ...uploadedDoc,
      file_path: directFileUrl
    };
    console.log('Final document for preview:', docWithCorrectedPath);
    
    // Add cache busting parameter
    const cacheBustingUrl = `${directFileUrl}${directFileUrl.includes('?') ? '&' : '?'}cacheBuster=${Date.now()}`;
    console.log('URL with cache buster:', cacheBustingUrl);
    
    // Update document with cache-busted URL
    docWithCorrectedPath.file_path = cacheBustingUrl;
    
    setPreviewDoc(docWithCorrectedPath);
    setPreviewDialog(true);
    
    // Auto-set fallback to visible after 3 seconds if it's a PDF
    if (docWithCorrectedPath.file_name?.toLowerCase().endsWith('.pdf') || 
        docWithCorrectedPath.file_type === 'pdf') {
      setTimeout(() => {
        const fallback = document.getElementById('pdf-fallback');
        if (fallback) {
          console.log('Setting PDF fallback visible as precaution');
          fallback.style.display = 'flex';
        }
      }, 3000);
    }
  }

  const getStatusBadge = useCallback((status: string) => {
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
            <AlertCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        )
    }
  }, [])
  const getDocumentTypeName = useCallback((code: string) => {
    if (!code) return '';
    try {
      return documentTypes.find(dt => dt.code === code)?.name || code;
    } catch (error) {
      console.error('Error in getDocumentTypeName:', error);
      return code;
    }
  }, [documentTypes])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const selectedDocTypeData = documentTypes.find(dt => dt.code === selectedDocType)

  if (isLoading) {
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Dokumen Pendukung</h1>
        <p className="text-gray-600">
          Unggah dokumen pendukung untuk memperkuat pendaftaran beasiswa Anda
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Tips Pendaftaran</AlertTitle>
        <AlertDescription className="text-blue-700">
          Dokumen pendukung dapat meningkatkan peluang Anda untuk mendapatkan beasiswa. 
          Unggah sertifikat prestasi, surat rekomendasi, essay motivasi, CV, atau dokumen lain yang relevan.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dokumen Pendukung</CardTitle>
                <CardDescription>
                  Unggah dokumen pendukung untuk memperkuat pendaftaran beasiswa Anda
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Dokumen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                <span className="ml-3 text-gray-500">Memuat data...</span>
              </div>
            ) : uploadedDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="w-12 h-12 mb-3 text-gray-400" />
                <h3 className="mb-1 text-lg font-medium text-gray-900">Belum ada dokumen</h3>
                <p className="max-w-sm text-gray-500">
                  Tambahkan dokumen pendukung untuk memperkuat pendaftaran beasiswa Anda
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Dokumen</TableHead>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Tanggal Upload</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>                  {uploadedDocs.map((doc) => (
                    <TableRow 
                      key={doc.id}
                      className={`${
                        doc.status === 'verified' ? 'bg-green-50/50 hover:bg-green-50/70' : 
                        doc.status === 'rejected' ? 'bg-red-50/50 hover:bg-red-50/70' :
                        doc.status === 'pending' ? 'bg-yellow-50/30 hover:bg-yellow-50/50' :
                        ''
                      }`}
                    >
                      <TableCell className="font-medium">
                        {typeof doc.document_type === 'string' ? getDocumentTypeName(doc.document_type) : ''}
                      </TableCell>
                      <TableCell>{doc.file_name || ''}</TableCell>
                      <TableCell>
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID') : ''}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof doc.status === 'string' ? getStatusBadge(doc.status) : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Only show delete button for documents that are not verified */}
                          {doc.status !== 'verified' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:text-red-700"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Tambah Dokumen */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Dokumen Pendukung</DialogTitle>
              <DialogDescription>
                Pilih jenis dokumen dan unggah file untuk memperkuat pendaftaran beasiswa
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-type">Jenis Dokumen</Label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih jenis dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType.code} value={docType.code}>
                        {docType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDocTypeData && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedDocTypeData.description}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="file">Pilih File</Label>
                <div className="mt-1 relative">
                  <input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    accept={selectedDocTypeData?.allowed_formats?.map(f => `.${f}`).join(',') || ''}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      selectedFile 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {selectedFile.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Klik untuk pilih file</span> atau drag & drop
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {selectedDocTypeData && (
                  <p className="mt-1 text-xs text-gray-500">
                    Format: {selectedDocTypeData.allowed_formats?.join(', ').toUpperCase() || 'Semua format'} | 
                    Maksimal: {formatFileSize(selectedDocTypeData.max_file_size)}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Berikan keterangan tentang dokumen ini..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                />
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
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setSelectedFile(null)
                  setSelectedDocType("")
                  setKeterangan("")
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                disabled={uploading}
              >
                Batal
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !selectedDocType}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Unggah
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>        {/* Dialog Preview Dokumen */}
        <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="pb-4 shrink-0">
              <DialogTitle>
                {previewDoc && getDocumentTypeName(previewDoc.document_type)}
              </DialogTitle>
              <DialogDescription>
                {previewDoc?.keterangan}
              </DialogDescription>
            </DialogHeader>
            
            {/* Preview Container */}
            <div className="flex-1 min-h-0 overflow-hidden border rounded-lg bg-gray-50">
              {previewDoc && (
                <div className="relative w-full h-full">
                  {/* Determinar se é um PDF ou imagem com base no nome do arquivo ou tipo */}
                  {(previewDoc.file_name?.toLowerCase().endsWith('.pdf') || previewDoc.file_type === 'pdf') ? (
                    <div className="relative w-full h-full">
                      <iframe
                        src={previewDoc.file_path}
                        className="w-full h-full border-0 rounded-lg"
                        title={`Preview ${previewDoc.file_name}`}
                        onLoad={() => console.log('PDF iframe loaded successfully')}
                      />
                      <div 
                        id="pdf-fallback" 
                        className="absolute inset-0 flex-col items-center justify-center p-8 text-center bg-gray-50 hidden"
                      >
                        <svg className="w-16 h-16 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview PDF tidak dapat ditampilkan</h3>
                        <p className="text-gray-500 mb-4">File PDF tidak dapat ditampilkan dalam preview. Silakan unduh untuk melihat isi dokumen.</p>
                        <a 
                          href={previewDoc.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          Unduh PDF
                        </a>
                      </div>
                    </div>
                  ) : ['jpg', 'jpeg', 'png', 'gif'].some(ext => previewDoc.file_name?.toLowerCase().endsWith(`.${ext}`)) || 
                    previewDoc.file_type?.includes('image') ? (
                    <div className="w-full h-full overflow-auto bg-white">
                      <div className="flex items-center justify-center min-h-full p-4">
                        <img 
                          src={previewDoc.file_path} 
                          alt="Document Preview" 
                          className="object-contain max-w-none max-h-none cursor-zoom-in"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            minWidth: 'auto',
                            minHeight: 'auto'
                          }}
                          onLoad={() => console.log('Image loaded successfully')}
                          onError={(e) => {
                            console.error('Image loading error:', e)
                            console.error('Failed URL:', previewDoc.file_path)
                            
                            // Show error message
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            
                            // Create error message with download link
                            const errorDiv = document.createElement('div')
                            errorDiv.className = 'flex flex-col items-center justify-center h-full text-gray-500'
                            errorDiv.innerHTML = `
                              <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                              </svg>
                              <p class="text-sm mb-4">Gagal memuat gambar</p>
                              <a 
                                href="${previewDoc.file_path}" 
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

                            // Try with cache-busting query param if not already tried
                            if (!target.src.includes('?nocache=')) {
                              console.log('Retrying image load with cache-busting...')
                              const cacheBuster = new Date().getTime()
                              const newSrc = `${previewDoc.file_path}?nocache=${cacheBuster}`
                              // Create a new image to try loading with cache busting
                              const newImg = document.createElement('img')
                              newImg.src = newSrc
                              newImg.style.display = 'none' // Hidden initially
                              newImg.onload = function() {
                                console.log('Image loaded with cache busting')
                                // If successful, replace the error div
                                if (errorDiv.parentElement) {
                                  errorDiv.remove()
                                  target.style.display = 'block'
                                  target.src = newSrc
                                }
                              }
                              // Add to DOM to initiate loading
                              document.body.appendChild(newImg)
                              setTimeout(() => newImg.remove(), 5000) // Cleanup
                            }
                          }}
                          onClick={(e) => {
                            // Zoom functionality - open in new tab for full size
                            window.open(previewDoc.file_path, '_blank')
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    // For other file types
                    <div className="flex flex-col items-center justify-center p-8 text-center min-h-full">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Preview tidak tersedia</h3>
                      <p className="text-gray-500 mb-4">Format file ini tidak dapat ditampilkan dalam preview. Silakan unduh untuk melihat isi dokumen.</p>
                      <a 
                        href={previewDoc.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Unduh File
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-4 shrink-0">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewDialog(false)}
                >
                  Tutup
                </Button>
                {previewDoc && (
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(previewDoc.file_path, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Unduh
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}