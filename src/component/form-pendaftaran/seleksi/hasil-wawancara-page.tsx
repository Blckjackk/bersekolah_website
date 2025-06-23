"use client"

import React, { useState, useEffect } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Info,
  Trophy,
  Loader2
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ApplicationStatus {
  status: string
  finalized_at?: string
  catatan_admin?: string
  created_at?: string
  updated_at?: string
}

export default function HasilSeleksiPage() {
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchApplicationStatus = async () => {
    try {
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
        setApplicationStatus(result.data)
      } else {
        throw new Error('Failed to fetch application status')
      }
    } catch (error) {
      console.error('Error fetching application status:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil status aplikasi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplicationStatus()
  }, [])

  const getStatusBadge = () => {
    if (!applicationStatus) return null

    switch (applicationStatus.status) {
      case "lolos_berkas":
        return (
          <Badge className="px-3 py-2 text-blue-800 bg-blue-100 text-md hover:bg-blue-100">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Lolos Seleksi Berkas
          </Badge>
        )
      case "lolos_wawancara":
        return (
          <Badge className="px-3 py-2 text-green-800 bg-green-100 text-md hover:bg-green-100">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Lolos Wawancara
          </Badge>
        )
      case "diterima":
        return (
          <Badge className="px-3 py-2 text-md bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            <Trophy className="w-4 h-4 mr-1" />
            Diterima
          </Badge>
        )
      case "ditolak":
        return (
          <Badge variant="destructive" className="px-3 py-2 text-md">
            <XCircle className="w-4 h-4 mr-1" />
            Tidak Lolos
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-3 py-2 text-yellow-800 bg-yellow-100 text-md hover:bg-yellow-100">
            <Clock className="w-4 h-4 mr-1" />
            Menunggu Hasil
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    })
  }

  const getStatusMessage = () => {
    if (!applicationStatus) return ""

    switch (applicationStatus.status) {
      case "lolos_berkas":
        return "Selamat! Anda berhasil lolos tahap seleksi berkas. Silakan menunggu informasi jadwal wawancara yang akan dikirimkan melalui email."
      case "lolos_wawancara":
        return "Selamat! Anda berhasil lolos tahap wawancara. Silakan menunggu pengumuman penerima beasiswa."
      case "diterima":
        return "Selamat! Anda diterima sebagai penerima beasiswa. Tim kami akan menghubungi Anda segera untuk proses selanjutnya."
      case "ditolak":
        return "Mohon maaf, aplikasi Anda belum berhasil pada periode ini. Jangan berkecil hati, tetap semangat untuk kesempatan berikutnya."
      default:
        return "Aplikasi Anda sedang dalam tahap review. Hasil akan diumumkan melalui email dan halaman ini."
    }
  }

  const getNextSteps = () => {
    if (!applicationStatus) return null

    switch (applicationStatus.status) {
      case "lolos_berkas":
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
              <div className="p-1 text-blue-600 bg-blue-100 rounded-full">
                <span className="text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium">Tunggu Jadwal Wawancara</h4>
                <p className="text-sm text-muted-foreground">Tim kami akan mengirimkan jadwal wawancara melalui email</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
              <div className="p-1 text-blue-600 bg-blue-100 rounded-full">
                <span className="text-sm font-medium">2</span>
              </div>
              <div>
                <h4 className="font-medium">Persiapkan Wawancara</h4>
                <p className="text-sm text-muted-foreground">Pelajari materi tentang program beasiswa dan siapkan diri dengan baik</p>
              </div>
            </div>
          </div>
        )
      case "lolos_wawancara":
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
              <div className="p-1 text-green-600 bg-green-100 rounded-full">
                <span className="text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium">Tunggu Pengumuman Akhir</h4>
                <p className="text-sm text-muted-foreground">Pengumuman penerima beasiswa akan diumumkan segera</p>
              </div>
            </div>
          </div>
        )
      case "diterima":
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
              <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                <span className="text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium">Orientasi Beswan</h4>
                <p className="text-sm text-muted-foreground">Ikuti orientasi dan program pembinaan beswan</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold">Memuat Status Seleksi...</h3>
              <p className="text-sm text-muted-foreground">Mengambil informasi hasil seleksi Anda</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Hasil Seleksi</h1>
        <p className="text-muted-foreground">
          Informasi hasil dan status seleksi beasiswa Anda
        </p>
      </div>

      {applicationStatus?.status === "pending" ? (
        <Card>
          <CardHeader>
            <CardTitle>Menunggu Hasil Seleksi</CardTitle>
            <CardDescription>
              Aplikasi Anda sedang dalam proses review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-500" />
              <AlertTitle>Proses Review</AlertTitle>
              <AlertDescription>
                Tim kami sedang melakukan review terhadap aplikasi beasiswa Anda. Hasil akan diumumkan melalui email dan halaman ini.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Hasil Seleksi Beasiswa</CardTitle>
                  <CardDescription>
                    {applicationStatus?.updated_at && `Diperbarui pada ${formatDate(applicationStatus.updated_at)}`}
                  </CardDescription>
                </div>
                <div>
                  {getStatusBadge()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Status Message */}
                <div className={`p-4 rounded-lg border ${
                  applicationStatus?.status === 'diterima' ? 'border-emerald-200 bg-emerald-50' :
                  ['lolos_berkas', 'lolos_wawancara'].includes(applicationStatus?.status || '') ? 'border-green-200 bg-green-50' :
                  applicationStatus?.status === 'ditolak' ? 'border-red-200 bg-red-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {applicationStatus?.status === 'diterima' ? <Trophy className="w-8 h-8 text-emerald-600" /> :
                     ['lolos_berkas', 'lolos_wawancara'].includes(applicationStatus?.status || '') ? <CheckCircle2 className="w-8 h-8 text-green-600" /> :
                     applicationStatus?.status === 'ditolak' ? <XCircle className="w-8 h-8 text-red-600" /> :
                     <Clock className="w-8 h-8 text-blue-600" />}
                    <div>
                      <h3 className={`text-lg font-medium ${
                        applicationStatus?.status === 'diterima' ? 'text-emerald-800' :
                        ['lolos_berkas', 'lolos_wawancara'].includes(applicationStatus?.status || '') ? 'text-green-800' :
                        applicationStatus?.status === 'ditolak' ? 'text-red-800' :
                        'text-blue-800'
                      }`}>
                        {applicationStatus?.status === 'diterima' ? 'Selamat!' :
                         ['lolos_berkas', 'lolos_wawancara'].includes(applicationStatus?.status || '') ? 'Selamat!' :
                         applicationStatus?.status === 'ditolak' ? 'Mohon Maaf' :
                         'Informasi'}
                      </h3>
                      <p className={`${
                        applicationStatus?.status === 'diterima' ? 'text-emerald-700' :
                        ['lolos_berkas', 'lolos_wawancara'].includes(applicationStatus?.status || '') ? 'text-green-700' :
                        applicationStatus?.status === 'ditolak' ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        {getStatusMessage()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {applicationStatus?.catatan_admin && (
                  <div>
                    <h3 className="mb-2 font-medium">Catatan dari Tim Seleksi</h3>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicationStatus.catatan_admin}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {getNextSteps() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Langkah Selanjutnya
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getNextSteps()}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}