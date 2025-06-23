// /app/form-pendaftaran/seleksi/jadwal-wawancara/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { 
  Calendar, 
  Clock, 
  Video, 
  AlertCircle, 
  CalendarCheck, 
  Link as LinkIcon,
  ExternalLink, 
  Info,
  CheckCircle,
  FileText,
  Loader2,
  RefreshCw,
  Lock
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface InterviewSchedule {
  status: "waiting" | "scheduled" | "completed" | "canceled"
  interview_date?: string
  interview_end_time?: string
  interview_type: "online" | "offline"
  interview_platform?: string
  interview_link?: string
  interview_location?: string
  interviewer?: string
  confirmation_status?: "pending" | "confirmed"
  additional_notes?: string
}

// ✅ FIXED: Tambah interview_time di interface
interface ApplicationStatus {
  status: string
  finalized_at?: string
  interview_date?: string
  interview_time?: string     // ✅ ADDED: missing field
  interview_link?: string
}

export default function JadwalWawancaraPage() {
  const [interviewSchedule, setInterviewSchedule] = useState<InterviewSchedule | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const { toast } = useToast()

  // ✅ FIXED: Format functions
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date string:', dateString)
        return "Waktu tidak valid"
      }
      
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      })
    } catch (error) {
      console.error('❌ Error formatting time:', error)
      return "Waktu tidak valid"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date string:', dateString)
        return "Tanggal tidak valid"
      }
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
      })
    } catch (error) {
      console.error('❌ Error formatting date:', error)
      return "Tanggal tidak valid"
    }
  }

  // ✅ FIXED: Fetch data from API
  const fetchInterviewData = async (isRefresh = false) => {
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

      const response = await fetch(`${baseURL}/application-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        const appStatus = result.data
        setApplicationStatus(appStatus)

        // ✅ FIXED: Determine interview status dengan check yang benar
        let scheduleStatus: "waiting" | "scheduled" | "completed" | "canceled" = "waiting"
        
        if (!appStatus?.finalized_at) {
          scheduleStatus = "waiting"
        } else if (appStatus.status === 'lolos_berkas') {
          // ✅ FIXED: Cek keberadaan data wawancara
          if (appStatus.interview_date && appStatus.interview_time && appStatus.interview_link) {
            scheduleStatus = "scheduled"
          } else {
            scheduleStatus = "waiting" // Admin belum set jadwal wawancara
          }
        } else if (['lolos_wawancara', 'diterima'].includes(appStatus.status)) {
          scheduleStatus = "completed"
        } else if (appStatus.status === 'ditolak') {
          scheduleStatus = "canceled"
        } else {
          scheduleStatus = "waiting"
        }

        // ✅ FIXED: Kombinasi date dan time hanya jika keduanya ada
        let combinedDateTime = undefined
        let endDateTime = undefined

        if (appStatus.interview_date && appStatus.interview_time) {
          const dateStr = appStatus.interview_date  // YYYY-MM-DD
          let timeStr = appStatus.interview_time    // HH:MM:SS
          
          // ✅ FIXED: Handle time format - potong detik jika ada
          if (timeStr && timeStr.length > 5) {
            timeStr = timeStr.substring(0, 5) // HH:MM
          }
          
          // ✅ FIXED: Kombinasi date + time
          combinedDateTime = `${dateStr}T${timeStr}:00`
          
          // End time (1 jam kemudian)
          const startTime = new Date(combinedDateTime)
          if (!isNaN(startTime.getTime())) {
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
            endDateTime = endTime.toISOString()
          }
        }

        const schedule: InterviewSchedule = {
          status: scheduleStatus,
          interview_date: combinedDateTime,
          interview_end_time: endDateTime,
          interview_type: "online",
          interview_platform: "Google Meet",
          interview_link: appStatus.interview_link,
          interviewer: "Tim Seleksi Beasiswa Bersekolah",
          confirmation_status: "confirmed",
          additional_notes: scheduleStatus === "scheduled" ? 
            "Harap bergabung 5 menit sebelum jadwal. Siapkan dokumen pendukung yang mungkin perlu ditunjukkan selama wawancara." :
            scheduleStatus === "completed" ?
            "Wawancara telah selesai dilaksanakan. Silakan tunggu pengumuman hasil." :
            scheduleStatus === "waiting" && appStatus.status === 'lolos_berkas' ?
            "Anda telah lolos seleksi berkas. Admin sedang menyiapkan jadwal wawancara untuk Anda." :
            undefined
        }

        setInterviewSchedule(schedule)
        setLastUpdated(new Date().toLocaleString('id-ID'))

        if (isRefresh) {
          toast({
            title: "Data Diperbarui",
            description: "Jadwal wawancara berhasil diperbarui.",
          })
        }

      } else {
        console.error('❌ Failed to fetch application status:', response.status)
        throw new Error('Failed to fetch application status')
      }

    } catch (error) {
      console.error('Error fetching interview data:', error)
      toast({
        title: "Kesalahan Jaringan",
        description: "Terjadi kesalahan saat mengambil jadwal wawancara.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviewData()
  }, [])

  // ✅ Get status badge
  const getStatusBadge = () => {
    if (!interviewSchedule) return null

    switch (interviewSchedule.status) {
      case "scheduled":
        return (
          <Badge className="px-3 py-2 text-blue-800 bg-blue-100 text-md hover:bg-blue-100">
            <CalendarCheck className="w-4 h-4 mr-1" />
            Terjadwal
          </Badge>
        )
      case "completed":
        return (
          <Badge className="px-3 py-2 text-green-800 bg-green-100 text-md hover:bg-green-100">
            <CheckCircle className="w-4 h-4 mr-1" />
            Selesai
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="destructive" className="px-3 py-2 text-md">
            <AlertCircle className="w-4 h-4 mr-1" />
            Dibatalkan
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-3 py-2 text-yellow-800 bg-yellow-100 text-md hover:bg-yellow-100">
            <Clock className="w-4 h-4 mr-1" />
            Menunggu Jadwal
          </Badge>
        )
    }
  }

  // ✅ Check access
  const hasAccess = applicationStatus?.finalized_at && 
                   ['lolos_berkas', 'lolos_wawancara', 'diterima'].includes(applicationStatus.status)

  if (!hasAccess) {
    return (
      <div className="container py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Jadwal Wawancara</h1>
          <p className="text-muted-foreground">
            Informasi jadwal dan persiapan wawancara beasiswa
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              Akses Terbatas
            </CardTitle>
            <CardDescription>
              Anda belum dapat mengakses halaman ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Belum Bisa Diakses</AlertTitle>
              <AlertDescription>
                {!applicationStatus?.finalized_at ? 
                  "Silakan finalisasi berkas terlebih dahulu di halaman Seleksi Berkas." :
                  applicationStatus.status === 'pending' ?
                  "Menunggu hasil seleksi berkas. Halaman ini akan terbuka jika Anda lolos seleksi berkas." :
                  applicationStatus.status === 'ditolak' ?
                  "Mohon maaf, Anda belum lolos pada tahap seleksi berkas. Silakan cek hasil di halaman Hasil Seleksi." :
                  "Status aplikasi Anda tidak memungkinkan untuk mengakses halaman ini."
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!interviewSchedule) {
    return (
      <div className="container py-6 mx-auto">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Gagal Memuat Data</h2>
          <p className="mb-6 text-muted-foreground">
            Terjadi kesalahan saat mengambil jadwal wawancara.
          </p>
          <Button onClick={() => fetchInterviewData()} variant="outline" className="w-full">
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
            <h1 className="text-2xl font-bold tracking-tight">Jadwal Wawancara</h1>
            <p className="text-muted-foreground">
              Informasi jadwal dan persiapan wawancara beasiswa
            </p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-muted-foreground">
                Terakhir diperbarui: {lastUpdated}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchInterviewData(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {interviewSchedule.status === "waiting" ? (
        <Card>
          <CardHeader>
            <CardTitle>Menunggu Jadwal Wawancara</CardTitle>
            <CardDescription>
              Anda telah lolos seleksi berkas dan akan mendapatkan jadwal wawancara segera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-500" />
              <AlertTitle>Mohon Tunggu</AlertTitle>
              <AlertDescription>
                Tim kami sedang menyusun jadwal wawancara. Anda akan menerima notifikasi via email dan juga di halaman ini ketika jadwal telah ditetapkan.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Detail Jadwal Wawancara</CardTitle>
              </div>
              <div>
                {getStatusBadge()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {interviewSchedule.interview_date && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Tanggal</h3>
                      <p>{formatDate(interviewSchedule.interview_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Waktu</h3>
                      <p>
                        {formatTime(interviewSchedule.interview_date)} - {' '}
                        {interviewSchedule.interview_end_time && formatTime(interviewSchedule.interview_end_time)} WIB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Platform</h3>
                      <p>{interviewSchedule.interview_platform}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Interviewer</h3>
                      <p>{interviewSchedule.interviewer}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {interviewSchedule.interview_type === "online" && interviewSchedule.interview_link && (
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-800">Link Wawancara</h3>
                        <p className="text-sm text-blue-700">{interviewSchedule.interview_link}</p>
                      </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <a href={interviewSchedule.interview_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Masuk
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              
              {interviewSchedule.additional_notes && (
                <div>
                  <h3 className="mb-2 font-medium">Catatan Tambahan</h3>
                  <p className="text-muted-foreground">{interviewSchedule.additional_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}