"use client"

import React, { useState, useEffect } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  CalendarClock,
  FileX,
  Loader2,
  X,
  Info,
  RefreshCw,
  ExternalLink,
  FileText,
  Users,
  MapPin,
  Upload,
  Instagram,
  Send,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DocumentStatus {
  name: string;
  status: "completed" | "incomplete" | "missing";
  verification_status?: "pending" | "verified" | "rejected";
  endpoint: string;
  required: boolean;
  icon: React.ReactNode;
  link?: string;
  count?: number;
  expectedCount?: number;
  verified_count?: number;
  pending_count?: number;
  rejected_count?: number;
}

interface SelectionStatus {
  status: "pending" | "lolos_berkas" | "lolos_wawancara" | "diterima" | "ditolak" | "tidak_lolos";
  submitted_at?: string;
  reviewed_at?: string;
  next_stage?: string;
  next_stage_date?: string;
  message: string;
  documents_status: DocumentStatus[];
  submission_progress: number;
  total_documents: number;
  completed_documents: number;
  required_documents: number;
  completed_required: number;
  can_finalize: boolean;
  finalized_at?: string;
}

export default function SeleksiBerkasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectionStatus, setSelectionStatus] = useState<SelectionStatus | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [finalizeDialog, setFinalizeDialog] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const { toast } = useToast()

  // Check status untuk setiap section dengan endpoint yang benar
  const checkDataStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        })
        return
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      
      // ✅ TAMBAHKAN: Cek status aplikasi beasiswa terlebih dahulu
      let applicationStatus = null
      try {
        console.log('Checking application status...')
        const appStatusResponse = await fetch(`${baseURL}/application-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        if (appStatusResponse.ok) {
          const appResult = await appStatusResponse.json()
          console.log('Application status response:', appResult)
          applicationStatus = appResult.data
        }
      } catch (error) {
        console.log('No application status found (this is normal for first-time users)')
      }
      
      // ✅ FIXED: Hanya ubah endpoint untuk dokumen saja
      const documentChecks: DocumentStatus[] = [
        {
          name: "Data Pribadi",
          status: "incomplete",
          endpoint: "/calon-beswan/pribadi",
          required: true,
          icon: <FileText className="w-4 h-4" />,
          link: "/form-pendaftaran/pendaftaran/data-pribadi"
        },
        {
          name: "Data Keluarga", 
          status: "incomplete",
          endpoint: "/calon-beswan/keluarga",
          required: true,
          icon: <Users className="w-4 h-4" />,
          link: "/form-pendaftaran/pendaftaran/data-keluarga"
        },
        {
          name: "Alamat & Kontak",
          status: "incomplete", 
          endpoint: "/calon-beswan/alamat",
          required: true,
          icon: <MapPin className="w-4 h-4" />,
          link: "/form-pendaftaran/pendaftaran/alamat"
        },
        {
          name: "Dokumen Wajib",
          status: "incomplete",
          endpoint: "/documents/my-documents", // ✅ FIXED: Gunakan endpoint yang ada
          required: true,
          icon: <Upload className="w-4 h-4" />,
          link: "/form-pendaftaran/dokumen/wajib",
          expectedCount: 3 // student_proof, identity_proof, photo
        },
        {
          name: "Bukti Sosial Media",
          status: "incomplete",
          endpoint: "/documents/my-documents", // ✅ FIXED: Gunakan endpoint yang ada
          required: true,
          icon: <Instagram className="w-4 h-4" />,
          link: "/form-pendaftaran/dokumen/sosmed",
          expectedCount: 2 // instagram_follow, twibbon_post
        },
        {
          name: "Dokumen Pendukung",
          status: "incomplete",
          endpoint: "/documents/my-documents", // ✅ FIXED: Gunakan endpoint yang ada
          required: false,
          icon: <FileCheck className="w-4 h-4" />,
          link: "/form-pendaftaran/dokumen/pendukung"
        }
      ]

      // Check setiap endpoint
      for (let doc of documentChecks) {
        try {
          console.log(`Checking ${doc.name} from ${baseURL}${doc.endpoint}`)
          
          const response = await fetch(`${baseURL}${doc.endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          })

          if (response.ok) {
            const result = await response.json()
            console.log(`${doc.name} response:`, result)
            
            // Check apakah ada data berdasarkan endpoint
            let hasData = false
            let dataCount = 0
            let verifiedCount = 0
            let pendingCount = 0
            let rejectedCount = 0
            
            if (doc.endpoint === "/calon-beswan/pribadi") {
              const userData = result.data?.user
              const beswanData = result.data?.beswan
              const sekolahData = result.data?.sekolah_beswan
              
              const userComplete = userData?.nama_lengkap && userData?.email
              const beswanComplete = beswanData?.nama_panggilan && 
                                     beswanData?.tempat_lahir && 
                                     beswanData?.tanggal_lahir && 
                                     beswanData?.jenis_kelamin && 
                                     beswanData?.agama
              const sekolahComplete = sekolahData?.asal_sekolah && 
                                      sekolahData?.daerah_sekolah
              
              let completionCount = 0
              const totalSections = 3
              
              if (userComplete) completionCount++
              if (beswanComplete) completionCount++
              if (sekolahComplete) completionCount++
              
              doc.count = completionCount
              doc.expectedCount = totalSections
              hasData = completionCount === totalSections
              
              // Data pribadi tidak perlu verifikasi, otomatis verified jika complete
              if (hasData) {
                doc.verification_status = "verified"
                doc.verified_count = 1
              }
              
            } else if (doc.endpoint === "/calon-beswan/keluarga") {
              hasData = result.data?.keluarga_beswan?.nama_ayah && result.data?.keluarga_beswan?.nama_ibu
              if (hasData) {
                doc.verification_status = "verified"
                doc.verified_count = 1
              }
              
            } else if (doc.endpoint === "/calon-beswan/alamat") {
              hasData = result.data?.alamat_beswan?.alamat && result.data?.alamat_beswan?.provinsi
              if (hasData) {
                doc.verification_status = "verified"
                doc.verified_count = 1
              }
              
            } else if (doc.endpoint === "/documents/my-documents") {
              // ✅ FIXED: Filter dokumen berdasarkan nama kategori
              const allDocuments = result.data || []
              let documents = allDocuments
              
              if (doc.name === "Dokumen Wajib") {
                // Filter untuk dokumen wajib: student_proof, identity_proof, photo
                documents = allDocuments.filter((d: any) => {
                  const docType = d.document_type?.code || d.document_type_code
                  return ['student_proof', 'identity_proof', 'photo'].includes(docType)
                })
              } else if (doc.name === "Bukti Sosial Media") {
                // Filter untuk sosial media: instagram_follow, twibbon_post
                documents = allDocuments.filter((d: any) => {
                  const docType = d.document_type?.code || d.document_type_code
                  return ['instagram_follow', 'twibbon_post'].includes(docType)
                })
              } else if (doc.name === "Dokumen Pendukung") {
                // Filter untuk dokumen pendukung: yang lainnya
                documents = allDocuments.filter((d: any) => {
                  const docType = d.document_type?.code || d.document_type_code
                  return !['student_proof', 'identity_proof', 'photo', 'instagram_follow', 'twibbon_post'].includes(docType)
                })
              }
              
              dataCount = documents.length
              
              verifiedCount = documents.filter((d: any) => d.status === 'verified').length
              pendingCount = documents.filter((d: any) => d.status === 'pending').length
              rejectedCount = documents.filter((d: any) => d.status === 'rejected').length
              
              // ✅ FIXED: Batasi count berdasarkan expectedCount untuk dokumen wajib
              if (doc.expectedCount) {
                // Untuk dokumen wajib, hanya tampilkan sesuai expectedCount
                const maxCount = doc.expectedCount
                doc.count = Math.min(dataCount, maxCount) // ✅ FIXED: Batasi doc.count juga
                doc.verified_count = Math.min(verifiedCount, maxCount)
                doc.pending_count = Math.min(pendingCount, maxCount)
                doc.rejected_count = Math.min(rejectedCount, maxCount)
                
                hasData = dataCount >= doc.expectedCount && verifiedCount >= doc.expectedCount
                
                if (verifiedCount >= doc.expectedCount) {
                  doc.verification_status = "verified"
                } else if (rejectedCount > 0) {
                  doc.verification_status = "rejected"
                } else if (pendingCount > 0) {
                  doc.verification_status = "pending"
                } else {
                  doc.verification_status = undefined
                }
              } else {
                // Untuk dokumen opsional, tampilkan semua
                doc.count = dataCount
                doc.verified_count = verifiedCount
                doc.pending_count = pendingCount
                doc.rejected_count = rejectedCount
                
                hasData = true
                if (verifiedCount > 0) {
                  doc.verification_status = "verified"
                } else if (pendingCount > 0) {
                  doc.verification_status = "pending"
                } else if (rejectedCount > 0) {
                  doc.verification_status = "rejected"
                } else {
                  doc.verification_status = "verified"
                }
              }
            }
            
            doc.status = hasData ? "completed" : "incomplete"
          } else {
            console.error(`Error checking ${doc.name}:`, response.status, response.statusText)
            doc.status = response.status === 404 ? "missing" : "incomplete"
          }
        } catch (error) {
          console.error(`Network error checking ${doc.name}:`, error)
          doc.status = "incomplete"
        }
      }

      const requiredDocs = documentChecks.filter(doc => doc.required)
      const completedRequiredDocs = requiredDocs.filter(doc => doc.status === "completed")
      const totalDocs = documentChecks.length
      const completedDocs = documentChecks.filter(doc => doc.status === "completed").length
      
      const requiredDocsVerified = requiredDocs.filter(doc => 
        doc.status === "completed" && 
        doc.verification_status === "verified"
      ).length
      
      const progress = Math.round((completedDocs / totalDocs) * 100)
      
      // ✅ FIXED: Cek apakah sudah ada aplikasi yang dikirim
      const hasAllRequiredDocuments = completedRequiredDocs.length === requiredDocs.length && 
                                      requiredDocsVerified === requiredDocs.length
      
      const canFinalize = hasAllRequiredDocuments && 
                         (!applicationStatus || !applicationStatus.finalized_at)

      let selectionStatusValue: "pending" | "lolos_berkas" | "lolos_wawancara" | "diterima" | "ditolak" | "tidak_lolos" = "pending"
      let message = ""
      let finalizedAt = applicationStatus?.finalized_at || null

      if (applicationStatus?.finalized_at) {
        selectionStatusValue = applicationStatus.status || "pending"
        
        switch (applicationStatus.status) {
          case "lolos_berkas":
            message = "Selamat! Anda lolos seleksi berkas. Silakan tunggu informasi selanjutnya untuk tahap wawancara."
            break
          case "lolos_wawancara":
            message = "Selamat! Anda lolos tahap wawancara. Silakan tunggu pengumuman hasil akhir."
            break
          case "diterima":
            message = "Selamat! Anda diterima sebagai penerima beasiswa. Tim kami akan menghubungi Anda segera."
            break
          case "ditolak":
            message = "Mohon maaf, aplikasi Anda belum berhasil pada periode ini. Tetap semangat dan coba lagi pada periode berikutnya!"
            break
          default:
            message = "Aplikasi beasiswa Anda telah dikirim dan sedang dalam proses review oleh tim kami. Hasil akan diumumkan melalui email."
        }
      } else if (canFinalize) {
        message = "Semua dokumen wajib telah lengkap dan terverifikasi! Anda dapat melakukan finalisasi berkas untuk mengirimkan aplikasi beasiswa."
      } else if (completedRequiredDocs.length === requiredDocs.length) {
        const pendingVerification = requiredDocs.filter(doc => 
          doc.verification_status === "pending"
        ).length
        const rejectedDocs = requiredDocs.filter(doc => 
          doc.verification_status === "rejected"
        ).length
        
        if (rejectedDocs > 0) {
          message = `Ada ${rejectedDocs} dokumen yang ditolak. Silakan perbaiki dan unggah ulang dokumen yang ditolak.`
        } else if (pendingVerification > 0) {
          message = `Semua dokumen wajib telah diunggah. ${pendingVerification} dokumen sedang dalam proses verifikasi oleh tim kami.`
        } else {
          message = "Semua dokumen telah diunggah, sedang menunggu verifikasi dari admin."
        }
      } else {
        const missingCount = requiredDocs.length - completedRequiredDocs.length
        message = `Masih ada ${missingCount} dokumen wajib yang belum lengkap. Silakan lengkapi terlebih dahulu.`
      }

      const statusData: SelectionStatus = {
        status: selectionStatusValue,
        submitted_at: completedRequiredDocs.length === requiredDocs.length ? new Date().toISOString() : undefined,
        message,
        documents_status: documentChecks,
        submission_progress: progress,
        total_documents: totalDocs,
        completed_documents: completedDocs,
        required_documents: requiredDocs.length,
        completed_required: completedRequiredDocs.length,
        can_finalize: canFinalize,
        finalized_at: finalizedAt
      }

      setSelectionStatus(statusData)
      setLastUpdated(new Date().toLocaleString('id-ID'))

      if (isRefresh) {
        toast({
          title: "Data Diperbarui",
          description: "Status berkas berhasil diperbarui dari server.",
        })
      }

    } catch (error) {
      console.error('Error checking data status:', error)
      toast({
        title: "Kesalahan Jaringan",
        description: "Terjadi kesalahan saat mengambil status berkas. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleFinalize = async () => {
    setIsFinalizing(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      console.log('Sending finalize request...')

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/finalize-application`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      const result = await response.json()
      console.log('Finalize response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Finalization failed')
      }

      toast({
        title: "Berkas Berhasil Dikirim!",
        description: "Aplikasi beasiswa Anda telah dikirim dan akan diproses oleh tim kami.",
      })

      setFinalizeDialog(false)

      // ✅ Refresh data setelah finalisasi
      setTimeout(() => {
        checkDataStatus(true)
      }, 1000)

    } catch (error) {
      console.error('Finalize error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengirim aplikasi beasiswa",
        variant: "destructive",
      })
    } finally {
      setIsFinalizing(false)
    }
  }

  useEffect(() => {
    checkDataStatus()
  }, [])

  const getStatusBadge = () => {
    if (!selectionStatus) return null

    if (selectionStatus.finalized_at) {
      switch (selectionStatus.status) {
        case "lolos_berkas":
          return (
            <Badge className="px-4 py-2 text-sm text-green-800 bg-green-100 hover:bg-green-100">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Lolos Seleksi Berkas
            </Badge>
          )
        case "lolos_wawancara":
          return (
            <Badge className="px-4 py-2 text-sm text-blue-800 bg-blue-100 hover:bg-blue-100">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Lolos Wawancara
            </Badge>
          )
        case "diterima":
          return (
            <Badge className="px-4 py-2 text-sm text-emerald-800 bg-emerald-100 hover:bg-emerald-100">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Diterima
            </Badge>
          )
        case "ditolak":
          return (
            <Badge variant="destructive" className="px-4 py-2 text-sm">
              <XCircle className="w-4 h-4 mr-2" />
              Tidak Lolos
            </Badge>
          )
        default:
          return (
            <Badge className="px-4 py-2 text-sm text-blue-800 bg-blue-100 hover:bg-blue-100">
              <Send className="w-4 h-4 mr-2" />
              Sedang Direview
            </Badge>
          )
      }
    }

    if (selectionStatus.can_finalize) {
      return (
        <Badge className="px-4 py-2 text-sm text-green-800 bg-green-100 hover:bg-green-100">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Siap Dikirim
        </Badge>
      )
    } else {
      const isComplete = selectionStatus.completed_required === selectionStatus.required_documents
      return (
        <Badge 
          variant="outline" 
          className={`px-4 py-2 text-sm ${isComplete ? 'text-yellow-800 bg-yellow-100 border-yellow-200' : 'text-gray-600 bg-gray-100 border-gray-200'}`}
        >
          <Clock className="w-4 h-4 mr-2" />
          {isComplete ? "Menunggu Verifikasi" : "Belum Lengkap"}
        </Badge>
      )
    }
  };

  const getDocumentBadge = (doc: DocumentStatus) => {
    if (selectionStatus?.finalized_at) {
      return doc.status === 'completed' ? (
        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Lengkap
        </Badge>
      ) : (
        <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
          <AlertCircle className="w-3 h-3 mr-1" /> Belum Lengkap
        </Badge>
      )
    }

    if (doc.status === 'completed') {
      if (doc.verification_status === 'verified') {
        return (
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            <CheckCircle2 className="w-3 h-3 mr-1" /> 
            Terverifikasi
          </Badge>
        )
      } else if (doc.verification_status === 'pending') {
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" /> 
            Menunggu Verifikasi
          </Badge>
        )
      } else if (doc.verification_status === 'rejected') {
        return (
          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
            <XCircle className="w-3 h-3 mr-1" /> 
            Ditolak
            {doc.rejected_count !== undefined && ` (${doc.rejected_count})`}
          </Badge>
        )
      } else {
        return (
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            <CheckCircle2 className="w-3 h-3 mr-1" /> 
            Lengkap
            {doc.count !== undefined && ` (${doc.count})`}
          </Badge>
        )
      }
    } else if (doc.status === 'missing') {
      return (
        <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
          <XCircle className="w-3 h-3 mr-1" /> Belum Ada Data
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
          <AlertCircle className="w-3 h-3 mr-1" /> 
          Belum Lengkap
          {doc.count !== undefined && doc.expectedCount && ` (${doc.count}/${doc.expectedCount})`}
          {doc.count !== undefined && !doc.expectedCount && ` (${doc.count})`}
        </Badge>
      )
    }
  }

  // Rest of your component remains the same...
  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold">Memuat Status Berkas...</h3>
              <p className="text-sm text-muted-foreground">Sedang mengecek kelengkapan data Anda</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectionStatus) {
    return (
      <div className="container py-6 mx-auto">
        <div className="max-w-md mx-auto text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Gagal Memuat Data</h2>
          <p className="mb-6 text-muted-foreground">
            Terjadi kesalahan saat mengambil status berkas. Silakan periksa koneksi internet Anda.
          </p>
          <Button onClick={() => checkDataStatus()} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Seleksi Berkas</h1>
        <p className="text-muted-foreground">
          Status dan hasil seleksi berkas pendaftaran beasiswa Anda
        </p>
        {lastUpdated && (
          <p className="mt-1 text-xs text-muted-foreground">
            Terakhir diperbarui: {lastUpdated}
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  Status Seleksi Berkas
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => checkDataStatus(true)}
                    disabled={isRefreshing}
                    className="ml-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectionStatus.finalized_at ? (
                    <>
                      Aplikasi dikirimkan pada: {" "}
                      <span className="font-medium">
                        {new Date(selectionStatus.finalized_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </>
                  ) : selectionStatus.submitted_at ? (
                    <>
                      Berkas dikirimkan pada: {" "}
                      <span className="font-medium">
                        {new Date(selectionStatus.submitted_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </>
                  ) : (
                    "Berkas belum lengkap untuk dikirimkan"
                  )}
                </CardDescription>
              </div>
              <div className="ml-4">
                {getStatusBadge()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 mb-4 rounded-lg bg-gray-50">
              <p className="text-sm">{selectionStatus.message}</p>
            </div>
            
            {/* Finalize Button */}
            {selectionStatus.can_finalize && !selectionStatus.finalized_at && (
              <div className="p-4 mb-4 border-2 border-green-200 rounded-lg bg-green-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="flex items-center mb-2 font-semibold text-green-800">
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Siap untuk Finalisasi
                    </h4>
                    <p className="mb-3 text-sm text-green-700">
                      Semua dokumen wajib telah lengkap dan terverifikasi. Klik tombol di bawah untuk mengirimkan aplikasi beasiswa Anda.
                    </p>
                    <Alert className="mb-3 bg-green-100 border-green-300">
                      <AlertTriangle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        <strong>Perhatian:</strong> Setelah aplikasi dikirim, Anda tidak dapat mengubah atau menambah dokumen lagi.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
                <Button 
                  onClick={() => setFinalizeDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Kirim Aplikasi Beasiswa
                </Button>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div>
                <h3 className="flex items-center mb-3 font-medium">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Status Kelengkapan Berkas
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progres Pengisian</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectionStatus.submission_progress}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={selectionStatus.submission_progress} className="h-3" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {selectionStatus.documents_status.map((doc, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      doc.status === 'completed' && doc.verification_status === 'verified' ? 'bg-green-50 border border-green-200' : 
                      doc.verification_status === 'rejected' ? 'bg-red-50 border border-red-200' :
                      doc.verification_status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                      doc.status === 'completed' ? 'bg-blue-50 border border-blue-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      {doc.icon}
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className={`text-sm ${doc.required ? 'font-medium' : ''}`}>
                            {doc.name}
                          </span>
                          {doc.required && (
                            <span className="ml-2 text-xs font-medium text-red-500">*wajib</span>
                          )}
                        </div>
                        
                        {doc.count !== undefined && doc.expectedCount && doc.name !== "Data Pribadi" && (
                          doc.verified_count !== undefined ? (
                            doc.rejected_count && doc.rejected_count > 0 ? (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Ditolak: {doc.rejected_count}
                              </div>
                            ) : null
                          ) : (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {Math.min(doc.count, doc.expectedCount)} dari {doc.expectedCount} dokumen
                            </div>
                          )
                        )}
                        
                        {!doc.required && doc.count !== undefined && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {doc.count === 0 ? "Tidak ada dokumen (opsional)" : 
                             `${doc.count} dokumen tersedia`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {getDocumentBadge(doc)}
                      {doc.link && (doc.status !== 'completed' || doc.verification_status === 'rejected') && !selectionStatus.finalized_at && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="p-0 h-7 w-7"
                          onClick={() => window.location.href = doc.link!}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Finalisasi */}
      <Dialog open={finalizeDialog} onOpenChange={setFinalizeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2 text-green-600" />
              Kirim Aplikasi Beasiswa
            </DialogTitle>
            <DialogDescription>
              Anda akan mengirimkan aplikasi beasiswa dengan semua dokumen yang telah diverifikasi.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <ShieldCheck className="w-4 h-4" />
              <AlertTitle>Konfirmasi Pengiriman</AlertTitle>
              <AlertDescription>
                Setelah aplikasi dikirim, Anda tidak dapat mengubah atau menambah dokumen lagi. 
                Pastikan semua informasi sudah benar.
              </AlertDescription>
            </Alert>
            
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm font-medium">Ringkasan Berkas:</p>
              <ul className="space-y-1 text-sm">
                {selectionStatus.documents_status
                  .filter(doc => doc.required && doc.verification_status === 'verified')
                  .map((doc, index) => (
                    <li key={index} className="flex items-center text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-2" />
                      {doc.name}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizeDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Aplikasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}