"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Info,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  name: string
  email: string
  pendaftaranProgress: number
  statusBerkas: string
  statusWawancara: string
  statusKelulusan: string
  deadlineDocuments: string
}

interface ApplicationStatus {
  status: string
  finalized_at?: string
  interview_date?: string
  interview_time?: string
  interview_link?: string
  period?: {
    akhir_pendaftaran: string
    mulai_pendaftaran: string
    mulai_beasiswa: string
    akhir_beasiswa: string
    nama_periode?: string
  }
}

interface DocumentsStatus {
  documents_status: Array<{
    name: string
    required: boolean
    verification_status: string
  }>
  overall_progress: number
  can_finalize: boolean
  finalized_at?: string
}

interface TimelineItem {
  date: string
  title: string
  completed: boolean
}

export default function BerandaPage() {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    pendaftaranProgress: 0,
    statusBerkas: "Memuat...",
    statusWawancara: "Memuat...",
    statusKelulusan: "Memuat...",
    deadlineDocuments: "30 Juni 2025"
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [documentsStatus, setDocumentsStatus] = useState<DocumentsStatus | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const { toast } = useToast()

  // ✅ Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const user = await response.json()
        
        setUserData(prev => ({
          ...prev,
          name: user.name || "Pendaftar",
          email: user.email || ""
        }))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // ✅ Fetch application status
  const fetchApplicationStatus = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

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
        
        // Update deadline dan timeline dari periode beasiswa
        if (result.data.period) {
          const period = result.data.period
          
          // Update deadline
          if (period.akhir_pendaftaran) {
            const deadline = new Date(period.akhir_pendaftaran).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long', 
              year: 'numeric'
            })
            setUserData(prev => ({ ...prev, deadlineDocuments: deadline }))
          }
          
          // ✅ SIMPLIFIED: Generate timeline dari periode beasiswa - hanya mulai, akhir, dan pengumuman
          const now = new Date()
          const timelineItems: TimelineItem[] = []
          
          if (period.mulai_pendaftaran) {
            timelineItems.push({
              date: new Date(period.mulai_pendaftaran).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }),
              title: "Pendaftaran Dibuka",
              completed: new Date(period.mulai_pendaftaran) <= now
            })
          }
          
          if (period.akhir_pendaftaran) {
            timelineItems.push({
              date: new Date(period.akhir_pendaftaran).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }),
              title: "Batas Akhir Pendaftaran",
              completed: new Date(period.akhir_pendaftaran) <= now
            })
          }
          
          if (period.mulai_beasiswa) {
            timelineItems.push({
              date: new Date(period.mulai_beasiswa).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }),
              title: "Pengumuman Penerima Beasiswa",
              completed: result.data.status === 'diterima'
            })
          }
          
          setTimeline(timelineItems)
        }
      }
    } catch (error) {
      console.error('Error fetching application status:', error)
    }
  }

  // ✅ Fetch documents status
  const fetchDocumentsStatus = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/my-documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        const documents = result.data || []
        
        // ✅ Transform data untuk match interface
        const wajibDocs = documents.filter((d: any) => 
          ['student_proof', 'identity_proof', 'photo'].includes(d.document_type?.code || d.document_type_code)
        )
        const verifiedWajib = wajibDocs.filter((d: any) => d.status === 'verified')
        
        const transformedData: DocumentsStatus = {
          documents_status: documents.map((d: any) => ({
            name: d.document_type?.name || d.document_type_name || 'Unknown',
            required: ['student_proof', 'identity_proof', 'photo'].includes(d.document_type?.code || d.document_type_code),
            verification_status: d.status || 'pending'
          })),
          overall_progress: documents.length > 0 ? Math.round((verifiedWajib.length / Math.max(wajibDocs.length, 1)) * 100) : 0,
          can_finalize: wajibDocs.length >= 3 && verifiedWajib.length >= 3,
          finalized_at: applicationStatus?.finalized_at || undefined
        }
        
        setDocumentsStatus(transformedData)
      }
    } catch (error) {
      console.error('Error fetching documents status:', error)
    }
  }

  // ✅ Update userData berdasarkan status aplikasi dan dokumen
  useEffect(() => {
    if (applicationStatus && documentsStatus) {
      // Status berkas berdasarkan finalisasi dan verifikasi
      let statusBerkas = "Belum Lengkap"
      if (applicationStatus.finalized_at) {
        const requiredDocs = documentsStatus.documents_status.filter(doc => doc.required)
        const verifiedDocs = requiredDocs.filter(doc => doc.verification_status === 'verified')
        
        if (verifiedDocs.length === requiredDocs.length && requiredDocs.length > 0) {
          statusBerkas = "Lolos Verifikasi"
        } else {
          statusBerkas = "Menunggu Verifikasi" 
        }
      } else if (documentsStatus.can_finalize) {
        statusBerkas = "Siap Finalisasi"
      }

      // Status wawancara
      let statusWawancara = "Belum Terjadwal"
      if (applicationStatus.status === 'lolos_berkas') {
        if (applicationStatus.interview_date && applicationStatus.interview_time) {
          statusWawancara = "Terjadwal"
        } else {
          statusWawancara = "Menunggu Jadwal"
        }
      } else if (['lolos_wawancara', 'diterima'].includes(applicationStatus.status)) {
        statusWawancara = "Selesai"
      } else if (applicationStatus.status === 'ditolak') {
        statusWawancara = "Tidak Lolos"
      }

      // Status kelulusan
      let statusKelulusan = "Proses Seleksi"
      switch (applicationStatus.status) {
        case 'diterima':
          statusKelulusan = "Diterima"
          break
        case 'ditolak':
          statusKelulusan = "Tidak Diterima"
          break
        case 'lolos_wawancara':
          statusKelulusan = "Menunggu Pengumuman"
          break
        case 'lolos_berkas':
          statusKelulusan = "Lolos Berkas"
          break
        case 'pending':
          statusKelulusan = "Menunggu Review"
          break
        default:
          statusKelulusan = "Proses Seleksi"
      }

      setUserData(prev => ({
        ...prev,
        pendaftaranProgress: Math.round(documentsStatus.overall_progress),
        statusBerkas,
        statusWawancara,
        statusKelulusan
      }))
    }
  }, [applicationStatus, documentsStatus])

  // ✅ Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchApplicationStatus(),
          fetchDocumentsStatus()
        ])
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memuat data dashboard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // ✅ Helper functions untuk status badge
  const getBadgeVariant = (status: string, type: 'berkas' | 'wawancara' | 'kelulusan') => {
    switch (type) {
      case 'berkas':
        if (status === "Lolos Verifikasi") return "default"
        if (status === "Siap Finalisasi") return "secondary"
        return "outline"
      case 'wawancara':
        if (status === "Terjadwal" || status === "Selesai") return "default"
        if (status === "Tidak Lolos") return "destructive"
        return "outline"
      case 'kelulusan':
        if (status === "Diterima") return "default"
        if (status === "Tidak Diterima") return "destructive"
        return "outline"
      default:
        return "outline"
    }
  }

  // ✅ Refresh data
  const handleRefresh = async () => {
    await Promise.all([
      fetchUserProfile(),
      fetchApplicationStatus(), 
      fetchDocumentsStatus()
    ])
    
    toast({
      title: "Berhasil",
      description: "Data dashboard berhasil diperbarui.",
    })
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold">Memuat Dashboard...</h3>
              <p className="text-sm text-muted-foreground">Mengambil data terbaru untuk Anda</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto space-y-6">
      {/* Header dengan tombol refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Pendaftaran</h1>
          <p className="text-muted-foreground">Portal Pendaftaran Beasiswa Yayasan Bersekolah</p>
          {applicationStatus?.period?.nama_periode && (
            <p className="text-sm font-medium text-blue-600">{applicationStatus.period.nama_periode}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Greeting and Status Overview */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Selamat Datang, {userData.name}</CardTitle> 
        </CardHeader>        <CardContent>
          <div className="space-y-6">
            {/* Sambutan untuk calon beswan */}
            <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
              <p className="text-blue-700">
                Selamat datang di Portal Pendaftaran Beasiswa Yayasan Bersekolah! Kami sangat mengapresiasi tekad dan semangat Anda untuk mengikuti program beasiswa ini. 
                Kami percaya bahwa pendidikan adalah kunci menuju masa depan yang lebih baik, dan kami berkomitmen untuk mendukung Anda dalam meraih impian.
              </p>
              <p className="mt-2 text-blue-700">
                Mari lengkapi dokumen-dokumen yang diperlukan dan ikuti proses seleksi dengan baik. Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim dukungan kami. Semoga sukses!
              </p>
            </div>
            
            {/* Video Tutorial Cards */}
            <div>
              <h3 className="mb-3 text-lg font-medium">Video Tutorial</h3>
              <div className="grid gap-4 md:grid-cols-2">                {/* Card Video Tutorial 1 */}
                <div className="overflow-hidden border rounded-lg shadow-sm">
                  <div className="bg-gray-100 aspect-video">
                    {/* YouTube Embedded Video */}
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/qU1I3_olv38"
                      title="Cara Pendaftaran Beasiswa"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen>
                    </iframe>
                  </div>
                  <div className="p-4">
                    <h4 className="mb-1 font-medium">Cara Pendaftaran Beasiswa</h4>
                    <p className="text-sm text-muted-foreground">Panduan lengkap untuk mengisi formulir pendaftaran dan mengunggah dokumen wajib.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={() => window.open('https://www.youtube.com/watch?v=qU1I3_olv38&t=306s', '_blank')}
                    >
                      Buka di YouTube
                    </Button>
                  </div>
                </div>
                  {/* Card Video Tutorial 2 */}
                <div className="overflow-hidden border rounded-lg shadow-sm">
                  <div className="bg-gray-100 aspect-video">
                    {/* YouTube Embedded Video */}
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/LbmxCLpg3jU"
                      title="Profil Beasiswa Bersekolah"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen>
                    </iframe>
                  </div>
                  <div className="p-4">
                    <h4 className="mb-1 font-medium">Profil Beasiswa Bersekolah</h4>
                    <p className="text-sm text-muted-foreground">Mengenal lebih jauh beasiswa Bersekolah</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => window.open('https://www.youtube.com/watch?v=LbmxCLpg3jU&t=309s', '_blank')}
                    >
                      Buka di YouTube
                    </Button>
                  </div>
                </div>
              </div>
            </div>          
            
          </div>
        </CardContent>
      </Card>

      
      
      {/* ✅ Dynamic Alert berdasarkan status */}
      {!applicationStatus?.finalized_at && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Penting!</AlertTitle>
          <AlertDescription>
            Batas waktu pengumpulan dokumen adalah <strong>{userData.deadlineDocuments}.</strong> Mohon lengkapi dokumen sebelum tenggat waktu.
          </AlertDescription>
        </Alert>
      )}

      {applicationStatus?.finalized_at && applicationStatus.status === 'pending' && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertTitle>Berkas Terkirim</AlertTitle>
          <AlertDescription>
            Berkas Anda telah dikirim untuk diverifikasi. Silakan tunggu hasil seleksi berkas.
          </AlertDescription>
        </Alert>
      )}
        {/* ✅ Dynamic Timeline dari Beasiswa Periods */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline Seleksi Beasiswa</CardTitle>
            <CardDescription>Jadwal penting dalam proses seleksi beasiswa periode ini</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              {timeline.map((item, index) => (
                <li key={index} className="mb-10 ml-6">
                  <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${item.completed ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {item.completed ? 
                      <CheckCircle className="w-3 h-3 text-white" /> : 
                      <Clock className="w-3 h-3 text-white" />
                    }
                  </span>
                  <h3 className="font-medium leading-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}