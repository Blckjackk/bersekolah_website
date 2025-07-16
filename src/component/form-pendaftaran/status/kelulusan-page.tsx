// /app/form-pendaftaran/status/kelulusan/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy, 
  Info,
  ExternalLink,
  Mail,
  Loader2
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface ApplicationStatus {
  status: string
  finalized_at?: string
  catatan_admin?: string
  created_at?: string
  updated_at?: string
}

interface MediaSosial {
  id: number;
  link_grup_beasiswa: string;
  created_at: string;
  updated_at: string;
}

export default function StatusKelulusanPage() {
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [mediaSosial, setMediaSosial] = useState<MediaSosial | null>(null)
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

  const fetchMediaSosial = async () => {
    try {
      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/media-sosial/public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMediaSosial(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching media sosial:', error)
      // Fallback to default link if API fails
      setMediaSosial({
        id: 1,
        link_grup_beasiswa: 'https://chat.whatsapp.com/DBWgEhlvkz3E0SqpdvIL1q',
        created_at: '',
        updated_at: ''
      })
    }
  }

  useEffect(() => {
    fetchApplicationStatus()
    fetchMediaSosial()
  }, [])

  // ✅ Dynamic status badge based on application status
  const getStatusBadge = () => {
    if (!applicationStatus) return null

    switch (applicationStatus.status) {
      case "diterima":
        return (
          <Badge className="px-3 py-2 text-green-800 bg-green-100 text-md hover:bg-green-100">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Diterima
          </Badge>
        )
      case "ditolak":
        return (
          <Badge variant="destructive" className="px-3 py-2 text-md">
            <XCircle className="w-4 h-4 mr-1" />
            Tidak Diterima
          </Badge>
        )
      case "lolos_wawancara":
        return (
          <Badge className="px-3 py-2 text-blue-800 bg-blue-100 text-md hover:bg-blue-100">
            <Clock className="w-4 h-4 mr-1" />
            Lolos Wawancara - Menunggu Keputusan Akhir
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-3 py-2 text-yellow-800 bg-yellow-100 text-md hover:bg-yellow-100">
            <Clock className="w-4 h-4 mr-1" />
            Menunggu Pengumuman
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ✅ Handler untuk join grup WhatsApp (selalu dapat diakses)
  const handleJoinWhatsAppGroup = (link: string) => {
    window.open(link, '_blank')
    
    toast({
      title: "Berhasil",
      description: "Anda telah mengakses grup WhatsApp penerima beasiswa.",
    })
  }

  // ✅ Dynamic status message
  const getStatusMessage = () => {
    if (!applicationStatus) return ""

    switch (applicationStatus.status) {
      case "diterima":
        return "Selamat! Anda telah diterima sebagai penerima Beasiswa Bersekolah. Bergabunglah dengan grup WhatsApp penerima beasiswa untuk mendapatkan informasi terbaru dan berkomunikasi dengan sesama penerima beasiswa."
      case "ditolak":
        return "Mohon maaf, aplikasi Anda belum berhasil pada periode ini. Jangan berkecil hati, tetap semangat untuk kesempatan berikutnya."
      case "lolos_wawancara":
        return "Selamat! Anda telah lolos tahap wawancara. Pengumuman penerima beasiswa akan diumumkan segera."
      default:
        return "Pengumuman kelulusan akan tersedia setelah proses seleksi selesai. Pastikan untuk memeriksa halaman ini secara berkala."
    }
  }

  // ✅ Get WhatsApp group link for accepted students
  const getWhatsAppGroupLink = () => {
    if (!applicationStatus || applicationStatus.status !== 'diterima') return null
    return mediaSosial?.link_grup_beasiswa || 'https://chat.whatsapp.com/DBWgEhlvkz3E0SqpdvIL1q'
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold">Memuat Status Kelulusan...</h3>
              <p className="text-sm text-muted-foreground">Mengambil informasi status kelulusan Anda</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Show waiting message for non-final statuses
  if (!applicationStatus || !['diterima', 'ditolak', 'lolos_wawancara'].includes(applicationStatus.status)) {
    return (
      <div className="container py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Status Kelulusan</h1>
          <p className="text-muted-foreground">
            Informasi hasil seleksi beasiswa dan langkah selanjutnya
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pengumuman Belum Tersedia</CardTitle>
            <CardDescription>
              Menunggu hasil seleksi beasiswa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-500" />
              <AlertTitle>Menunggu Pengumuman</AlertTitle>
              <AlertDescription>
                {getStatusMessage()}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Status Kelulusan</h1>
        <p className="text-muted-foreground">
          Informasi hasil seleksi beasiswa dan langkah selanjutnya
        </p>
      </div>

      <div className="grid gap-6">
        {/* Main Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Status Kelulusan Beasiswa</CardTitle>
                <CardDescription>
                  {applicationStatus.updated_at && `Diperbarui pada ${formatDate(applicationStatus.updated_at)}`}
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
              <div className={`p-6 rounded-lg border ${
                applicationStatus.status === 'diterima' ? 'border-green-200 bg-green-50' :
                applicationStatus.status === 'ditolak' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center gap-4">
                  {applicationStatus.status === 'diterima' ? <Trophy className="w-16 h-16 text-green-600" /> :
                   applicationStatus.status === 'ditolak' ? <XCircle className="w-16 h-16 text-red-600" /> :
                   <Clock className="w-16 h-16 text-blue-600" />}
                  <div>
                    <h2 className={`text-xl font-bold ${
                      applicationStatus.status === 'diterima' ? 'text-green-800' :
                      applicationStatus.status === 'ditolak' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      {applicationStatus.status === 'diterima' ? 'Selamat!' :
                       applicationStatus.status === 'ditolak' ? 'Mohon Maaf' :
                       'Informasi'}
                    </h2>
                    <p className={`${
                      applicationStatus.status === 'diterima' ? 'text-green-700' :
                      applicationStatus.status === 'ditolak' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {getStatusMessage()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {applicationStatus.catatan_admin && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-medium">Catatan dari Tim Seleksi</h3>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicationStatus.catatan_admin}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Join WhatsApp Group Card - Hanya untuk yang diterima */}
        {applicationStatus.status === 'diterima' && getWhatsAppGroupLink() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-green-600" />
                Bergabung ke Grup Penerima Beasiswa
              </CardTitle>
              <CardDescription>
                Bergabunglah dengan grup WhatsApp penerima beasiswa untuk mendapatkan informasi terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">
                    <ExternalLink className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Grup WhatsApp Penerima Beasiswa Bersekolah
                    </h3>
                    <p className="text-sm text-green-700 mb-4">
                      Bergabunglah dengan sesama penerima beasiswa untuk mendapatkan informasi terbaru, 
                      berbagi pengalaman, dan berkomunikasi dengan tim beasiswa bersekolah.
                    </p>
                    <Button 
                      onClick={() => handleJoinWhatsAppGroup(getWhatsAppGroupLink()!)}
                      className="bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Bergabung ke Grup WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            
          </Card>
        )}

        {/* Contact Support Card - Untuk semua status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Butuh Bantuan?
            </CardTitle>
            <CardDescription>
              Hubungi tim beasiswa bersekolah jika ada kendala atau pertanyaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 mb-3">
                    Jika Anda mengalami kendala atau masalah, 
                    jangan ragu untuk menghubungi tim beasiswa bersekolah. Kami siap membantu Anda! 
                  </p>
                  <Button 
                    onClick={() => window.open('https://wa.me/6281906698736', '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Hubungi Tim Beasiswa
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}