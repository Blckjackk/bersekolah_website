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

export default function DokumenWajibPage() {  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
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
  }}

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
      console.log('Document types response:', data)
      setDocumentTypes(data.data || [])
    } catch (error) {
      console.error('Error fetching document types:', error)
      toast({
        title: "Error",
        description: "Gagal memuat jenis dokumen",
        variant: "destructive",      })
    }
  }  
    // Fetch uploaded documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) return

      // Add cache buster to avoid browser caching
      const cacheBuster = new Date().getTime()
      console.log(`Fetching documents with cache buster: ${cacheBuster}`)
      
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
      }      const data = await response.json()
      console.log('🔍 === DETAILED API RESPONSE ANALYSIS ===')
      console.log('Full API response:', data)
      console.log('Response type:', typeof data)
      console.log('Has data property:', 'data' in data)
      console.log('data property type:', typeof data.data)
      console.log('data property value:', data.data)
      console.log('Is data.data an array:', Array.isArray(data.data))
      
      // ✅ FIXED: Laravel API may not have 'success' field, check for data directly
      if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Found ${data.data.length} documents in API response`)
        
        // Log each document in the response for debugging
        data.data.forEach((doc: any, index: number) => {
          console.log(`📄 Document ${index + 1}:`, doc)
          console.log(`  - ID: ${doc.id}`)
          console.log(`  - Document Type Object:`, doc.document_type)
          console.log(`  - Document Type Code:`, doc.document_type?.code || doc.document_type_code || doc.document_type)
          console.log(`  - File Name:`, doc.file_name)
          console.log(`  - Status:`, doc.status)
        })
          // Process data before setting it - filter for wajib document types (1-3)
        const processedDocs = data.data
          .filter((doc: any) => {
            console.log(`📄 Processing document from API:`, doc)
            
            // Get document type information with more robust fallbacks
            const docTypeId = doc.document_type?.id || doc.document_type_id || 0;
            const docTypeCode = doc.document_type?.code || doc.document_type_code || doc.document_type || '';
            const docTypeCategory = doc.document_type?.category || '';
            
            // ✅ SIMPLIFIED: More flexible filtering - accept any document that looks like wajib
            const isWajibDoc = (
              // By ID (1-3, which are wajib type documents)
              (docTypeId >= 1 && docTypeId <= 3) ||
              // By code for wajib documents
              ['student_proof', 'identity_proof', 'photo'].includes(docTypeCode) ||
              // By explicit category
              (docTypeCategory === 'wajib') ||
              // ✅ ADDED: If no clear classification, include all docs with ID 1-3 or common wajib codes
              (doc.id && docTypeCode && ['student_proof', 'identity_proof', 'photo'].some(code => 
                docTypeCode.toLowerCase().includes(code.toLowerCase())
              ))
            );
            
            console.log(`📋 Document ${doc.id}: TypeID=${docTypeId}, Code="${docTypeCode}", Category="${docTypeCategory}", IsWajib=${isWajibDoc}`)
            
            // ✅ TEMPORARY: If we can't determine, include the document and let user see it
            if (!isWajibDoc && doc.id) {
              console.log(`⚠️  Including document ${doc.id} because it exists and we want to see it`)
              return true  // Temporarily include all documents for debugging
            }
            
            return isWajibDoc;
          }).map((doc: any) => {
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
            
            console.log('Processed document:', processedDoc);
            return processedDoc;
          });
        
        console.log('Filtered and processed wajib documents:', processedDocs);
        console.log(`Found ${processedDocs.length} wajib documents uploaded by user`);
        
        // Update documents state
        setUploadedDocs(processedDocs)
        
        // Add a brief delay to ensure state is fully updated before forcing re-render
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Force re-render with updated counter
        setForceUpdateCounter(prevCounter => {
          const newCounter = prevCounter + 1
          console.log(`Document state updated, UI refresh triggered with counter: ${newCounter}`)
          return newCounter
        })      } else {
        console.log('❌ No documents found in response or invalid data structure:', data);
        console.log('Expected: data.data should be an array, got:', typeof data.data, data.data);
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
      console.log(`No uploaded docs available for search. Current state:`, uploadedDocs);
      return undefined;
    }
    
    console.log(`=== Searching for document with code: "${docCode}" ===`);
    console.log(`Total uploaded docs to search through: ${uploadedDocs.length}`);
    
    // Find document by type code - check multiple possible properties
    const foundDoc = uploadedDocs.find(doc => {
      if (!doc) return false;
      
      // Try different ways to match document type code
      const docTypeCode = doc.document_type || doc.document_type_code || '';
      const match = docTypeCode.toLowerCase() === docCode.toLowerCase();
      
      console.log(`  Checking doc ID ${doc.id}: type="${docTypeCode}", matches="${match}"`);
      return match;
    });
    
    // Enhanced logging for debugging
    if (foundDoc) {
      console.log(`✅ Found document: ID=${foundDoc.id}, Type=${foundDoc.document_type}, Status=${foundDoc.status}, File=${foundDoc.file_name}`);
    } else {
      console.log(`❌ No document found for type "${docCode}"`);
      console.log(`Available document types:`, uploadedDocs.map(doc => ({
        id: doc.id,
        type: doc.document_type || doc.document_type_code,
        status: doc.status
      })));
    }
    
    return foundDoc;
  }
    const getUploadedDocuments = () => {
    console.log("=== Generating document data mapping ===")
    console.log("Current uploaded docs state:", uploadedDocs)
    console.log("Current document types:", documentTypes)
    console.log("Force update counter:", forceUpdateCounter)
    
    if (!documentTypes || documentTypes.length === 0) {
      console.log("No document types available yet")
      return []
    }
      const mappedDocuments = documentTypes.map(docType => {
      const uploadedDoc = getDocumentStatus(docType.code)
      console.log(`=== Processing Document Type: ${docType.name} (${docType.code}) ===`)
      console.log("Document type object:", docType)
      console.log("Found uploaded doc:", uploadedDoc)
      
      if (uploadedDoc) {
        console.log(`✅ FOUND uploaded document for ${docType.code}:`, {
          id: uploadedDoc.id,
          file_name: uploadedDoc.file_name,
          status: uploadedDoc.status,
          created_at: uploadedDoc.created_at
        })
      } else {
        console.log(`❌ NO uploaded document found for ${docType.code}`)
      }
      
      const mappedDoc = {
        ...docType,
        uploaded_doc: uploadedDoc,
        uploaded_at: uploadedDoc?.created_at ? new Date(uploadedDoc.created_at).toLocaleDateString('id-ID') : '-',
        // Generate a unique key that changes when any relevant property changes to force re-render
        key: `${docType.id}-${uploadedDoc?.id || 'none'}-${uploadedDoc?.status || 'none'}-${forceUpdateCounter}`
      }
      
      console.log("Final mapped document:", mappedDoc)
      return mappedDoc
    })
    
    console.log("=== Final mapped documents result ===")
    console.log("Total mapped documents:", mappedDocuments.length)
    mappedDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name} - Has uploaded doc: ${!!doc.uploaded_doc}`)
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
    if (file && activeDocument && validateFile(file, activeDocument)) {
      setSelectedFile(file)
      console.log('File selected:', file.name)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (activeDocument && validateFile(file, activeDocument)) {
        setSelectedFile(file)
        console.log('File dropped:', file.name)
      }
    }
  }

  // Click handler untuk file input
  const handleDropZoneClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click()
    }
  }  // Handler untuk upload file
  const handleUpload = async () => {
    if (!selectedFile || !activeDocument) {
      toast({
        title: "Error",
        description: "Silakan pilih file terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    
    // Add document_type_id to form data - this is important for proper backend document linking
    formData.append('document_type_id', activeDocument.id.toString())
    
    // Store document information before potential reset
    const documentCode = activeDocument.code
    const documentName = activeDocument.name
    const documentTypeId = activeDocument.id

    console.log(`Uploading document ${documentName} (ID: ${documentTypeId}, Code: ${documentCode})`)

    const token = localStorage.getItem('bersekolah_auth_token')
    if (!token) {
      toast({
        title: "Error",
        description: "Sesi anda telah berakhir. Silakan login kembali",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {      
      // For dynamic upload endpoint - prefer document code for explicit endpoint mapping
      const endpoint = getUploadEndpoint(documentCode)
      console.log('Uploading to:', `${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`)
      console.log('File being uploaded:', selectedFile.name, selectedFile.size)
      console.log('Document type ID:', documentTypeId)
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }
      
      // Close dialog immediately for better UX
      setUploadDialog(false)
        // Show success toast
      toast({
        title: "Berhasil",
        description: `${documentName} berhasil diunggah`,
        duration: 3000,
        variant: "default"
      })
          console.log('Document upload successful, updating UI...')
      
      // Reset form state
      setActiveDocument(null)
      setSelectedFile(null)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Clear existing uploaded docs before refresh to force clean state
      console.log('🔄 Clearing existing uploaded docs state before refresh...')
      setUploadedDocs([])
      
      // Add small delay before fetching to ensure backend has processed the upload
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh the document list from API
      console.log('🔄 Refreshing document data after upload...')
      await fetchData()
      
      // Force UI refresh
      setForceUpdateCounter(prev => {
        const newCounter = prev + 1
        console.log(`🎯 Post-upload UI refresh triggered with counter: ${newCounter}`)
        return newCounter
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error.message || "Gagal mengunggah dokumen. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadClick = (docType: DocumentType) => {
    setActiveDocument(docType)
    setSelectedFile(null)
    setUploadDialog(true)
    // Reset file input when opening dialog
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handler untuk menghapus dokumen
  const deleteDocument = async (documentId: number) => {
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

      // Show confirmation toast
      if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
        return
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete document')
      }

      toast({
        title: "Berhasil",
        description: "Dokumen berhasil dihapus",
      })

      // Refresh documents list
      await fetchData()
      
      // Force UI refresh
      setForceUpdateCounter(prev => prev + 1)
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus dokumen",
        variant: "destructive",
      })
    }
  }

  // Helper function to hide loading indicator
  const hideLoadingIndicator = (docId: number) => {
    const loadingEl = document.getElementById(`loading-${docId}`)
    if (loadingEl) {
      loadingEl.style.display = 'none'
    }
  }

  // Helper function to show loading indicator 
  const showLoadingIndicator = (docId: number) => {
    const loadingEl = document.getElementById(`loading-${docId}`)
    if (loadingEl) {
      loadingEl.style.display = 'flex'
    }
  }

  const handlePreview = (uploadedDoc: UploadedDocument) => {
    // Convert API file path to direct storage URL
    const baseUrl = import.meta.env.PUBLIC_API_BASE_URL_NO_API // http://127.0.0.1:8000
    
    let directFileUrl = uploadedDoc.file_path
    
    console.log('Original file path:', uploadedDoc.file_path)
    console.log('Base URL:', baseUrl)
    
    // Jika file_path adalah URL lengkap, gunakan apa adanya
    if (directFileUrl.startsWith('http')) {
      // URL sudah lengkap, tapi mungkin salah port/host
      // Replace host jika perlu
      const url = new URL(directFileUrl)
      if (url.host !== '127.0.0.1:8000') {
        directFileUrl = directFileUrl.replace(url.origin, baseUrl)
      }
    } else {
      // Jika relatif path, gabungkan dengan base URL
      if (directFileUrl.startsWith('/storage/')) {
        directFileUrl = `${baseUrl}${directFileUrl}`
      } else if (directFileUrl.startsWith('storage/')) {
        directFileUrl = `${baseUrl}/${directFileUrl}`
      } else {
        // Path tanpa /storage prefix
        directFileUrl = `${baseUrl}/storage/${directFileUrl}`
      }
    }
    
    console.log('Final file URL:', directFileUrl)
    
    const docWithCorrectedPath = {
      ...uploadedDoc,
      file_path: directFileUrl
    }
    
    setPreviewDoc(docWithCorrectedPath)
    setPreviewDialog(true)
    
    // Show loading indicator ketika dialog dibuka
    setTimeout(() => showLoadingIndicator(uploadedDoc.id), 100)
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
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat dokumen...</span>
          </div>
        </div>
      </div>
    )
  }
  const documentsData = getUploadedDocuments()
  const completedDocs = documentsData.filter(doc => doc.uploaded_doc?.status === 'verified').length
  const totalDocs = documentTypes.length

  // Add debugging for render
  console.log("=== RENDER DEBUG ===")
  console.log("Document types length:", documentTypes.length)
  console.log("Uploaded docs length:", uploadedDocs.length)
  console.log("Documents data length:", documentsData.length)
  console.log("Force update counter:", forceUpdateCounter)
  console.log("Is loading:", isLoading)
  
  // Debug each document data
  documentsData.forEach((doc, index) => {
    console.log(`Render Doc ${index + 1}: ${doc.name}`)
    console.log(`  - Has uploaded_doc: ${!!doc.uploaded_doc}`)
    console.log(`  - Uploaded doc details:`, doc.uploaded_doc)
  })

  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dokumen Wajib</h1>
        <p className="text-muted-foreground">
          Unggah dokumen-dokumen wajib untuk pendaftaran beasiswa
        </p>
      </div>      <div className="mb-6">
        <Alert className={completedDocs === totalDocs ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
          {completedDocs === totalDocs ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <Info className="w-4 h-4 text-blue-600" />
          )}
          <AlertTitle className={completedDocs === totalDocs ? "text-green-700" : "text-blue-700"}>
            {completedDocs === totalDocs ? "Semua Dokumen Terverifikasi" : "Informasi Penting"}
          </AlertTitle>
          <AlertDescription className={completedDocs === totalDocs ? "text-green-700" : "text-blue-700"}>
            {completedDocs === totalDocs ? (
              "Semua dokumen wajib telah diunggah dan terverifikasi. Anda dapat melanjutkan ke tahap selanjutnya."
            ) : (
              <>
                Semua dokumen wajib harus diunggah dan terverifikasi sebelum dapat melanjutkan ke tahap selanjutnya.
                <div className="mt-1 font-medium">
                  Progress saat ini: {completedDocs}/{totalDocs} dokumen terverifikasi.
                </div>
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Document Statistics */}      <div className="mb-6">
        <DocumentStats 
          total={totalDocs}
          notUploaded={totalDocs - documentsData.filter(doc => doc.uploaded_doc).length}
          pending={documentsData.filter(doc => doc.uploaded_doc?.status === 'pending').length} 
          verified={documentsData.filter(doc => doc.uploaded_doc?.status === 'verified').length} 
          rejected={documentsData.filter(doc => doc.uploaded_doc?.status === 'rejected').length} 
        />
      </div><Card>        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Dokumen Wajib</CardTitle>
              <CardDescription>
                Dokumen yang harus dilengkapi untuk pendaftaran beasiswa
              </CardDescription>
            </div>            <div className="flex flex-col items-end gap-2">
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
        </CardHeader>        <CardContent>
          {documentsData.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">Tidak ada dokumen</h3>
              <p className="text-gray-500">
                Belum ada jenis dokumen wajib yang tersedia. Silakan refresh halaman atau hubungi admin.
              </p>              <Button 
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
              <TableBody>{/* Warning: Adding a new key based on forceUpdateCounter to force re-render entire table each time */}
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
                  </TableCell>                  <TableCell className="text-muted-foreground">
                    <div>
                      {doc.uploaded_doc ? (
                        <>
                          <p>{doc.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${
                              doc.uploaded_doc.status === 'verified' ? 'border-green-200 bg-green-50 text-green-700' : 
                              doc.uploaded_doc.status === 'pending' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' : 
                              'border-red-200 bg-red-50 text-red-700'
                            }`}>
                              <FileText className="w-3 h-3 mr-1" />
                              {doc.uploaded_doc.file_name}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>{doc.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            <span className="font-medium text-gray-600">
                              Format: {formatAllowedFormats(doc.allowed_formats)} • 
                              Maks: {formatMaxFileSize(doc.max_file_size)}
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>                  <TableCell>                    {doc.uploaded_doc ? (
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {doc.uploaded_at}
                        </span>
                        
                        {doc.uploaded_doc.status === 'rejected' && (
                          <div className="mt-1">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              <span className="text-xs font-medium text-red-600">Perlu diunggah ulang</span>
                            </div>
                            
                            {doc.uploaded_doc.keterangan && (
                              <p className="mt-1 text-xs italic text-gray-600">
                                <span className="font-medium">Catatan: </span>
                                {doc.uploaded_doc.keterangan}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {doc.uploaded_doc.status === 'verified' && (
                          <div className="mt-1">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-medium text-green-600">Dokumen terverifikasi</span>
                            </div>
                            
                            {doc.uploaded_doc.verified_at && (
                              <p className="mt-1 text-xs text-gray-600">
                                Terverifikasi pada: {new Date(doc.uploaded_doc.verified_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        )}
                          {doc.uploaded_doc.status === 'pending' && (
                          <div className="mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-600">Menunggu verifikasi</span>
                            </div>                            <p className="mt-1 text-xs text-gray-600">
                              Diunggah pada: {new Date(doc.uploaded_doc.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'                              })}</p>
                          </div>
                        )}
                      </div>                    ) : (
                      <div className="flex flex-col">
                        <span className="flex items-center text-gray-400">
                          <Info className="w-3 h-3 mr-1" />
                          Belum diunggah
                        </span>
                        <span className="mt-1 text-xs text-blue-600">
                          Klik tombol unggah di samping untuk menambahkan dokumen
                        </span>
                      </div>
                    )}
                  </TableCell><TableCell className="text-center">
                    {doc.uploaded_doc ? (
                      getStatusBadge(doc.uploaded_doc.status)
                    ) : (                      <Badge variant="outline" className="gap-1 px-0 bg-transparent border-0">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5 text-gray-500" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-500">Belum Diunggah</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">                      {doc.uploaded_doc && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePreview(doc.uploaded_doc!)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Add delete button only if document is not verified */}
                          {doc.uploaded_doc.status !== 'verified' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => deleteDocument(doc.uploaded_doc!.id)}
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                      
                      <Button 
                        variant={!doc.uploaded_doc ? "default" : "outline"}
                        size="sm"
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
                </TableRow>              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>{/* Dialog Upload */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getDocumentStatus(activeDocument?.code || '') ? 'Update' : 'Upload'} {activeDocument?.name}
            </DialogTitle>
            <DialogDescription>
              {activeDocument?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {getDocumentStatus(activeDocument?.code || '') && (
              <Alert className="text-blue-800 border-blue-200 bg-blue-50">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertTitle className="text-blue-700">Dokumen Sudah Diunggah</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Anda akan menggantikan dokumen yang sudah ada. Status dokumen akan kembali menjadi 'Menunggu Verifikasi'.
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label htmlFor="document-file">Pilih File</Label>                <div 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDropZoneClick}
              >                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className={`w-8 h-8 mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="mb-1 text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="mb-2 text-sm text-gray-500">
                        {isDragOver 
                          ? "Lepaskan file di sini" 
                          : "Klik untuk mengunggah atau seret dan lepas file di sini"
                        }
                      </p>
                      {activeDocument && (
                        <p className="text-xs font-medium text-gray-500">
                          Format yang diterima: {formatAllowedFormats(activeDocument.allowed_formats)} 
                          <br />(Maks. {formatMaxFileSize(activeDocument.max_file_size)})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Input
                ref={fileInputRef}
                id="document-file"
                type="file"
                className="hidden"
                accept={activeDocument ? `.${activeDocument.allowed_formats.join(',.')}` : '.jpg,.jpeg,.png,.pdf'}
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialog(false)
                setSelectedFile(null)
                setActiveDocument(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Dokumen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Preview Dokumen - RESPONSIVE FOOTER FIX */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="pb-4 shrink-0">
            <DialogTitle className="text-lg sm:text-xl">Preview Dokumen</DialogTitle>
            <DialogDescription>
              {previewDoc && (
                <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                  <span className="font-medium">{documentTypes.find(d => d.code === previewDoc.document_type)?.name}</span>
                  <Badge variant="outline" className="self-start sm:self-auto">{previewDoc.file_name}</Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {/* Preview Container - DIPERBESAR */}
          <div className="flex-1 min-h-0 overflow-hidden border rounded-lg bg-gray-50">
            {previewDoc && (
              <div className="relative w-full h-full">
                {previewDoc.file_path.toLowerCase().endsWith('.pdf') ? (
                  // PDF Preview - FULL SIZE
                  <iframe 
                    src={previewDoc.file_path} 
                    className="w-full h-full border-0" 
                    title="PDF Preview"
                    onLoad={() => {
                      console.log('PDF loaded successfully')
                      // Hide loading indicator for PDF
                      if (previewDoc) hideLoadingIndicator(previewDoc.id)
                    }}
                    onError={(e) => {
                      console.error('PDF loading error:', e)
                      console.error('Failed URL:', previewDoc.file_path)
                      // Hide loading indicator even on error
                      if (previewDoc) hideLoadingIndicator(previewDoc.id)
                    }}
                  />
                ) : (
                  // Image Preview - IMPROVED LAYOUT
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
                        onLoad={(e) => {
                          console.log('Image loaded successfully')
                          const img = e.target as HTMLImageElement
                          console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight)
                          // Hide loading indicator
                          if (previewDoc) hideLoadingIndicator(previewDoc.id)
                        }}
                        onError={(e) => {
                          console.error('Image loading error:', e)
                          console.error('Failed URL:', previewDoc.file_path)
                          // Hide loading indicator even on error
                          if (previewDoc) hideLoadingIndicator(previewDoc.id)
                        }}
                        onClick={(e) => {
                          // Zoom functionality - open in new tab for full size
                          window.open(previewDoc.file_path, '_blank')
                        }}
                      />
                    </div>
                  </div>
                )}
                  {/* Loading indicator - IMPROVED */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm" 
                  id={`loading-${previewDoc.id}`}
                  style={{ display: 'flex' }}
                >
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium">Memuat dokumen...</span>
                  </div>
                </div>
                
                {/* Document status badge overlay */}
                {previewDoc.status && (
                  <div className="absolute z-10 top-4 right-4">
                    {previewDoc.status === 'verified' && (
                      <Badge className="text-white bg-green-600 border-green-600 shadow-md">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Terverifikasi
                      </Badge>
                    )}
                    {previewDoc.status === 'pending' && (
                      <Badge className="text-white bg-yellow-500 border-yellow-500 shadow-md">
                        <Clock className="w-3 h-3 mr-1" /> Menunggu Verifikasi
                      </Badge>
                    )}
                    {previewDoc.status === 'rejected' && (
                      <Badge className="text-white bg-red-600 border-red-600 shadow-md">
                        <X className="w-3 h-3 mr-1" /> Ditolak
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer dengan info tambahan - RESPONSIVE IMPROVED */}
          <div className="pt-4 space-y-4 border-t shrink-0">
            {/* Document Info - Mobile friendly */}
            {previewDoc && (
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">File:</span>
                  <span className="text-gray-600 truncate" title={previewDoc.file_name}>
                    {previewDoc.file_name}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Status:</span>
                  <div className="mt-1">
                    {getStatusBadge(previewDoc.status)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Diunggah:</span>
                  <span className="text-gray-600">
                    {new Date(previewDoc.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
            
            {/* Action Buttons - Responsive */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {/* Mobile: Stack buttons */}
              <div className="grid grid-cols-2 gap-2 sm:hidden">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (previewDoc) {
                      // Download file
                      const link = document.createElement('a')
                      link.href = previewDoc.file_path
                      link.download = previewDoc.file_name || 'document'
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Download
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (previewDoc) {
                      // Open in new tab for full screen view
                      window.open(previewDoc.file_path, '_blank')
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Tab Baru
                </Button>
              </div>
              
              {/* Desktop: Horizontal buttons */}
              <div className="hidden gap-2 sm:flex">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (previewDoc) {
                      // Download file
                      const link = document.createElement('a')
                      link.href = previewDoc.file_path
                      link.download = previewDoc.file_name || 'document'
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Download
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (previewDoc) {
                      // Open in new tab for full screen view
                      window.open(previewDoc.file_path, '_blank')
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Buka di Tab Baru
                </Button>
              </div>
              
              {/* Close button - Full width on mobile */}
              <Button 
                variant="outline" 
                onClick={() => setPreviewDialog(false)}
                className="w-full sm:w-auto"
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}