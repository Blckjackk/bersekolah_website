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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  User, 
  Settings, 
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  XCircle
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

  // Toast notification state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success"
  });

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

  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 5000);
  };

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
      showToast("Gagal memuat data profil", "error");
      
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
      if (!token) {
        showToast("Token tidak ditemukan. Silakan login kembali.", "error");
        return;
      }
      
      // Gunakan endpoint yang benar untuk update profile
      const endpoint = `${baseURL}/admin/profile`;
      
      console.log(`Mencoba update profile ke: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || ''
        })
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('Berhasil update profile:', responseData);
        
        // Update state user
        if (user) {
          const updatedUser = {
            ...user,
            name: data.name,
            email: data.email,
            phone: data.phone || ''
          };
          setUser(updatedUser);
        }
        
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
        
        // Reset form
        profileForm.reset({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        });
        
        showToast("Profil berhasil diperbarui", "success");
      } else {
        // Handle error response
        console.error('Gagal update profile:', responseData);
        
        let errorMessage = "Terjadi kesalahan saat memperbarui profil";
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.errors) {
          // Handle validation errors
          const errorKeys = Object.keys(responseData.errors);
          if (errorKeys.length > 0) {
            errorMessage = responseData.errors[errorKeys[0]][0];
          }
        }
        
        showToast("Gagal memperbarui profil", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      showToast("Gagal memperbarui profil", "error");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Handle submit password form
  const onSubmitPassword = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsSubmittingPassword(true);
    
    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        showToast("Error", "error");
        return;
      }
      
      // Gunakan endpoint yang benar untuk update password
      const endpoint = `${baseURL}/admin/change-password`;
      
      console.log("Memulai proses update password");
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          current_password: data.current_password,
          password: data.password,
          password_confirmation: data.password_confirmation
        })
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log("Password berhasil diperbarui:", responseData);
        
        // Reset form
        passwordForm.reset();
        
        showToast("Password Berhasil Diperbarui", "success");
        
        // Update timestamp login untuk memperpanjang sesi
        const loginTimestamp = localStorage.getItem('bersekolah_login_time');
        if (loginTimestamp) {
          localStorage.setItem('bersekolah_login_time', Date.now().toString());
        }
      } else {
        // Handle error response
        console.error('Gagal update password:', responseData);
        
        let errorMessage = "Terjadi kesalahan saat memperbarui password";
        let errorTitle = "Gagal Memperbarui Password";
        
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.errors) {
          // Handle validation errors
          if (responseData.errors.current_password) {
            errorTitle = "Password Saat Ini Salah";
            errorMessage = "Password yang Anda masukkan tidak sesuai dengan password saat ini";
          } else if (responseData.errors.password) {
            errorMessage = responseData.errors.password[0];
          } else if (responseData.errors.password_confirmation) {
            errorTitle = "Konfirmasi Password Tidak Cocok";
            errorMessage = "Konfirmasi password harus sama dengan password baru";
          } else {
            const errorKeys = Object.keys(responseData.errors);
            if (errorKeys.length > 0) {
              errorMessage = responseData.errors[errorKeys[0]][0];
            }
          }
        }
        
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      
      showToast("Terjadi kesalahan saat memperbarui password", "error");
    } finally {
      setIsSubmittingPassword(false);
    }
  };
  
  // Jika sedang loading, tampilkan indikator loading
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center p-8">
        <div className="w-16 h-16 rounded-full border-4 animate-spin border-primary/20 border-t-primary"></div>
        <p className="text-muted-foreground">Memuat data pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 mx-auto space-y-6">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
          toast.type === "success" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
        }`}>
          <div className="flex gap-2 items-center">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={toast.type === "success" ? "text-green-800" : "text-red-800"}>
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
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
          <div className="flex gap-2 items-center">
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
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" /> 
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" /> 
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
          <div className="flex gap-2 items-center">
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
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" /> 
                    Memperbarui Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 w-4 h-4" /> 
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
