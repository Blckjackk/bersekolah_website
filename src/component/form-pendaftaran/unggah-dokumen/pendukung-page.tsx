// /app/form-pendaftaran/dokumen/pendukung/page.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { validateFile as utilValidateFile, formatFileSize as utilFormatFileSize } from "@/utils/file-validation"
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
  Download,
  ExternalLink
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// Media Sosial interface
interface MediaSosial {
  id: number;
  twibbon_link: string | null;
  instagram_link: string | null;
  link_grup_beasiswa: string | null;
  whatsapp_number: string | null;
  judul_essay: string | null;
  created_at: string;
  updated_at: string;
}

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]) // For multiple files (sertifikat prestasi)
  const [keterangan, setKeterangan] = useState("")
  const [uploading, setUploading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null)
  const [mediaSosial, setMediaSosial] = useState<MediaSosial | null>(null)
  const [isLoadingMediaSosial, setIsLoadingMediaSosial] = useState(false)
  const [lastUploadTime, setLastUploadTime] = useState(0)
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Check if document type supports multiple uploads
  const supportsMultipleUpload = (docTypeCode: string) => {
    return docTypeCode === 'sertifikat_prestasi' || docTypeCode === 'prestasi'
  }

  // Get files based on document type support
  const getSelectedFiles = () => {
    if (supportsMultipleUpload(selectedDocType)) {
      return selectedFiles
    }
    return selectedFile ? [selectedFile] : []
  }

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

  // Fetch media sosial data
  const fetchMediaSosial = async () => {
    setIsLoadingMediaSosial(true)
    try {
      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/media-sosial/latest`, {
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch media sosial data')
      }

      const data = await response.json()
      if (data.data) {
        setMediaSosial(data.data)
      }
    } catch (error) {
      console.error('Error fetching media sosial data:', error)
    } finally {
      setIsLoadingMediaSosial(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log('Starting to fetch data...')
        await Promise.all([
          fetchDocumentTypes(),
          fetchDocuments(),
          fetchMediaSosial()
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
      let processedDocTypes = (data.data || [])
        // Filter untuk hanya Essay dan Sertifikat Prestasi saja
        .filter((docType: any) => 
          docType.name === 'Essay' || 
          docType.name === 'Sertifikat Prestasi' || 
          docType.name === 'Essay Motivasi' ||
          docType.name === 'Prestasi' ||
          docType.code === 'essay' || 
          docType.code === 'sertifikat_prestasi' || 
          docType.code === 'essay_motivation' ||
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
          description: 'Sertifikat kejuaraan, penghargaan, atau prestasi lainnya. Jika memiliki beberapa sertifikat, harap digabungkan menjadi satu file PDF.',
          category: 'pendukung',
          is_required: false,
          allowed_formats: ['pdf'],
          max_file_size: 5 * 1024 * 1024, // 5MB // 5MB
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      // Find achievement certificate documents in the existing doc list
      const achievementCertificateType = processedDocTypes.find((dt: DocumentType) =>
        dt.code === 'achievement_certificate' || dt.code === 'sertifikat_prestasi'
      );      if (achievementCertificateType) {
        achievementCertificateType.description = 
          'Unggah file sertifikat prestasi Anda. Jika memiliki beberapa sertifikat, harap digabungkan menjadi satu file PDF (maksimal 5MB).';
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
      if (supportsMultipleUpload(selectedDocType)) {
        // For multiple upload (sertifikat prestasi), add all files
        const filesArray = Array.from(files)
        setSelectedFiles(prev => [...prev, ...filesArray])
      } else {
        // For single upload, just take the first file
        const file = files[0]
        setSelectedFile(file)
      }
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      if (supportsMultipleUpload(selectedDocType)) {
        // For multiple upload (sertifikat prestasi), add all files
        const filesArray = Array.from(files)
        setSelectedFiles(prev => [...prev, ...filesArray])
      } else {
        // For single upload, just take the first file
        const file = files[0]
        setSelectedFile(file)
      }
    }
  }

  // Remove file from multiple selection
  const removeFileFromSelection = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  // Handle document type change
  const handleDocTypeChange = (newDocType: string) => {
    setSelectedDocType(newDocType)
    // Reset file selections when document type changes
    setSelectedFile(null)
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    const filesToUpload = getSelectedFiles()
    
    if (filesToUpload.length === 0 || !selectedDocType) {
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
    
    // Check if already has an achievement certificate
    if (selectedDocType === 'achievement_certificate') {
      const achievementCount = uploadedDocs.filter(doc => 
        doc.document_type === 'achievement_certificate' || 
        doc.document_type_code === 'achievement_certificate'
      ).length;
      
      if (achievementCount >= 1) {
        toast({
          title: "Sertifikat Sudah Ada",
          description: "Anda sudah mengunggah sertifikat prestasi. Silakan hapus sertifikat yang sudah ada jika ingin mengunggah yang baru.",
          variant: "destructive",
        })
        return
      }
    }

    // Use our utility function for validation
    if (selectedDocTypeData) {
      const isValid = utilValidateFile(selectedFile, selectedDocTypeData, (title, description) => {
        toast({
          title,
          description,
          variant: "destructive",
        })
      });
      
      if (!isValid) return;
    }

    setUploading(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('Token autentikasi tidak ditemukan')
      
      // Upload files one by one to ensure each is saved as separate record
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)
        
        // Add keterangan with file index for multiple files
        if (keterangan.trim()) {
          const fileKeterangan = filesToUpload.length > 1 
            ? `${keterangan.trim()} (File ${index + 1})`
            : keterangan.trim()
          formData.append('keterangan', fileKeterangan)
        }
        
        formData.append('document_type', selectedDocType)
        
        // Also send document_type_id if we have it (more reliable than code)
        if (selectedDocTypeData?.id) {
          formData.append('document_type_id', selectedDocTypeData.id.toString())
        }
        
        // For pendukung documents, use the correct API pattern
        const uploadUrl = `${import.meta.env.PUBLIC_API_BASE_URL}/upload-document/${selectedDocType}`
        
        console.log(`Uploading file ${index + 1}/${filesToUpload.length}:`, file.name, 'to:', uploadUrl)

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
          throw new Error(errorData.message || `Upload failed for ${file.name}: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log(`Upload response for ${file.name}:`, result)
        return result
      })

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises)
      
      // Update last upload time
      setLastUploadTime(Date.now())

      const docTypeName = documentTypes.find(dt => dt.code === selectedDocType)?.name || 'Dokumen'
      const fileCount = filesToUpload.length
      
      toast({
        title: "Berhasil",
        description: `${fileCount} ${docTypeName} berhasil diunggah`,
      })
      
      // Close dialog and reset form
      setIsAddDialogOpen(false)
      setSelectedFile(null)
      setSelectedFiles([])
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

  const getStatusBadge = useCallback((status: string, keterangan?: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="text-white bg-green-600 border-green-600 shadow-sm hover:bg-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Terverifikasi
          </Badge>
        )
      case 'rejected':
        if (keterangan && keterangan.trim()) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="text-white transition-colors bg-red-600 border-red-600 shadow-sm cursor-pointer hover:bg-red-700">
                    <X className="w-3 h-3 mr-1" /> Ditolak
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Alasan Penolakan:</p>
                    <p className="text-sm">{keterangan}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        }
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

  // Get count of uploaded documents by type
  const getDocumentCountByType = useCallback((docTypeCode: string) => {
    return uploadedDocs.filter(doc => doc.document_type === docTypeCode).length
  }, [uploadedDocs])

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
    <div className="py-4 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-xl sm:text-2xl font-bold">Dokumen Pendukung</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Unggah dokumen pendukung untuk memperkuat pendaftaran beasiswa Anda
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Informasi Tambahan</AlertTitle>
        <AlertDescription className="text-blue-700">
          <p>
            Pada bagian dokumen pendukung ini, calon Beswan diminta untuk mengunggah:
          </p>
          <ol className="mt-2 ml-5 space-y-2 text-blue-700 list-decimal">
            <li>
              <span className="font-medium">Sertifikat Prestasi</span> - Maksimal 3 sertifikat prestasi terbaik yang digabungkan dalam satu file PDF
            </li>
            <li>
              <span className="font-medium">Essay</span> - {mediaSosial && mediaSosial.judul_essay ? (
                <>Buatlah essay dengan judul "<strong>{mediaSosial.judul_essay}</strong>"</>
              ) : (
                <>Buatlah essay motivasi yang menjelaskan mengapa Anda layak menerima beasiswa ini</>
              )}
            </li>
          </ol>
          <p className="mt-3 font-medium">
            <span className="text-blue-800">PENTING:</span> Dokumen yang lengkap dan berkualitas akan meningkatkan peluang Anda untuk mendapatkan beasiswa.
          </p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl">Dokumen Pendukung</CardTitle>
                <CardDescription className="text-sm">
                  Unggah dokumen pendukung untuk memperkuat pendaftaran beasiswa Anda
                  {uploadedDocs.length > 0 && (
                    <span className="block mt-1 text-sm">
                      Total dokumen terunggah: {uploadedDocs.length}
                      {getDocumentCountByType('sertifikat_prestasi') > 0 && (
                        <span className="ml-2 text-blue-600">
                          | Sertifikat Prestasi: {getDocumentCountByType('sertifikat_prestasi')}
                        </span>
                      )}
                    </span>
                  )}
                </CardDescription>
                {/* Show certificate info message */}
                {uploadedDocs.filter(doc => 
                  doc.document_type === 'achievement_certificate' || 
                  doc.document_type_code === 'achievement_certificate'
                ).length > 0 && (
                  <div className="mt-2 text-sm text-blue-600">
                    <span className="font-medium">
                      Sertifikat Prestasi telah diunggah
                    </span>
                  </div>
                )}
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
              <>
                {/* Helper note for certificate upload */}
                <div className="p-3 mb-4 border border-yellow-200 rounded-md bg-yellow-50">
                  <div className="flex items-center font-medium text-yellow-800">
                    <Info className="w-4 h-4 mr-2" /> 
                    <span>Panduan Unggah Sertifikat Prestasi</span>
                  </div>
                  <p className="mt-1 text-sm text-yellow-700">
                    Jika memiliki beberapa sertifikat prestasi, harap digabungkan menjadi satu file PDF (maks. 5MB)
                  </p>
                </div>

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
                <TableBody>
                  {/* Group documents by type for better organization */}
                  {(() => {
                    // Get achievement certificates
                    const achievementCerts = uploadedDocs.filter(doc => 
                      doc.document_type === 'achievement_certificate' || 
                      doc.document_type_code === 'achievement_certificate'
                    );
                    
                    // Get other documents
                    const otherDocs = uploadedDocs.filter(doc => 
                      doc.document_type !== 'achievement_certificate' && 
                      doc.document_type_code !== 'achievement_certificate'
                    );
                    
                    // First render achievement certificates with numbering if multiple
                    return [
                      ...achievementCerts.map((doc, index) => (
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
                            {typeof doc.status === 'string' ? getStatusBadge(doc.status, doc.keterangan) : ''}
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
                      )),
                      // Then render other documents
                      ...otherDocs.map((doc) => (
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
                            {typeof doc.status === 'string' ? getStatusBadge(doc.status, doc.keterangan) : ''}
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
                      ))
                    ];
                  })()}
                </TableBody>
              </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog Tambah Dokumen */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md max-w-[95vw] w-full mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg">Tambah Dokumen Pendukung</DialogTitle>
              <DialogDescription className="text-sm">
                Pilih jenis dokumen dan unggah file untuk memperkuat pendaftaran beasiswa
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-type" className="text-sm">Jenis Dokumen</Label>
                <Select value={selectedDocType} onValueChange={handleDocTypeChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih jenis dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => {
                      // Check if it's achievement certificate and already have one
                      const isAchievementCert = docType.code === 'achievement_certificate';
                      const achievementCount = uploadedDocs.filter(doc => 
                        doc.document_type === 'achievement_certificate' || 
                        doc.document_type_code === 'achievement_certificate'
                      ).length;
                      const isDisabled = isAchievementCert && achievementCount >= 1;
                      
                      return (
                        <SelectItem 
                          key={docType.code} 
                          value={docType.code}
                          disabled={isDisabled}
                        >
                          {docType.name}
                          {isAchievementCert && achievementCount > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Sudah diunggah)
                            </span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedDocTypeData && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedDocTypeData.description}
                    {selectedDocTypeData.code === 'achievement_certificate' && (
                      <span className="block mt-1 text-blue-600">
                        Jika memiliki beberapa sertifikat prestasi, harap digabungkan menjadi satu file PDF.
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="file">Pilih File</Label>
                <div className="relative mt-1">
                  <input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    multiple={supportsMultipleUpload(selectedDocType)}
                    accept={selectedDocTypeData?.allowed_formats?.map(f => `.${f}`).join(',') || ''}
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                      (selectedFile || selectedFiles.length > 0)
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {(selectedFile || selectedFiles.length > 0) ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {supportsMultipleUpload(selectedDocType) 
                            ? `${selectedFiles.length} file dipilih`
                            : selectedFile?.name
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Klik untuk pilih file</span> 
                          <span className="hidden sm:inline"> atau drag & drop</span>
                        </div>
                        {supportsMultipleUpload(selectedDocType) && (
                          <div className="text-xs text-blue-500">
                            Dapat memilih beberapa file sekaligus
                          </div>
                        )}
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

              {/* Show selected files list for multiple upload */}
              {supportsMultipleUpload(selectedDocType) && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>File yang dipilih:</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFileFromSelection(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
            
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setSelectedFile(null)
                  setSelectedFiles([])
                  setSelectedDocType("")
                  setKeterangan("")
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                disabled={uploading}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={uploading || (getSelectedFiles().length === 0) || !selectedDocType}
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Unggah {supportsMultipleUpload(selectedDocType) && selectedFiles.length > 0 
                      ? `(${selectedFiles.length} file)` 
                      : ''
                    }
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
                  {/* Check if it's a PDF */}
                  {isFilePDF(previewDoc.file_name, previewDoc.file_type) ? (
                    <div className="relative w-full h-full">
                      <iframe
                        src={previewDoc.file_path}
                        className="w-full h-full border-0 rounded-lg"
                        title={`Preview ${previewDoc.file_name}`}
                        onLoad={() => console.log('PDF iframe loaded successfully')}
                        onError={() => {
                          console.log('PDF iframe failed to load')
                          const fallback = document.getElementById('pdf-fallback')
                          if (fallback) {
                            fallback.classList.remove('hidden')
                            fallback.classList.add('flex')
                          }
                        }}
                      />
                      <div 
                        id="pdf-fallback" 
                        className="absolute inset-0 flex-col items-center justify-center hidden p-8 text-center bg-gray-50"
                      >
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">Preview PDF tidak dapat ditampilkan</h3>
                        <p className="mb-4 text-gray-500">File PDF tidak dapat ditampilkan dalam preview. Silakan buka di tab baru untuk melihat isi dokumen.</p>
                      </div>
                    </div>
                  ) : isFileImage(previewDoc.file_name, previewDoc.file_type) ? (
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
                            console.error('Image failed to load:', e)
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = document.createElement('div')
                            fallback.className = 'flex flex-col items-center justify-center w-full h-full p-8 text-center bg-gray-50'
                            fallback.innerHTML = `
                              <svg class="w-16 h-16 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <h3 class="text-lg font-medium text-gray-900 mb-2">Gambar tidak dapat ditampilkan</h3>
                              <p class="text-gray-500 mb-4">File gambar tidak dapat ditampilkan dalam preview. Silakan buka di tab baru untuk melihat gambar.</p>
                            `
                            target.parentNode?.appendChild(fallback)
                          }}
                          onClick={() => {
                            // Open in new tab for full size view
                            const cleanUrl = previewDoc.file_path.split('?')[0]
                            window.open(cleanUrl, '_blank')
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-gray-50">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mb-2 text-lg font-medium text-gray-900">Preview tidak tersedia</h3>
                      <p className="mb-4 text-gray-500">File ini tidak dapat ditampilkan dalam preview. Silakan buka di tab baru untuk melihat isi dokumen.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-4 shrink-0">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewDialog(false)}
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    if (previewDoc?.file_path) {
                      // Remove cache buster for cleaner URL when opening in new tab
                      const cleanUrl = previewDoc.file_path.split('?')[0]
                      window.open(cleanUrl, '_blank')
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Buka di Tab Baru
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}