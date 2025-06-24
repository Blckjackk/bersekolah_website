import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  // State untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // State untuk form data
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  
  // State untuk error
  const [errors, setErrors] = useState<Record<string, string>>({})
  // ✅ ADDED: General error state
  const [generalError, setGeneralError] = useState<string>("")

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
    
    // ✅ ADDED: Clear general error saat user mulai mengetik
    if (generalError) {
      setGeneralError("")
    }
  }

  // Toggle visibilitas password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    // ✅ ADDED: Clear general error saat submit
    setGeneralError("")
    
    // ✅ FIXED: Gunakan URL lengkap API atau fallback ke URL default
    // Pastikan ini sesuai dengan alamat API Laravel Anda
    const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    console.log("Base URL yang digunakan:", baseURL);
    
    try {
      console.log("Mengirim data login:", { email: formData.email });
      console.log("API URL:", `${baseURL}/login`);
      
      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      // ✅ FIXED: Tambahkan handling untuk response yang bukan JSON
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log("Response dari server:", result);
      } else {
        const text = await response.text();
        console.log("Response bukan JSON:", text.substring(0, 100) + "...");
        throw new Error("Server mengembalikan respons yang bukan JSON");
      }
      
      if (response.ok) {
        // Simpan token ke localStorage dengan prefix bersekolah_
        if (result.token) {
          localStorage.setItem('bersekolah_auth_token', result.token);
          console.log("Token berhasil disimpan:", result.token);
        }
        
        // ✅ FIXED: Simpan data user dengan role ke localStorage
        if (result.user) {
          // Pastikan role tersimpan dengan benar
          const userDataWithRole = {
            ...result.user,
            role: result.user.role || 'user' // Default role jika tidak ada
          };
          
          localStorage.setItem('bersekolah_user', JSON.stringify(userDataWithRole));
          console.log("User data dengan role berhasil disimpan:", userDataWithRole);
        }
          // Simpan timestamp login dengan prefix bersekolah_
        localStorage.setItem('bersekolah_login_time', Date.now().toString());
        console.log("Login timestamp berhasil disimpan");
        
        // Force a refresh of user data in NavUser component
        // Create or update a custom event to refresh user data
        try {
          window.dispatchEvent(new CustomEvent('bersekolah:login-success', {
            detail: {
              user: userDataWithRole,
              timestamp: Date.now()
            }
          }));
          console.log("Custom event untuk refresh user data telah dipancarkan");
        } catch (e) {
          console.error("Error dispatching login event:", e);
        }
        
        toast({
          title: "Login berhasil",
          description: `Selamat datang kembali, ${result.user?.name || 'User'}!`,
          duration: 3000,
        })
        
        // Redirect ke halaman yang sesuai berdasarkan role
        setTimeout(() => {
          const role = result.user?.role?.toLowerCase() || "user";
          
          // Admin dan superadmin diarahkan ke dashboard
          let redirectUrl;
          if (role === "admin" || role === "superadmin") {
            redirectUrl = "/dashboard";
            console.log(`Melakukan redirect ke Dashboard Admin sebagai ${role}`);
          } else {
            redirectUrl = "/form-pendaftaran";
            console.log("Melakukan redirect ke Form Pendaftaran sebagai user biasa");
          }
          
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        // ✅ IMPROVED: Better error handling untuk different HTTP status codes
        console.log("Login gagal dengan status:", response.status);
        
        if (response.status === 401) {
          // Unauthorized - email/password salah
          setGeneralError("Email atau kata sandi yang Anda masukkan salah.");
          setErrors({ 
            email: "Periksa kembali email Anda",
            password: "Periksa kembali kata sandi Anda"
          });
        } else if (response.status === 422 && result.errors) {
          // Validation errors dari server
          const formattedErrors: Record<string, string> = {}
          Object.entries(result.errors).forEach(([key, messages]) => {
            formattedErrors[key] = Array.isArray(messages) ? messages[0] : messages
          })
          setErrors(formattedErrors)
          setGeneralError("Mohon periksa kembali data yang Anda masukkan.");
        } else if (response.status === 500) {
          // Server error
          setGeneralError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
        } else {
          // Other errors
          setGeneralError(result.message || "Terjadi kesalahan saat login. Silakan coba lagi.");
        }
        
        toast({
          title: "Login gagal",
          description: generalError || result.message || "Email atau password salah",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error saat submit:", error);
      
      // ✅ IMPROVED: Debug lebih detail tentang error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error("Network error:", error.message);
        setGeneralError("Tidak dapat terhubung ke server API. Pastikan server Laravel Anda berjalan di http://localhost:8000.");
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("JSON parse error:", error.message);
        setGeneralError("Server mengembalikan data dalam format yang tidak valid. Pastikan API mengembalikan JSON yang valid.");
      } else {
        setGeneralError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      }
      
      toast({
        title: "Login gagal",
        description: "Tidak dapat terhubung ke server",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Masuk ke Akun</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Masukkan email dan password untuk melanjutkan
        </p>
      </div>
      
      {/* ✅ ADDED: General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="contoh@email.com" 
            required 
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <div className="relative">
            <Input 
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required 
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
            />
            <button
              type="button"
              className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              </span>
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Masuk..." : "Masuk"}
        </Button>
      </div>      <div className="flex flex-col gap-2 text-sm text-center">
        <div>
          <a href="/lupa-password" className="text-muted-foreground hover:text-foreground">
            Lupa kata sandi?
          </a>
        </div>
        <div>
          Belum memiliki akun?{" "}
          <a href="/daftar" className="underline underline-offset-4">
            Daftar sekarang
          </a>
        </div>
      </div>
    </form>
  )
}
