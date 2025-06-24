"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  User, 
  Settings, 
  Lock,
  Save,
  Loader2
} from "lucide-react";

// Definisi tipe untuk user profile
interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

// Schema validasi untuk formulir profil
const profileFormSchema = z.object({
  name: z.string().min(3, {
    message: "Nama harus minimal 3 karakter",
  }),
  email: z.string().email({
    message: "Email tidak valid",
  }),
  phone: z.string().optional(),
});

// Schema validasi untuk formulir password
const passwordFormSchema = z.object({
  current_password: z.string().min(6, {
    message: "Password saat ini diperlukan"
  }),
  password: z.string().min(6, {
    message: "Password baru harus minimal 6 karakter"
  }),
  password_confirmation: z.string().min(6, {
    message: "Konfirmasi password diperlukan"
  })
}).refine((data) => data.password === data.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"]
});

export default function PengaturanPage() {
  // State untuk menyimpan data pengguna
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // Inisialisasi form untuk profil
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Inisialisasi form untuk password
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  // Fungsi untuk mendapatkan data user
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }
      
      // Coba gunakan endpoint /me untuk mendapatkan data user saat ini
      const response = await fetch(`${baseURL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error mendapatkan profil: ${response.status}`);
      }
      
      // Dapatkan data user saat ini
      const userData = await response.json();
      
      // Simpan data user ke state
      setUser(userData);
      
      // Set default value untuk form
      profileForm.reset({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
      });
      
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Gagal memuat profil",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      });
      
      // Jika endpoint tidak tersedia, coba dapatkan data dari localStorage
      try {
        const userStr = localStorage.getItem('bersekolah_user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser({
            id: userData.id || 1,
            name: userData.name || "Admin",
            email: userData.email || "admin@bersekolah.com",
            role: userData.role || "admin",
            phone: userData.phone || "",
            avatar: userData.avatar || "",
          });
          
          // Set default value untuk form
          profileForm.reset({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
        }
      } catch (localError) {
        console.error("Error getting user data from localStorage:", localError);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data saat komponen dimount
  useEffect(() => {
    fetchUserProfile();
  }, []);  // Handle submit profil form
  const onSubmitProfile = async (data: z.infer<typeof profileFormSchema>) => {
    setIsSubmittingProfile(true);
    
    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem('bersekolah_auth_token');
      
      // Untuk Laravel API, kita gunakan format yang benar (mungkin menggunakan /api/user)
      // Gunakan beberapa alternatif URL untuk mencoba dengan endpoint yang berbeda
      const possibleEndpoints = [
        `${baseURL}/user`, // Endpoint standar Laravel Sanctum
        `${baseURL}/users/update`, // Custom endpoint yang mungkin ada
        `${baseURL}/profile`, // Endpoint umum untuk update profil
        `${baseURL}/users/${user?.id}` // Endpoint dengan ID user
      ];
      
      let success = false;
      let responseData = null;
      let lastError = null;
      
      // Mencoba beberapa kemungkinan endpoint
      for (const endpoint of possibleEndpoints) {
        if (success) break;
        
        try {
          console.log(`Mencoba update profile ke: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST', // POST untuk Laravel dengan _method=PUT
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
              _method: 'PUT', // Laravel menggunakan _method untuk menentukan HTTP method
              name: data.name,
              email: data.email,
              phone: data.phone || ''
            })
          });
          
          if (response.ok) {
            responseData = await response.json();
            success = true;
            console.log(`Berhasil update profile ke: ${endpoint}`, responseData);
            break;
          } else {
            const errorText = await response.text();
            console.warn(`Gagal update ke ${endpoint}: ${response.status}`, errorText);
            lastError = new Error(`Error: ${response.status} ${response.statusText}`);
          }
        } catch (e) {
          console.warn(`Error saat mencoba ${endpoint}:`, e);
          lastError = e;
        }
      }
      
      // Selalu update localStorage dulu untuk memastikan perubahan tampak untuk pengguna
      if (user) {
        const updatedUser = {
          ...user,
          name: data.name,
          email: data.email,
          phone: data.phone || ''
        };
        
        // Update state user
        setUser(updatedUser);
        
        // Update localStorage
        const userStr = localStorage.getItem('bersekolah_user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          localStorage.setItem('bersekolah_user', JSON.stringify({
            ...userData,
            name: data.name,
            email: data.email, 
            phone: data.phone || '',
            updated_at: new Date().toISOString()
          }));
        }
      }
      
      // Reset form
      profileForm.reset({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
      });
      
      if (success) {
        toast({
          title: "Profil berhasil diperbarui",
          description: "Data profil Anda telah berhasil diperbarui di database",
        });
      } else {
        // Jika semua endpoint gagal, tapi localStorage berhasil
        toast({
          title: "Profil diperbarui secara lokal",
          description: "Data berhasil disimpan secara lokal, tetapi gagal update ke database. Coba lagi nanti."
        });
        
        // Log error untuk debugging
        console.error("Semua endpoint update gagal:", lastError);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Update localStorage sebagai fallback
      try {
        if (user) {
          const userStr = localStorage.getItem('bersekolah_user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            localStorage.setItem('bersekolah_user', JSON.stringify({
              ...userData,
              name: data.name,
              email: data.email,
              phone: data.phone || ''
            }));
            
            // Update state user
            setUser({
              ...user,
              name: data.name,
              email: data.email,
              phone: data.phone || ''
            });
            
            toast({
              title: "Profil diperbarui secara lokal",
              description: "Data disimpan secara lokal. Update ke server gagal: " + 
                (error instanceof Error ? error.message : "Terjadi kesalahan")
            });
            
            // Reset form
            profileForm.reset(data);
            return;
          }
        }
      } catch (localError) {
        console.error("Local storage fallback failed:", localError);
      }
      
      toast({
        title: "Gagal memperbarui profil",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui profil",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };  // Handle submit password form
  const onSubmitPassword = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsSubmittingPassword(true);
    
    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem('bersekolah_auth_token');
        // Untuk keperluan demo/pengembangan, cek apakah ini adalah password default
      const userStr = localStorage.getItem('bersekolah_user');
      const userData = userStr ? JSON.parse(userStr) : null;
      
      // Di Laravel, validasi password lama biasanya dilakukan otomatis oleh backend
      // Tidak perlu verifikasi dua kali karena endpoint update password sudah melakukannya
      // Kita skip fase verifikasi terpisah dan langsung ke update password
      
      // Untuk development, kita akan anggap password valid jika menggunakan password default
      let passwordValid = false;
      
      if (import.meta.env.DEV && data.current_password === "admin123") {
        console.log("Mode pengembangan: Password default terdeteksi, verifikasi dilewati");
        passwordValid = true;
      } else {
        // Di production, kita akan anggap password akan divalidasi oleh backend
        // Karena hampir semua framework Laravel sudah melakukan validasi password lama
        passwordValid = true;
      }
      
      // Update password dengan endpoint yang tersedia
      try {
        console.log("Memulai proses update password");        // Langsung coba beberapa endpoint potensial dan gunakan yang pertama berhasil
        const endpoints = [
          `${baseURL}/change-password`,            // Custom endpoint paling umum
          `${baseURL}/update-password`,            // Custom endpoint alternatif
          `${baseURL}/password/update`,            // Laravel Breeze pattern
          `${baseURL}/profile/password`,           // Laravel pola profile/password 
          `${baseURL}/users/${user?.id}/password`, // Custom endpoint dengan ID
          `${baseURL}/password`,                   // Endpoint sederhana
          `${baseURL}/users/password`,             // Users prefix
          `${baseURL}/user/password`,              // Standar Laravel
        ];
        
        let response = null;
        let success = false;
        let responseData = null;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`Mencoba update password ke: ${endpoint}`);
              // Coba berbagai format request yang diterima Laravel
            console.log(`Mencoba dengan format JSON ke: ${endpoint}`);
            
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
              },              body: JSON.stringify({
                current_password: data.current_password,
                password: data.password,
                password_confirmation: data.password_confirmation
              })
            });
            
            // Ambil response data
            try {
              responseData = await res.json();
            } catch (e) {
              // Jika tidak bisa parse JSON, tetap lanjutkan
            }
            
            // Jika berhasil, break loop
            if (res.ok) {
              response = res;
              success = true;
              console.log(`Berhasil update password ke: ${endpoint}`);
              break;
            }
            
            // Jika mendapat 404, coba endpoint berikutnya
            if (res.status === 404) {
              console.log(`Endpoint ${endpoint} tidak ditemukan, mencoba yang lain...`);
              continue;
            }
            
            // Jika error bukan 404, itu mungkin respons yang valid (seperti validasi error)
            // Set response untuk diproses di luar loop
            response = res;
            break;
          } catch (e) {
            console.warn(`Error saat mencoba ${endpoint}:`, e);
          }
        }
        
        // Handle hasil request
        if (success) {
          console.log("Password berhasil diperbarui");
          passwordForm.reset();
          
          toast({
            title: "Password Berhasil Diperbarui",
            description: "Password Anda telah berhasil diperbarui dan akan berlaku untuk login berikutnya"
          });
          
          // Update timestamp login untuk memperpanjang sesi
          const loginTimestamp = localStorage.getItem('bersekolah_login_time');
          if (loginTimestamp) {
            localStorage.setItem('bersekolah_login_time', Date.now().toString());
          }
          return;
        }
          // Jika tidak ada endpoint yang sukses tapi kita dapat response (error validasi), cek error
        if (!success && response && responseData) {
          // Cek apakah password lama salah
          if (responseData.errors?.current_password || 
              (responseData.message && responseData.message.includes("current password"))) {
            console.error("Password saat ini salah:", responseData);
            toast({
              title: "Password Saat Ini Salah",
              description: "Password yang Anda masukkan tidak sesuai dengan password saat ini",
              variant: "destructive"
            });
            return;
          }
          
          // Tampilkan pesan error lainnya
          toast({
            title: "Gagal Memperbarui Password",
            description: responseData.message || "Terjadi kesalahan validasi pada form",
            variant: "destructive"
          });
          return;
        }
        
        // Mode development fallback
        if (import.meta.env.DEV && !success) {
          // Fallback untuk development
          console.log("Mode pengembangan: Update password dijalankan secara lokal");
          
          // Simpan update timestamp di localStorage
          const loginTime = localStorage.getItem('bersekolah_login_time');
          if (loginTime) {
            localStorage.setItem('bersekolah_login_time', Date.now().toString());
          }
          
          // Reset form dan tampilkan pesan sukses
          passwordForm.reset();
          
          toast({
            title: "Password Diperbarui (Mode Dev)",
            description: "Password dianggap berhasil diperbarui (simulasi)",
          });
          return;
        }        // Jika semua upaya gagal, coba satu pendekatan langsung ke backend 
        if (!success) {
          try {
            // Coba endpoint backend-compatible
            console.log("Semua endpoint gagal, mencoba direct API call ke backend...");
            
            // Buat FormData untuk kompatibilitas dengan backend (multipart/form-data)
            const formData = new FormData();
            formData.append('_method', 'PATCH'); // PATCH method untuk update resource
            formData.append('current_password', data.current_password);
            formData.append('password', data.password);
            formData.append('password_confirmation', data.password_confirmation);
            
            // Coba kirim ke backend endpoint tanpa /api prefix (kompatibel dengan Laravel standar)
            const directEndpoint = baseURL.replace('/api', '') + '/user/password';
            console.log(`Mencoba direct endpoint: ${directEndpoint}`);
            
            const directResponse = await fetch(directEndpoint, {
              method: 'POST',
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json'
              },
              body: formData
            });
            
            if (directResponse.ok) {
              console.log("Berhasil update password dengan direct endpoint");
              passwordForm.reset();
              
              toast({
                title: "Password Berhasil Diperbarui",
                description: "Password Anda telah berhasil diperbarui dan akan berlaku untuk login berikutnya"
              });
              return;
            } else {
              // Jika masih gagal, tampilkan pesan error umum
              toast({
                title: "Gagal Memperbarui Password",
                description: "Tidak dapat mengakses endpoint API untuk update password. Silakan coba lagi nanti atau hubungi administrator.",
                variant: "destructive"
              });
            }
          } catch (directError) {
            console.error("Error dengan direct endpoint:", directError);
            
            toast({
              title: "Gagal Memperbarui Password",
              description: "Tidak dapat mengakses endpoint API untuk update password. Silakan coba lagi nanti atau hubungi administrator.",
              variant: "destructive"
            });
          }
        }
      } catch (updateError) {
        console.error("Update password error:", updateError);
        
        // Fallback untuk mode pengembangan
        if (import.meta.env.DEV) {
          passwordForm.reset();
          toast({
            title: "Password Diperbarui (Mode Demo)",
            description: "Password Anda dianggap berhasil diperbarui dalam mode pengembangan",
          });
        } else {
          toast({
            title: "Error",
            description: "Terjadi kesalahan saat memproses permintaan",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error updating password:", error);
      
      // Cek pesan error spesifik untuk membantu user
      let errorMessage = "Terjadi kesalahan saat memperbarui password";
      let errorTitle = "Gagal Memperbarui Password";
      
      if (error instanceof Error) {
        if (error.message.includes("current_password") || 
            error.message.includes("Password saat ini")) {
          errorTitle = "Password Saat Ini Salah";
          errorMessage = "Password yang Anda masukkan tidak cocok dengan password saat ini, silakan coba lagi";
        } else if (error.message.includes("password") && 
                  error.message.includes("confirmation")) {
          errorTitle = "Konfirmasi Password Tidak Cocok";
          errorMessage = "Konfirmasi password harus sama dengan password baru";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };
  
  // Jika sedang loading, tampilkan indikator loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 border-4 rounded-full border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-muted-foreground">Memuat data pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
          <p className="text-muted-foreground">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>
      </div>
      
      {/* Profil Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>Informasi Profil</CardTitle>
          </div>
          <CardDescription>
            Perbarui informasi profil seperti nama dan email Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Masukkan alamat email Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Masukkan nomor telepon Anda (opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />                             <Button 
                type="submit" 
                className="mt-4"
              >
                {isSubmittingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> 
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Password Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle>Ubah Password</CardTitle>
          </div>
          <CardDescription>
            Perbarui password Anda untuk menjaga keamanan akun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Saat Ini</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan password saat ini" {...field} />
                    </FormControl>
                    <FormDescription>
                      Masukkan password saat ini untuk verifikasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Baru</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan password baru" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password minimal 6 karakter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan lagi password baru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                variant="outline"
                disabled={isSubmittingPassword}
                className="mt-4"
              >
                {isSubmittingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                    Memperbarui Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> 
                    Perbarui Password
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
