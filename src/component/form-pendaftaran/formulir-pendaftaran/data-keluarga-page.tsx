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
  nama_ayah: z.string().min(3, {
    message: "Nama ayah harus terdiri dari minimal 3 karakter",
  }),
  pekerjaan_ayah: z.string().min(2, {
    message: "Pekerjaan ayah wajib diisi",
  }),
  penghasilan_ayah: z.string().min(1, {
    message: "Penghasilan ayah wajib dipilih",
  }),
  nama_ibu: z.string().min(3, {
    message: "Nama ibu harus terdiri dari minimal 3 karakter",
  }),
  pekerjaan_ibu: z.string().min(2, {
    message: "Pekerjaan ibu wajib diisi",
  }),
  penghasilan_ibu: z.string().min(1, {
    message: "Penghasilan ibu wajib dipilih",
  }),
  jumlah_saudara: z.string().min(1, {
    message: "Jumlah saudara wajib dipilih",
  }),
  tanggungan_keluarga: z.string().min(1, {
    message: "Jumlah tanggungan keluarga wajib dipilih",
  }),
})

// Daftar opsi penghasilan
const opsiPenghasilan = [
  "Kurang dari Rp 1.000.000",
  "Rp 1.000.000 - Rp 3.000.000",
  "Rp 3.000.000 - Rp 5.000.000", 
  "Rp 5.000.000 - Rp 7.000.000",
  "Rp 7.000.000 - Rp 10.000.000",
  "Lebih dari Rp 10.000.000",
]

// Daftar opsi jumlah saudara
const opsiJumlahSaudara = ["0", "1", "2", "3", "4", "5", "Lebih dari 5"]

// Daftar opsi tanggungan keluarga
const opsiTanggunganKeluarga = ["1", "2", "3", "4", "5", "Lebih dari 5"]

