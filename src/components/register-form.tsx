import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  // State untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // State untuk form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: ""
  })
  
  // State untuk error
  const [errors, setErrors] = useState<Record<string, string>>({})
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
    
    // Clear general error
    if (generalError) {
      setGeneralError("")
    }
  }

  // Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi"
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Nomor telepon harus 10-15 digit"
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter"
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password wajib diisi"
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password tidak cocok"
    }

    return newErrors
  }

  // Toggle visibilitas password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Toggle visibilitas konfirmasi password
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGeneralError("")
    
    // Client-side validation
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      toast({
        title: "Data tidak valid",
        description: "Mohon periksa kembali data yang Anda masukkan",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    
    try {
      console.log("🚀 Mengirim data registrasi:", {
        ...formData,
        password: '***',
        password_confirmation: '***'
      });
      
      const result = await authService.register(formData);
      console.log("✅ Registrasi berhasil:", result);
      
      // ✅ FIXED: Simpan token ke localStorage dengan prefix bersekolah_
      if (result.token) {
        localStorage.setItem('bersekolah_auth_token', result.token);
        console.log("✅ Token berhasil disimpan");
      }
      
      // ✅ FIXED: Simpan data user dengan role ke localStorage
      if (result.user) {
        // Pastikan role tersimpan dengan benar
        const userDataWithRole = {
          ...result.user,
          role: result.user.role || 'user' // Default role jika tidak ada
        };
        
        localStorage.setItem('bersekolah_user', JSON.stringify(userDataWithRole));
        console.log("✅ User data dengan role berhasil disimpan:", userDataWithRole);
      }
      
      // Simpan timestamp login dengan prefix bersekolah_
      localStorage.setItem('bersekolah_login_time', Date.now().toString());
      
      toast({
        title: "Pendaftaran berhasil! 🎉",
        description: `Selamat datang, ${result.user?.name || 'User'}!`,
        duration: 3000,
      })
        // ✅ FIXED: Redirect berdasarkan role user
      setTimeout(() => {
        const role = result.user?.role?.toLowerCase() || "user";
        // Admin dan superadmin diarahkan ke dashboard
        const redirectUrl = (role === "admin" || role === "superadmin") ? "/dashboard" : "/form-pendaftaran";
        console.log("🔄 Melakukan redirect ke", redirectUrl, "berdasarkan role:", role);
        window.location.href = redirectUrl;
      }, 1500);
      
    } catch (error: any) {
      console.error("❌ Error saat submit:", error);
      
      // ✅ IMPROVED: Better error handling untuk validation errors dari server
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('email') && error.message.includes('sudah')) {
          setErrors({ email: "Email sudah terdaftar, gunakan email lain" });
        } else if (error.message.includes('phone') && error.message.includes('sudah')) {
          setErrors({ phone: "Nomor telepon sudah terdaftar, gunakan nomor lain" });
        } else if (error.message.includes('Validation failed:')) {
          const errorMsg = error.message.replace('Validation failed: ', '');
          setGeneralError(errorMsg);
        } else if (error.message.includes('tidak dapat terhubung')) {
          setGeneralError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
        } else {
          setGeneralError(error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
        }
      } else {
        setGeneralError("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      }
      
      toast({
        title: "Pendaftaran gagal",
        description: error.message || "Terjadi kesalahan saat mendaftar",
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
        <h1 className="text-2xl font-bold">Daftar Akun Baru</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Lengkapi data di bawah untuk membuat akun baru
        </p>
      </div>

      {/* General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input 
            id="name" 
            name="name" 
            type="text" 
            placeholder="Nama lengkap Anda" 
            required 
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        
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
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input 
            id="phone" 
            name="phone" 
            type="tel" 
            placeholder="08xxxxxxxxxx" 
            required 
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <div className="relative">
            <Input 
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
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
        
        <div className="grid gap-2">
          <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
          <div className="relative">
            <Input 
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi"
              required 
              value={formData.password_confirmation}
              onChange={handleChange}
              className={errors.password_confirmation ? "border-red-500" : ""}
            />
            <button
              type="button"
              className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
              onClick={toggleConfirmPasswordVisibility}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
              </span>
            </button>
          </div>
          {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Mendaftar..." : "Daftar"}
        </Button>
      </div>
      
      <div className="text-sm text-center">
        Sudah memiliki akun?{" "}
        <a href="/masuk" className="underline underline-offset-4">
          Masuk
        </a>
      </div>
    </form>
  )
}