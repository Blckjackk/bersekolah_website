// /app/form-pendaftaran/dokumen/sosmed/page.tsx
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
  Instagram,
  ExternalLink,
  Download
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface MediaSosialLinks {
  id?: number;
  instagram_link: string;
  twibbon_link: string;
  created_at?: string;
  updated_at?: string;
}

interface UploadedDocument {
  id: number;
  document_type: string;
  document_type_id: number;
  document_type_name?: string;
  document_type_code?: string; // Add this property for compatibility
  file_path: string;
  file_name?: string;
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

export default function DokumenSosmedPage() {
  // Default links as fallback
  const defaultLinks: MediaSosialLinks = {
    instagram_link: "https://instagram.com/ber.sekolah",
    twibbon_link: "https://twibbon.com/bersekolah2025"
  }

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadDialog, setUploadDialog] = useState(false)
  const [previewDialog, setPreviewDialog] = useState(false)
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [keterangan, setKeterangan] = useState("")
  const [uploading, setUploading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null)
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0)
  // New state for social media links
  const [socialLinks, setSocialLinks] = useState<MediaSosialLinks>(defaultLinks)
  const [fetchingSocialLinks, setFetchingSocialLinks] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  // Fetch document types untuk kategori sosial_media
  const fetchDocumentTypes = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) return

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/document-types?category=sosial_media`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch document types')

      const data = await response.json()
      // Pastikan data disimpan ke state
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
  
  // Fetch social media links from API
  const fetchSocialMediaLinks = async () => {
    setFetchingSocialLinks(true)
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/media-sosial/latest`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        console.warn('Could not fetch social media links, using defaults')
        return
      }

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        const links = data.data
        // Only update if we actually have links
        if (links.instagram_link || links.twibbon_link) {
          setSocialLinks({
            instagram_link: links.instagram_link || defaultLinks.instagram_link,
            twibbon_link: links.twibbon_link || defaultLinks.twibbon_link,
            id: links.id,
            created_at: links.created_at,
            updated_at: links.updated_at
          })
          console.log('Social media links loaded:', links)
        }
      }
    } catch (error) {
      console.error('Error fetching social media links:', error)
      // Keep using default links (already set in state)
    } finally {
      setFetchingSocialLinks(false)
    }
  }
    // Fetch uploaded documents untuk kategori sosial_media SAJA
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) return

      // Add cache buster to avoid browser caching
      const cacheBuster = new Date().getTime()

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/my-documents?category=sosial_media&nocache=${cacheBuster}`, {
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
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      
      // Use robust API response handling - check for data.data instead of data.success
      if (data.data && Array.isArray(data.data)) {
        console.log('[SosmedPage] Raw API response:', data)
        
        // Process data before setting it - filter for sosial_media document types
        const processedDocs = data.data
          .filter((doc: any) => {
            // Get document type information - enhanced matching
            const docTypeId = doc.document_type?.id || doc.document_type_id || 0;
            const docTypeCode = doc.document_type?.code || doc.document_type_code || doc.document_type || '';
            const docTypeCategory = doc.document_type?.category || '';
            
            // Include documents that match either:
            // 1. Document type IDs 4-5 (sosial_media category documents) 
            // 2. Document codes for sosial_media documents
            // 3. Documents explicitly in sosial_media category
            const isSosmedDoc = (
              // By ID (4-5, which are sosial_media type documents)
              (docTypeId >= 4 && docTypeId <= 5) ||
              // By code for sosial_media documents
              ['instagram_follow', 'twibbon_post'].includes(docTypeCode) ||
              // By explicit category
              (docTypeCategory === 'sosial_media')
            );
            
            console.log(`[SosmedPage] Document ${doc.id}: typeId=${docTypeId}, code=${docTypeCode}, category=${docTypeCategory}, isSosmed=${isSosmedDoc}`)
            return isSosmedDoc;
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
            
            console.log(`[SosmedPage] Processed doc: id=${processedDoc.id}, type=${processedDoc.document_type}, code=${processedDoc.document_type_code}`)
            return processedDoc;
          });
          
        console.log(`[SosmedPage] Total processed sosmed docs: ${processedDocs.length}`)
          
        // Update documents state
        setUploadedDocs(processedDocs)
        
        // REMOVED: No more delay or forceUpdateCounter increment here
        // This was causing the infinite loop!
      } else {
        console.log('[SosmedPage] No data found in API response or data is not an array')
        setUploadedDocs([])
      }
    } catch (error) {
      console.error('Error fetching sosmed documents:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data dokumen",
        variant: "destructive",
      })
      // Set empty array to prevent undefined errors
      setUploadedDocs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadClick = (docType: DocumentType) => {
    setActiveDocument(docType)
    setSelectedFile(null)
    setKeterangan("")
    setUploadDialog(true)
    // Reset file input when opening dialog
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }
  const handleUpload = async () => {
    if (!selectedFile || !activeDocument) return

    setUploading(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const formData = new FormData()
      formData.append('file', selectedFile)
      if (keterangan.trim()) {
        formData.append('keterangan', keterangan.trim())
      }      // Map document code ke endpoint
      const endpointMap: { [key: string]: string } = {
        'instagram_follow': '/upload-bukti-follow',
        'twibbon_post': '/upload-twibon'
      }
      
      const endpoint = endpointMap[activeDocument.code]
      if (!endpoint) throw new Error('Unknown document type')
      
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
      
      const result = await response.json()
      
      toast({
        title: "Berhasil",
        description: `${activeDocument.name} berhasil diunggah`,
      })

      // Refresh data dengan force update - only calling fetchDocuments once
      await fetchDocuments()
      
      // Force UI update ONCE after upload completes
      // This is intentional and needed to trigger a refresh with the new document
      setForceUpdateCounter(prev => prev + 1)
      
      // Close dialog
      setUploadDialog(false)
      setSelectedFile(null)
      setKeterangan("")

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

  const getStatusBadge = (status: string) => {
    switch (status) {      case 'verified':
        return <Badge className="text-green-800 bg-green-100 hover:bg-green-100">Terverifikasi</Badge>
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Menunggu</Badge>
    }
  }
  
  const getUploadedDoc = (docType: string) => {
    // Make sure we have uploadedDocs before attempting to find
    if (!uploadedDocs || !Array.isArray(uploadedDocs) || uploadedDocs.length === 0) {
      console.log(`[SosmedPage] getUploadedDoc(${docType}): No uploaded docs available`)
      return undefined;
    }
    
    console.log(`[SosmedPage] getUploadedDoc(${docType}): Searching in ${uploadedDocs.length} docs`)
    
    // Find document by type code - check multiple possible properties with robust matching
    const foundDoc = uploadedDocs.find(doc => {
      if (!doc) {
        console.log(`[SosmedPage] getUploadedDoc(${docType}): Skipping null/undefined doc`)
        return false;
      }
      
      // Get document type identifiers
      const docTypeCode = doc.document_type || doc.document_type_code || '';
      const docTypeId = doc.document_type_id || 0;
      
      // Try different ways to match document type code
      const codeMatch = docTypeCode.toLowerCase() === docType.toLowerCase();
      
      // Additional matching by ID for sosmed documents (instagram_follow=4, twibbon_post=5)
      let idMatch = false;
      if (docType === 'instagram_follow' && docTypeId === 4) idMatch = true;
      if (docType === 'twibbon_post' && docTypeId === 5) idMatch = true;
      
      const match = codeMatch || idMatch;
      
      console.log(`[SosmedPage] getUploadedDoc(${docType}): Doc ${doc.id} - code: ${docTypeCode}, id: ${docTypeId}, codeMatch: ${codeMatch}, idMatch: ${idMatch}, finalMatch: ${match}`)
      
      return match;
    });
    
    if (foundDoc) {
      console.log(`[SosmedPage] getUploadedDoc(${docType}): Found doc ${foundDoc.id}`)
    } else {
      console.log(`[SosmedPage] getUploadedDoc(${docType}): No document found`)
    }
    
    return foundDoc;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchDocumentTypes(),
          fetchDocuments(),
          fetchSocialMediaLinks()
        ])
      } finally {
        setIsLoading(false)
      }
    }
    
    // Only run on initial mount and when explicitly triggered by forceUpdateCounter
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdateCounter])
    // Set page title once on mount
  useEffect(() => {
    document.title = "Unggah Dokumen Sosial Media | Bersekolah"
  }, [])

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
        <h1 className="mb-2 text-2xl font-bold">Dokumen Sosial Media</h1>
        <p className="text-gray-600">
          Unggah bukti follow Instagram dan postingan twibbon untuk melengkapi syarat beasiswa.
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Instagram className="w-4 h-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Petunjuk Sosial Media</AlertTitle>
        <AlertDescription className="text-blue-700">
          <div className="space-y-2">            <p>1. Follow akun Instagram resmi Bersekolah</p>
            <p>2. Posting twibbon beasiswa di feed Instagram Anda</p>
            <p>3. Screenshot bukti follow dan postingan sebagai dokumen</p>
          </div>          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200" asChild>
              <a href={socialLinks.instagram_link} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4 mr-1" />
                Follow Instagram
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200" asChild>
              <a href={socialLinks.twibbon_link} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-1" />
                Ambil Twibbon
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Document Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {documentTypes.map((docType) => {
          const uploadedDoc = getUploadedDoc(docType.code)
          const isUploaded = !!uploadedDoc

          return (
            <Card key={docType.id} className={`transition-all duration-200 ${isUploaded ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {docType.code === 'instagram_follow' && <Instagram className="w-5 h-5 text-pink-500" />}
                      {docType.code === 'twibbon_post' && <FileText className="w-5 h-5 text-blue-500" />}
                      {docType.name}
                      {docType.is_required && <span className="text-sm text-red-500">*</span>}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {docType.description}
                    </CardDescription>
                  </div>
                  {isUploaded && (
                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 mt-1 text-green-600" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Format & Size Info */}
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>Format: {docType.allowed_formats.join(', ').toUpperCase()}</div>
                    <div>Maksimal: {formatFileSize(docType.max_file_size)}</div>
                  </div>

                  {/* Upload Status */}
                  {isUploaded ? (
                    <div className="p-3 bg-white border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{uploadedDoc.file_name}</span>
                        {getStatusBadge(uploadedDoc.status)}
                      </div>
                      <div className="mb-3 text-xs text-gray-500">
                        Diunggah: {new Date(uploadedDoc.created_at).toLocaleDateString('id-ID')}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePreview(uploadedDoc)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUploadClick(docType)}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Ganti
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleUploadClick(docType)}
                      className="w-full"
                      variant="outline"
                    >
                      <FileUp className="w-4 h-4 mr-2" />
                      Unggah {docType.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Summary - HITUNG PROGRESS YANG BENAR */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Progress Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {uploadedDocs.length} dari {documentTypes.length} dokumen sosial media telah diunggah
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 overflow-hidden bg-gray-200 rounded-full">
                <div 
                  className="h-full transition-all duration-300 bg-green-500" 
                  style={{ 
                    width: documentTypes.length > 0 
                      ? `${Math.min((uploadedDocs.length / documentTypes.length) * 100, 100)}%` 
                      : '0%' 
                  }}
                />
              </div>
              <span className="text-sm font-medium">
                {documentTypes.length > 0 
                  ? Math.min(Math.round((uploadedDocs.length / documentTypes.length) * 100), 100)
                  : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Upload */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unggah {activeDocument?.name}</DialogTitle>
            <DialogDescription>
              {activeDocument?.description}
            </DialogDescription>
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
                  Format: {activeDocument.allowed_formats.join(', ').toUpperCase()} | 
                  Maksimal: {formatFileSize(activeDocument.max_file_size)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
              <Textarea
                id="keterangan"
                placeholder="Tambahkan keterangan jika diperlukan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="mt-1"
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
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
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
      </Dialog>      {/* Dialog Preview Dokumen */}
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
          
          {/* Preview Container */}
          <div className="flex-1 min-h-0 overflow-hidden border rounded-lg bg-gray-50">
            {previewDoc && (
              <div className="relative w-full h-full">                {/* Determinar se é um PDF ou imagem com base no nome do arquivo ou tipo */}
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
                  </div>                ) : ['jpg', 'jpeg', 'png', 'gif'].some(ext => previewDoc.file_name?.toLowerCase().endsWith(`.${ext}`)) || 
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
                
                {/* Loading indicator - START HIDDEN */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm" 
                  id={`loading-${previewDoc.id}`}
                  style={{ display: 'flex' }} // Show initially
                >
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium">Memuat dokumen...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer dengan info tambahan */}
          <div className="pt-4 space-y-4 border-t shrink-0">
            {/* Document Info */}
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
              {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {/* Close button */}
              <Button 
                variant="outline" 
                onClick={() => setPreviewDialog(false)}
                className="w-full sm:w-auto"
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                Tutup
              </Button>
              
              {previewDoc && (
                <Button 
                  variant="default"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  size="sm"
                  onClick={() => window.open(previewDoc.file_path, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh File
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}