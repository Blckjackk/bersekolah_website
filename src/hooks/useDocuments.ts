import { useState, useEffect, useCallback } from 'react'
import type { DocumentType, UploadedDocument, DocCategory, DocType } from '@/component/form-pendaftaran/unggah-dokumen/types'

export function useDocuments(category: DocCategory) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [docTypes, setDocTypes] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDocTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) return

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/document-types?category=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch document types')

      const data = await response.json()
      const docTypes = data.data || []
      
      // Parse JSON strings untuk allowed_formats jika perlu
      const processedDocTypes = docTypes.map((docType: any) => ({
        ...docType,
        allowed_formats: typeof docType.allowed_formats === 'string' 
          ? JSON.parse(docType.allowed_formats) 
          : docType.allowed_formats || []
      }))
      
      setDocTypes(processedDocTypes)
    } catch (error) {
      console.error('Error fetching doc types:', error)
    }
  }, [category])

  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) return

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/my-documents?category=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      let docs = data.data || []

      // Filter untuk sosmed jika diperlukan
      if (category === 'sosmed') {
        docs = docs.filter((doc: UploadedDocument) => 
          doc.document_type === 'instagram_follow' || 
          doc.document_type === 'twibbon_post'
        )
      }

      setDocuments(docs)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
  }, [category])

  const uploadDocument = useCallback(async (docType: DocType, file: File, keterangan?: string) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const formData = new FormData()
      formData.append('file', file)
      if (keterangan?.trim()) {
        formData.append('keterangan', keterangan.trim())
      }

      // Map document type ke endpoint yang sesuai
      const endpointMap: Record<DocType, string> = {
        'instagram_follow': '/upload-bukti-follow',
        'twibbon_post': '/upload-twibon',
        'student_proof': '/upload-bukti-status-siswa',
        'identity_proof': '/upload-identitas-diri',
        'photo': '/upload-foto-diri',
        'achievement_certificate': '/upload-sertifikat-prestasi',
        'recommendation_letter': '/upload-surat-rekomendasi',
        'essay_motivation': '/upload-essay-motivasi',
        'cv_resume': '/upload-cv-resume',
        'other_document': '/upload-dokumen-lainnya',
        'kartu_pelajar': '/upload-kartu-pelajar',
        'rapor': '/upload-rapor',
        'surat_pernyataan': '/upload-surat-pernyataan'
      }

      const endpoint = endpointMap[docType] || `/upload-document/${docType}`

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      console.log('Upload response:', result)

      // Update documents state dengan dokumen baru
      setDocuments(prev => {
        const newDoc: UploadedDocument = {
          id: result.data.id,
          document_type: docType,
          file_path: result.data.file_path,
          file_name: file.name,
          status: 'pending',
          created_at: new Date().toISOString()
        }
        
        const existingIndex = prev.findIndex(doc => doc.document_type === docType)
        if (existingIndex >= 0) {
          // Replace existing document
          return prev.map((doc, index) => 
            index === existingIndex ? newDoc : doc
          )
        }
        // Add new document
        return [...prev, newDoc]
      })

      return result.data
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh data when component mounts
  useEffect(() => {
    fetchDocTypes()
    fetchDocuments()
  }, [fetchDocTypes, fetchDocuments])

  return {
    documents,
    docTypes,
    isLoading,
    uploadDocument,
    refreshDocuments: fetchDocuments
  }
}