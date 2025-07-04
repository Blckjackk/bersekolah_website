"use client"

import React, { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Loader2, XCircle, Info, X, Save } from "lucide-react"

// Define form schema
const formSchema = z.object({
  alamat: z.string().min(10, {
    message: "Alamat harus diisi minimal 10 karakter",
  }),
  rt: z.string().min(1, { message: "RT harus diisi" }),
  rw: z.string().min(1, { message: "RW harus diisi" }),
  kelurahan: z.string().min(3, { message: "Kelurahan harus diisi" }),
  kecamatan: z.string().min(3, { message: "Kecamatan harus diisi" }),
  kota: z.string().min(3, { message: "Kota/Kabupaten harus diisi" }),
  provinsi: z.string().min(3, { message: "Provinsi harus diisi" }),
  kode_pos: z.string().min(5, { message: "Kode pos harus diisi" }),
  nomor_telepon: z.string().min(10, {
    message: "Nomor telepon harus diisi dengan benar (minimal 10 digit)",
  }).max(15, {
    message: "Nomor telepon tidak valid (maksimal 15 digit)",
  }),
  email: z.string().email({ message: "Email tidak valid" }),
  telepon_darurat: z.string().min(10, {
    message: "Nomor telepon darurat harus diisi dengan benar (minimal 10 digit)",
  }).max(15, {
    message: "Nomor telepon darurat tidak valid (maksimal 15 digit)",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function AlamatPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Default form values
  const defaultValues: Partial<FormValues> = {
    alamat: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    kode_pos: "",
    nomor_telepon: "",
    email: "",
    telepon_darurat: "",
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
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

  // Fetch data alamat saat component mount
  useEffect(() => {
    fetchDataAlamat()
  }, [])

  const fetchDataAlamat = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        showAlert("error", "Error", "Token tidak ditemukan. Silakan login kembali.")
        return
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      console.log('Fetching from:', `${baseURL}/calon-beswan/alamat`)
      
      const response = await fetch(`${baseURL}/calon-beswan/alamat`, {
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
        
        // Populate form dengan data yang ada dari alamat_beswan
        const { alamat_beswan } = result.data
        
        if (alamat_beswan) {
          console.log('Alamat beswan data found:', alamat_beswan)
          form.reset({
            alamat: alamat_beswan.alamat || "",
            rt: alamat_beswan.rt || "",
            rw: alamat_beswan.rw || "",
            kelurahan: alamat_beswan.kelurahan || "",
            kecamatan: alamat_beswan.kecamatan || "",
            kota: alamat_beswan.kota || "",
            provinsi: alamat_beswan.provinsi || "",
            kode_pos: alamat_beswan.kode_pos || "",
            nomor_telepon: alamat_beswan.nomor_telepon || "",
            email: alamat_beswan.email || "",
            telepon_darurat: alamat_beswan.telepon_darurat || "",
          })
          
          showAlert("success", "Data Dimuat", "Data alamat berhasil dimuat dari server.")
        } else {
          console.log('No alamat_beswan data found')
          showAlert("info", "Belum Ada Data", "Silakan isi form data alamat.")
        }
      } else {
        // Get error details
        const errorData = await response.json()
        console.error('Error response:', errorData)
        
        if (response.status === 401) {
          showAlert("error", "Sesi Berakhir", "Silakan login kembali.")
          localStorage.removeItem('bersekolah_auth_token')
        } else if (response.status === 404) {
          showAlert("info", "Belum Ada Data", "Belum ada data alamat yang tersimpan.")
        } else {
          showAlert("error", "Gagal Memuat Data", errorData.message || "Tidak dapat mengambil data alamat dari server.")
        }
      }
    } catch (error) {
      console.error('Network error:', error)
      showAlert("error", "Kesalahan Jaringan", "Terjadi kesalahan saat menghubungi server. Periksa koneksi internet Anda.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler untuk submit form
  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        showAlert("error", "Error", "Token tidak ditemukan. Silakan login kembali.")
        return
      }

      console.log('Data yang akan dikirim:', data)

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      console.log('Posting to:', `${baseURL}/calon-beswan/alamat`)
      
      const response = await fetch(`${baseURL}/calon-beswan/alamat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      })

      console.log('Submit response status:', response.status)
      const result = await response.json()
      console.log('Submit response data:', result)

      if (response.ok) {
        showAlert("success", "Berhasil Disimpan", "Data alamat berhasil disimpan.")
      } else {
        // Handle different error types
        if (response.status === 422) {
          // Validation errors
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

  // Provinsi di Indonesia (untuk dropdown)
  const provinsiIndonesia = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan", 
    "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta", 
    "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali", 
    "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", 
    "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", 
    "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", 
    "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan",
    "Papua Tengah", "Papua Pegunungan"
  ]

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
              <span>Memuat data alamat...</span>
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

      <Card className="w-full bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Alamat & Kontak</CardTitle>
          <CardDescription>
            Lengkapi data alamat dan kontak Anda untuk keperluan komunikasi dan administrasi beasiswa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Masukkan alamat lengkap Anda" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Masukkan alamat lengkap tempat tinggal Anda (nama jalan, nomor rumah, dll).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RT</FormLabel>
                      <FormControl>
                        <Input placeholder="001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RW</FormLabel>
                      <FormControl>
                        <Input placeholder="002" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kelurahan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelurahan/Desa</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan kelurahan/desa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kecamatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kecamatan</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan kecamatan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kota/Kabupaten</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan kota/kabupaten" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provinsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provinsi</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih provinsi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {provinsiIndonesia.map((provinsi) => (
                            <SelectItem key={provinsi} value={provinsi}>
                              {provinsi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kode_pos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan kode pos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomor_telepon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: 081234567890" 
                        type="tel"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nomor telepon aktif yang dapat dihubungi (diutamakan WhatsApp).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telepon_darurat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon Darurat</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 081234567890 (Orang tua, wali, dll)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Kontak yang dapat dihubungi jika terjadi keadaan darurat.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="contoh@email.com" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Email aktif yang sering Anda cek.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Simpan Data Alamat
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}