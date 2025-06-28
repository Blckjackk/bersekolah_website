"use client"

import React, { useState, useEffect } from "react"
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  Calendar,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Info,
  Loader2,
  RefreshCw
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface StageDetail {
  name: string
  status: "not_started" | "in_progress" | "completed"
  url: string
  verification_status?: "pending" | "verified" | "rejected"
}

interface Stage {
  id: string
  name: string
  status: "not_started" | "in_progress" | "completed"
  progress: number
  details: StageDetail[]
}

interface ApplicationProgress {
  overall_progress: number
  submission_deadline: string
  current_stage: string
  stages: Stage[]
  finalized_at?: string
  application_status?: string
}

export default function ProgresPage() {
  const [applicationProgress, setApplicationProgress] = useState<ApplicationProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const { toast } = useToast()

  // ✅ Fetch data real dari API
  const fetchProgressData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true)

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

      // ✅ Fetch application status
      let applicationStatus = null
      try {
        const appResponse = await fetch(`${baseURL}/application-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        if (appResponse.ok) {
          const appResult = await appResponse.json()
          applicationStatus = appResult.data
        }
      } catch (error) {
        console.log('No application status found')
      }

      // ✅ Fetch semua data yang diperlukan
      const [pribadiRes, keluargaRes, alamatRes, documentsRes] = await Promise.all([
        fetch(`${baseURL}/calon-beswan/pribadi`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${baseURL}/calon-beswan/keluarga`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${baseURL}/calon-beswan/alamat`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${baseURL}/documents/my-documents`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        })
      ])

      // ✅ Process responses
      const pribadiData = pribadiRes.ok ? await pribadiRes.json() : null
      const keluargaData = keluargaRes.ok ? await keluargaRes.json() : null
      const alamatData = alamatRes.ok ? await alamatRes.json() : null
      const documentsData = documentsRes.ok ? await documentsRes.json() : null

      // ✅ Calculate form completion
      const isFormComplete = (data: any, requiredFields: string[]) => {
        if (!data?.data) return false
        return requiredFields.every(field => {
          const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], data.data)
          return fieldValue && fieldValue.toString().trim() !== ''
        })
      }

      const pribadiComplete = isFormComplete(pribadiData, ['user.nama_lengkap', 'beswan.nama_panggilan', 'sekolah_beswan.asal_sekolah'])
      const keluargaComplete = isFormComplete(keluargaData, ['keluarga_beswan.nama_ayah', 'keluarga_beswan.nama_ibu'])
      const alamatComplete = isFormComplete(alamatData, ['alamat_beswan.alamat', 'alamat_beswan.provinsi'])

      // ✅ Calculate document completion
      const allDocs = documentsData?.data || []
      const wajibDocs = allDocs.filter((d: any) => ['student_proof', 'identity_proof', 'photo'].includes(d.document_type?.code || d.document_type_code))
      const sosmedDocs = allDocs.filter((d: any) => ['instagram_follow', 'twibbon_post'].includes(d.document_type?.code || d.document_type_code))
      const pendukungDocs = allDocs.filter((d: any) => !['student_proof', 'identity_proof', 'photo', 'instagram_follow', 'twibbon_post'].includes(d.document_type?.code || d.document_type_code))

      const wajibComplete = wajibDocs.length >= 3 && wajibDocs.filter((d: any) => d.status === 'verified').length >= 3
      const sosmedComplete = sosmedDocs.length >= 2 && sosmedDocs.filter((d: any) => d.status === 'verified').length >= 2
      const pendukungComplete = true // Optional

      // ✅ Build dynamic stages
      const stages: Stage[] = [
        {
          id: "formulir",
          name: "Pengisian Formulir",
          status: (pribadiComplete && keluargaComplete && alamatComplete) ? "completed" : 
                  (pribadiComplete || keluargaComplete || alamatComplete) ? "in_progress" : "not_started",
          progress: Math.round(([pribadiComplete, keluargaComplete, alamatComplete].filter(Boolean).length / 3) * 100),
          details: [
            { name: "Data Pribadi", status: pribadiComplete ? "completed" : "in_progress", url: "/form-pendaftaran/pendaftaran/data-pribadi" },
            { name: "Data Keluarga", status: keluargaComplete ? "completed" : "not_started", url: "/form-pendaftaran/pendaftaran/data-keluarga" },
            { name: "Alamat & Kontak", status: alamatComplete ? "completed" : "not_started", url: "/form-pendaftaran/pendaftaran/alamat" }
          ]
        },
        {
          id: "dokumen",
          name: "Unggah Dokumen",
          status: (wajibComplete && sosmedComplete) ? "completed" : 
                  (wajibDocs.length > 0 || sosmedDocs.length > 0) ? "in_progress" : "not_started",
          progress: Math.round(([wajibComplete, sosmedComplete, pendukungComplete].filter(Boolean).length / 3) * 100),
          details: [
            { 
              name: "Dokumen Wajib", 
              status: wajibComplete ? "completed" : wajibDocs.length > 0 ? "in_progress" : "not_started", 
              url: "/form-pendaftaran/dokumen/wajib",
              verification_status: wajibDocs.some((d: any) => d.status === 'rejected') ? "rejected" : 
                                  wajibComplete ? "verified" : "pending"
            },
            { 
              name: "Bukti Sosial Media", 
              status: sosmedComplete ? "completed" : sosmedDocs.length > 0 ? "in_progress" : "not_started", 
              url: "/form-pendaftaran/dokumen/sosmed",
              verification_status: sosmedDocs.some((d: any) => d.status === 'rejected') ? "rejected" : 
                                  sosmedComplete ? "verified" : "pending"
            },
            { 
              name: "Dokumen Pendukung", 
              status: pendukungDocs.length > 0 ? "completed" : "not_started", 
              url: "/form-pendaftaran/dokumen/pendukung",
              verification_status: pendukungDocs.length > 0 ? "verified" : undefined
            }
          ]
        },
        {
          id: "seleksi_berkas",
          name: "Seleksi Berkas",
          status: applicationStatus?.finalized_at ? "completed" : 
                  (wajibComplete && sosmedComplete) ? "in_progress" : "not_started",
          progress: applicationStatus?.finalized_at ? 100 : 
                   (wajibComplete && sosmedComplete) ? 50 : 0,
          details: [
            { 
              name: "Hasil Seleksi Berkas", 
              status: applicationStatus?.finalized_at ? "completed" : "not_started", 
              url: "/form-pendaftaran/seleksi/berkas" 
            }
          ]
        },
        {
          id: "wawancara",
          name: "Tahap Wawancara",
          status: applicationStatus?.status === 'lolos_berkas' ? "in_progress" : 
                  ['lolos_wawancara', 'diterima'].includes(applicationStatus?.status) ? "completed" : "not_started",
          progress: ['lolos_wawancara', 'diterima'].includes(applicationStatus?.status) ? 100 : 
                   applicationStatus?.status === 'lolos_berkas' ? 50 : 0,
          details: [
            { 
              name: "Jadwal Wawancara", 
              // ✅ UPDATED: Jadwal wawancara completed jika sudah lolos wawancara atau diterima
              status: ['lolos_wawancara', 'diterima'].includes(applicationStatus?.status) ? "completed" :
                      applicationStatus?.status === 'lolos_berkas' ? "in_progress" : "not_started", 
              url: "/form-pendaftaran/seleksi/jadwal-wawancara" 
            },
            { 
              name: "Hasil Wawancara", 
              status: ['lolos_wawancara', 'diterima'].includes(applicationStatus?.status) ? "completed" : "not_started", 
              url: "/form-pendaftaran/seleksi/hasil-wawancara" 
            }
          ]
        },
        {
          id: "kelulusan",
          name: "Pengumuman Kelulusan",
          status: applicationStatus?.status === 'diterima' ? "completed" : 
                  ['lolos_wawancara', 'ditolak'].includes(applicationStatus?.status) ? "in_progress" : "not_started",
          progress: applicationStatus?.status === 'diterima' ? 100 : 
                   ['lolos_wawancara', 'ditolak'].includes(applicationStatus?.status) ? 50 : 0,
          details: [
            { 
              name: "Status Kelulusan", 
              status: ['diterima', 'ditolak'].includes(applicationStatus?.status) ? "completed" : "not_started", 
              url: "/form-pendaftaran/status/kelulusan" 
            }
          ]
        }
      ]

      // ✅ Calculate overall progress
      const completedStages = stages.filter(s => s.status === "completed").length
      const inProgressStages = stages.filter(s => s.status === "in_progress").length
      const overallProgress = Math.round(((completedStages + (inProgressStages * 0.5)) / stages.length) * 100)

      // ✅ Determine current stage
      const currentStage = stages.find(s => s.status === "in_progress")?.id || 
                          stages.find(s => s.status === "not_started")?.id || 
                          "kelulusan"

      const progressData: ApplicationProgress = {
        overall_progress: overallProgress,
        submission_deadline: "2025-12-31T23:59:59", // Default deadline
        current_stage: currentStage,
        stages,
        finalized_at: applicationStatus?.finalized_at,
        application_status: applicationStatus?.status
      }

      setApplicationProgress(progressData)
      setLastUpdated(new Date().toLocaleString('id-ID'))

      if (isRefresh) {
        toast({
          title: "Data Diperbarui",
          description: "Progress pendaftaran berhasil diperbarui.",
        })
      }

    } catch (error) {
      console.error('Error fetching progress data:', error)
      toast({
        title: "Kesalahan Jaringan",
        description: "Terjadi kesalahan saat mengambil data progress.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProgressData()
  }, [])

  // ✅ Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!applicationProgress) return ""
    
    const deadline = new Date(applicationProgress.submission_deadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    
    if (diffTime <= 0) {
      return "Tenggat waktu telah berakhir"
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${diffDays} hari ${diffHours} jam lagi`
  }

  // ✅ Get status badge
  const getStatusBadge = (status: string, verification_status?: string) => {
    if (verification_status === 'rejected') {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Ditolak
        </Badge>
      )
    }

    switch (status) {
      case "completed":
        return (
          <Badge className="text-green-800 bg-green-100 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Selesai
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="text-blue-800 bg-blue-100 hover:bg-blue-100">
            <Clock className="w-3 h-3 mr-1" />
            Sedang Berlangsung
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            <Circle className="w-3 h-3 mr-1" />
            Belum Dimulai
          </Badge>
        )
    }
  }

  // ✅ Get status icon
  const getStatusIcon = (status: string, verification_status?: string) => {
    if (verification_status === 'rejected') {
      return <AlertCircle className="w-5 h-5 text-red-600" />
    }

    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold">Memuat Progress...</h3>
              <p className="text-sm text-muted-foreground">Sedang mengambil data progress pendaftaran Anda</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!applicationProgress) {
    return (
      <div className="container py-6 mx-auto">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Gagal Memuat Data</h2>
          <p className="mb-6 text-muted-foreground">
            Terjadi kesalahan saat mengambil data progress.
          </p>
          <Button onClick={() => fetchProgressData()} variant="outline" className="w-full">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Progres Pendaftaran</h1>
            <p className="text-muted-foreground">
              Status dan progres pendaftaran beasiswa Anda
            </p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-muted-foreground">
                Terakhir diperbarui: {lastUpdated}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchProgressData(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Overall Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Progres Keseluruhan</CardTitle>
            <CardDescription>
              Progres pendaftaran beasiswa Anda secara keseluruhan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progres Pendaftaran</span>
                  <span className="text-sm font-medium">{applicationProgress.overall_progress}%</span>
                </div>
                <Progress value={applicationProgress.overall_progress} className="h-2" />
              </div>
              
              {applicationProgress.finalized_at ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertTitle className="text-green-800">Aplikasi Telah Dikirim</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Aplikasi beasiswa Anda telah dikirim pada {new Date(applicationProgress.finalized_at).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}. Silakan tunggu hasil seleksi.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Calendar className="w-4 h-4" />
                  <AlertTitle>Tenggat Waktu</AlertTitle>
                  <AlertDescription>
                    Lengkapi seluruh pendaftaran sebelum {new Date(applicationProgress.submission_deadline).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} ({calculateTimeRemaining()})
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stages Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Tahapan Pendaftaran</CardTitle>
            <CardDescription>
              Status dan detail setiap tahapan dalam proses pendaftaran beasiswa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {applicationProgress.stages.map((stage, index) => (
                <div key={stage.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`flex items-center justify-center rounded-full p-1 h-6 w-6 text-white ${
                          stage.status === 'completed' 
                            ? 'bg-green-600' 
                            : stage.status === 'in_progress' 
                              ? 'bg-blue-600' 
                              : 'bg-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <h3 className="font-medium">{stage.name}</h3>
                    </div>
                    <div>
                      {getStatusBadge(stage.status)}
                    </div>
                  </div>
                  
                  {stage.status !== 'not_started' && (
                    <div className="pl-8 space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Progres</span>
                          <span className="text-xs font-medium">{stage.progress}%</span>
                        </div>
                        <Progress value={stage.progress} className="h-1.5" />
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {stage.details.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status, item.verification_status)}
                              <span>{item.name}</span>
                              {item.verification_status === 'pending' && (
                                <Badge variant="outline" className="text-xs">Menunggu Verifikasi</Badge>
                              )}
                            </div>
                            <Button asChild size="sm" variant={item.status === 'not_started' ? "outline" : "default"}>
                              <a href={item.url}>
                                {item.status === 'completed' ? 'Lihat' : item.status === 'in_progress' ? 'Lanjutkan' : 'Mulai'}
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>                  )}                    {index < applicationProgress.stages.length - 1 && (
                    <div className="ml-[3px] py-2">
                      <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5" />
              <p>Ikuti semua tahapan pendaftaran sesuai urutan untuk menyelesaikan proses pendaftaran beasiswa.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}