export default function DataKeluargaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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
      nama_ayah: "",
      pekerjaan_ayah: "",
      penghasilan_ayah: "",
      nama_ibu: "",
      pekerjaan_ibu: "",
      penghasilan_ibu: "",
      jumlah_saudara: "",
      tanggungan_keluarga: "",
    },
  })

  // Functions to show different alert types
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

  // Fetch data keluarga saat component mount
  useEffect(() => {
    fetchDataKeluarga()
  }, [])

  const fetchDataKeluarga = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        showAlert("error", "Error", "Token tidak ditemukan. Silakan login kembali.")
        return
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      console.log('Fetching from:', `${baseURL}/calon-beswan/keluarga`)
      
      const response = await fetch(`${baseURL}/calon-beswan/keluarga`, {
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
        
        // Populate form dengan data yang ada dari keluarga_beswan
        const { keluarga_beswan } = result.data
        
        if (keluarga_beswan) {
          console.log('Keluarga beswan data found:', keluarga_beswan)
          form.reset({
            nama_ayah: keluarga_beswan.nama_ayah || "",
            pekerjaan_ayah: keluarga_beswan.pekerjaan_ayah || "",
            penghasilan_ayah: keluarga_beswan.penghasilan_ayah || "",
            nama_ibu: keluarga_beswan.nama_ibu || "",
            pekerjaan_ibu: keluarga_beswan.pekerjaan_ibu || "",
            penghasilan_ibu: keluarga_beswan.penghasilan_ibu || "",
            jumlah_saudara: keluarga_beswan.jumlah_saudara || "",
            tanggungan_keluarga: keluarga_beswan.tanggungan_keluarga || "",
          })
          
          showAlert("success", "Data Dimuat", "Data keluarga berhasil dimuat dari server.")
        } else {
          console.log('No keluarga_beswan data found')
          // Jika belum ada data, tidak perlu error
          showAlert("info", "Belum Ada Data", "Silakan isi form data keluarga.")
        }
      } else {
        // Get error details
        const errorData = await response.json()
        console.error('Error response:', errorData)
        
        if (response.status === 401) {
          showAlert("error", "Sesi Berakhir", "Silakan login kembali.")
          localStorage.removeItem('bersekolah_auth_token')
        } else if (response.status === 404) {
          showAlert("info", "Belum Ada Data", "Belum ada data keluarga yang tersimpan.")
        } else {
          showAlert("error", "Gagal Memuat Data", errorData.message || "Tidak dapat mengambil data keluarga dari server.")
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
      const response = await fetch(`${baseURL}/calon-beswan/keluarga`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(values)
      })

      const result = await response.json()
      console.log('Response:', result)

      if (response.ok) {
        showAlert("success", "Berhasil Disimpan", "Data keluarga berhasil disimpan ke database.")
      } else {
        // Debug: Log validation errors
        if (result.errors) {
          console.log('Validation errors:', result.errors)
          const errorMessages = Object.values(result.errors).flat().join(', ')
          showAlert("error", "Validasi Gagal", errorMessages)
        } else {
          showAlert("error", "Gagal Menyimpan", result.message || "Terjadi kesalahan saat menyimpan data.")
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      showAlert("error", "Kesalahan Jaringan", "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setIsSubmitting(false)
    }
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

  if (isLoading) {
    return (
      <>
        {/* Alert Notification */}
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
              <span>Memuat data keluarga...</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Alert Notification */}
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
          <h1 className="text-2xl font-bold tracking-tight">Data Keluarga</h1>
          <p className="text-muted-foreground">
            Lengkapi informasi data keluarga Anda untuk pendaftaran beasiswa
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Data Keluarga</CardTitle>
            <CardDescription>
              Informasi keluarga ini akan digunakan untuk proses seleksi beasiswa dan verifikasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <h3 className="text-lg font-medium">Data Orang Tua</h3>
                  </div>
                  <Separator className="my-2" />
                  
                  {/* Section: Data Ayah */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Ayah</h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Nama Ayah */}
                      <FormField
                        control={form.control}
                        name="nama_ayah"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Ayah</FormLabel>
                            <FormControl>
                              <Input placeholder="Masukkan nama lengkap ayah" {...field} />
                            </FormControl>
                            <FormDescription>
                              Sesuai dengan KTP/Kartu Identitas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pekerjaan Ayah */}
                      <FormField
                        control={form.control}
                        name="pekerjaan_ayah"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pekerjaan Ayah</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Karyawan Swasta, Wirausaha, PNS" {...field} />
                            </FormControl>
                            <FormDescription>
                              Pekerjaan utama saat ini
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Penghasilan Ayah */}
                      <FormField
                        control={form.control}
                        name="penghasilan_ayah"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Penghasilan Ayah (per bulan)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih rentang penghasilan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {opsiPenghasilan.map((penghasilan) => (
                                  <SelectItem key={penghasilan} value={penghasilan}>
                                    {penghasilan}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Estimasi rata-rata penghasilan per bulan
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section: Data Ibu */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-medium">Data Ibu</h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Nama Ibu */}
                      <FormField
                        control={form.control}
                        name="nama_ibu"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Ibu</FormLabel>
                            <FormControl>
                              <Input placeholder="Masukkan nama lengkap ibu" {...field} />
                            </FormControl>
                            <FormDescription>
                              Sesuai dengan KTP/Kartu Identitas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pekerjaan Ibu */}
                      <FormField
                        control={form.control}
                        name="pekerjaan_ibu"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pekerjaan Ibu</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Guru, Wirausaha, Ibu Rumah Tangga" {...field} />
                            </FormControl>
                            <FormDescription>
                              Pekerjaan utama saat ini
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Penghasilan Ibu */}
                      <FormField
                        control={form.control}
                        name="penghasilan_ibu"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Penghasilan Ibu (per bulan)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih rentang penghasilan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {opsiPenghasilan.map((penghasilan) => (
                                  <SelectItem key={penghasilan} value={penghasilan}>
                                    {penghasilan}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Estimasi rata-rata penghasilan per bulan
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section: Data Tambahan Keluarga */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      <h3 className="text-lg font-medium">Informasi Tambahan</h3>
                    </div>
                    <Separator className="my-2" />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Jumlah Saudara */}
                      <FormField
                        control={form.control}
                        name="jumlah_saudara"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jumlah Saudara Kandung</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih jumlah saudara" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {opsiJumlahSaudara.map((jumlah) => (
                                  <SelectItem key={jumlah} value={jumlah}>
                                    {jumlah}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Tidak termasuk diri Anda sendiri
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Jumlah Tanggungan */}
                      <FormField
                        control={form.control}
                        name="tanggungan_keluarga"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jumlah Tanggungan Keluarga</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih jumlah tanggungan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {opsiTanggunganKeluarga.map((jumlah) => (
                                  <SelectItem key={jumlah} value={jumlah}>
                                    {jumlah}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Termasuk orang tua, saudara yang masih dalam tanggungan
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Simpan Data Keluarga
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="px-6 py-3 border-t bg-gray-50">
            <p className="text-sm text-muted-foreground">
              <Info className="inline w-3 h-3 mr-1" /> Data keluarga ini dibutuhkan untuk pertimbangan pemberian beasiswa sesuai dengan{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Ketentuan Seleksi
              </a>{" "}
              Yayasan Bersekolah.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}