"use client"

import React, { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Info, Briefcase, Users, Loader2, CheckCircle, XCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// Definisi validasi form dengan Zod
const formSchema = z.object({
  nama_lengkap: z.string().min(3, {
    message: "Nama lengkap harus terdiri dari minimal 3 karakter",
  }),
  phone: z.string().min(10, {
    message: "Nomor telepon harus terdiri dari minimal 10 digit",
  }).regex(/^[0-9]+$/, {
    message: "Nomor telepon hanya boleh berisi angka",
  }),
  nama_panggilan: z.string().min(1, {
    message: "Nama panggilan wajib diisi",
  }),
  tempat_lahir: z.string().min(1, {
    message: "Tempat lahir wajib diisi",
  }),
  tanggal_lahir: z.string().min(1, {
    message: "Tanggal lahir wajib diisi",
  }),
  jenis_kelamin: z.string().min(1, {
    message: "Jenis kelamin wajib dipilih",
  }),
  agama: z.string().min(1, {
    message: "Agama wajib dipilih",
  }),
  asal_sekolah: z.string().optional(),
  daerah_sekolah: z.string().optional(),
  jurusan: z.string().optional(),
  tingkat_kelas: z.string().optional(),
})

const opsiJenisKelamin = ["Laki-laki", "Perempuan"]

const opsiAgama = [
  "Islam",
  "Kristen Protestan", 
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
]

export default function DataPribadiPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // ✅ Tambah state alert yang sama seperti data-keluarga
  const [alert, setAlert] = useState<{
    show: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    description?: string
  }>({
    show: false,
    type: "info",
    title: "",
    description: ""
  })

  // Initialize form dengan react-hook-form dan resolver zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_lengkap: "",
      phone: "",
      nama_panggilan: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: "",
      agama: "",
      asal_sekolah: "",
      daerah_sekolah: "",
      jurusan: "",
      tingkat_kelas: "",
    },
  })

  // ✅ Functions untuk handle alert (sama seperti data-keluarga)
  const showAlert = (type: "success" | "error" | "warning" | "info", title: string, description?: string) => {
    setAlert({ show: true, type, title, description })
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4" />
      case "error":
        return <XCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getAlertClassName = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-900"
      case "error":
        return "border-red-200 bg-red-50 text-red-900"
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-900"
      default:
        return "border-blue-200 bg-blue-50 text-blue-900"
    }
  }

  // Fetch data pribadi saat component mount
  useEffect(() => {
    fetchDataPribadi()
  }, [])

  const fetchDataPribadi = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        showAlert("error", "Error", "Token tidak ditemukan. Silakan login kembali.")
        return
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      console.log('Fetching from:', `${baseURL}/calon-beswan/pribadi`)
      
      const response = await fetch(`${baseURL}/calon-beswan/pribadi`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Full API Response:', result)
        
        // Populate form dengan data yang ada
        const { user, beswan, sekolah_beswan } = result.data
        
        // Format tanggal untuk input date
        let formattedTanggalLahir = ""
        if (beswan?.tanggal_lahir) {
          const date = new Date(beswan.tanggal_lahir)
          if (!isNaN(date.getTime())) {
            formattedTanggalLahir = date.toISOString().split('T')[0]
          }
        }
        
        form.reset({
          nama_lengkap: user?.nama_lengkap || "",
          phone: user?.phone || "",
          nama_panggilan: beswan?.nama_panggilan || "",
          tempat_lahir: beswan?.tempat_lahir || "",
          tanggal_lahir: formattedTanggalLahir,
          jenis_kelamin: beswan?.jenis_kelamin || "",
          agama: beswan?.agama || "",
          asal_sekolah: sekolah_beswan?.asal_sekolah || "",
          daerah_sekolah: sekolah_beswan?.daerah_sekolah || "",
          jurusan: sekolah_beswan?.jurusan || "",
          tingkat_kelas: sekolah_beswan?.tingkat_kelas || "",
        })
        
        // ✅ Update toast menjadi showAlert
        if (user?.nama_lengkap) {
          showAlert("success", "Data Dimuat", "Data pribadi berhasil dimuat.")
        } else {
          showAlert("info", "Belum Ada Data", "Silakan isi form data pribadi.")
        }
      } else {
        // Get error details
        const errorData = await response.json()
        console.error('Error response:', errorData)
        
        if (response.status === 401) {
          showAlert("error", "Sesi Berakhir", "Silakan login kembali.")
          localStorage.removeItem('bersekolah_auth_token')
        } else if (response.status === 404) {
          showAlert("info", "Belum Ada Data", "Belum ada data pribadi yang tersimpan.")
        } else {
          showAlert("error", "Gagal Memuat Data", errorData.message || "Tidak dapat mengambil data pribadi dari server.")
        }
      }
    } catch (error) {
      console.error('Network error:', error)
      showAlert("error", "Kesalahan Jaringan", "Terjadi kesalahan saat menghubungi server. Periksa koneksi internet Anda.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler submit form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        showAlert("error", "Error", "Token tidak ditemukan. Silakan login kembali.")
        return
      }

      console.log('Data yang akan dikirim:', values)

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      console.log('Posting to:', `${baseURL}/calon-beswan/pribadi`)
      
      const response = await fetch(`${baseURL}/calon-beswan/pribadi`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(values)
      })

      console.log('Submit response status:', response.status)
      const result = await response.json()
      console.log('Submit response data:', result)

      if (response.ok) {
        showAlert("success", "Berhasil Disimpan", "Data pribadi berhasil disimpan.")
      } else {
        // Handle different error types
        if (response.status === 422) {
          // ✅ Update validation error handling
          if (result.errors) {
            console.log('Validation errors:', result.errors)
            
            // Format validation errors for display
            const errorMessages = Object.entries(result.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n')
            
            showAlert("error", "Validasi Gagal", errorMessages)
          } else {
            showAlert("error", "Validasi Gagal", result.message || "Data yang dikirim tidak valid.")
          }
        } else if (response.status === 401) {
          showAlert("error", "Sesi Berakhir", "Silakan login kembali.")
          localStorage.removeItem('bersekolah_auth_token')
        } else {
          showAlert("error", "Gagal Menyimpan", result.message || "Terjadi kesalahan saat menyimpan data.")
        }
      }
    } catch (error) {
      console.error('Network error:', error)
      showAlert("error", "Kesalahan Jaringan", "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        {/* ✅ Alert Notification saat loading */}
        {alert.show && (
          <div className="fixed z-50 w-full max-w-md top-4 right-4">
            <Alert className={`relative ${getAlertClassName(alert.type)}`}>
              {getAlertIcon(alert.type)}
              <AlertTitle className="flex items-center justify-between">
                {alert.title}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 hover:bg-transparent"
                  onClick={hideAlert}
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertTitle>
              {alert.description && <AlertDescription>{alert.description}</AlertDescription>}
            </Alert>
          </div>
        )}

        <div className="container py-6 mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Memuat data pribadi...</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* ✅ Alert Notification */}
      {alert.show && (
        <div className="fixed z-50 w-full max-w-md top-4 right-4">
          <Alert className={`relative ${getAlertClassName(alert.type)}`}>
            {getAlertIcon(alert.type)}
            <AlertTitle className="flex items-center justify-between">
              {alert.title}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-transparent"
                onClick={hideAlert}
              >
                <X className="w-4 h-4" />
              </Button>
            </AlertTitle>
            {alert.description && <AlertDescription>{alert.description}</AlertDescription>}
          </Alert>
        </div>
      )}

      <div className="container py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Data Pribadi</h1>
          <p className="text-muted-foreground">
            Lengkapi Data Pribadi Anda untuk pendaftaran beasiswa
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Data Pribadi</CardTitle>
            <CardDescription>
              Informasi ini akan digunakan untuk proses seleksi beasiswa dan verifikasi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* SECTION: DATA PRIBADI */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <h3 className="text-lg font-medium">Data Pribadi</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Nama Lengkap */}
                    <FormField
                      control={form.control}
                      name="nama_lengkap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap *</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                          </FormControl>
                          <FormDescription>Sesuai dengan KTP/Kartu Identitas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon *</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: 08123456789" {...field} />
                          </FormControl>
                          <FormDescription>Nomor telepon aktif untuk komunikasi</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nama Panggilan */}
                    <FormField
                      control={form.control}
                      name="nama_panggilan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Panggilan *</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama panggilan Anda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tempat Lahir */}
                    <FormField
                      control={form.control}
                      name="tempat_lahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempat Lahir *</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Bandung" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tanggal Lahir */}
                    <FormField
                      control={form.control}
                      name="tanggal_lahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Jenis Kelamin */}
                    <FormField
                      control={form.control}
                      name="jenis_kelamin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kelamin *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {opsiJenisKelamin.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Agama */}
                    <FormField
                      control={form.control}
                      name="agama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agama *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Agama" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {opsiAgama.map((agama) => (
                                <SelectItem key={agama} value={agama}>
                                  {agama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SECTION: DATA SEKOLAH */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mt-6">
                    <Briefcase className="w-5 h-5" />
                    <h3 className="text-lg font-medium">Data Sekolah</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Asal Sekolah */}
                    <FormField
                      control={form.control}
                      name="asal_sekolah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asal Sekolah</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: SMA Negeri 3 Bandung" {...field} />
                          </FormControl>
                          <FormDescription>Nama sekolah saat ini atau terakhir</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Daerah Sekolah */}
                    <FormField
                      control={form.control}
                      name="daerah_sekolah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daerah Sekolah</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Kota Bandung, Jawa Barat" {...field} />
                          </FormControl>
                          <FormDescription>Lokasi sekolah berada</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Jurusan */}
                    <FormField
                      control={form.control}
                      name="jurusan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurusan</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: IPA, IPS, RPL, dll" {...field} />
                          </FormControl>
                          <FormDescription>Jurusan atau program studi</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tingkat Kelas */}
                    <FormField
                      control={form.control}
                      name="tingkat_kelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tingkat Kelas</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kelas saat ini" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["VII", "VIII", "IX", "X", "XI", "XII", "Lulus"].map((kelas) => (
                                <SelectItem key={kelas} value={kelas}>
                                  {kelas === "VII" || kelas === "VIII" || kelas === "IX" ? `Kelas ${kelas} (SMP)` :
                                   kelas === "X" || kelas === "XI" || kelas === "XII" ? `Kelas ${kelas} (SMA)` :
                                   "Sudah Lulus"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Tingkat kelas saat ini</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end pt-6 mt-6 border-t">
                  <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> 
                        Simpan Data Pribadi
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="px-6 py-3 border-t bg-gray-50">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Data ini dibutuhkan untuk pertimbangan pemberian beasiswa sesuai dengan{" "}
                <span className="font-medium">Ketentuan Seleksi Yayasan Bersekolah</span>.
                Pastikan semua data yang dimasukkan akurat dan sesuai dengan dokumen resmi.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}