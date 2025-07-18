import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ResetPasswordForm({
  className
}: {
  className?: string
}) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // State untuk form data
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    passwordConfirmation: ""
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
    
    // Clear general error saat user mulai mengetik
    if (generalError) {
      setGeneralError("")
    }
  }

  // Handle step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGeneralError("")
    
    const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    
    try {
      // Request OTP ke email
      const response = await fetch(`${baseURL}/password/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      })
      
      // Handle response
      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error("Server mengembalikan respons yang bukan JSON");
      }
      
      if (response.ok) {
        toast({
          title: "Kode verifikasi terkirim",
          description: "Kami telah mengirimkan kode verifikasi ke email Anda. Silakan cek inbox atau folder spam Anda.",
          duration: 5000,
        });
        // Lanjut ke step 2: OTP verification
        setStep(2);
      } else {
        if (response.status === 404) {
          setErrors({ email: "Email tidak terdaftar dalam sistem kami." });
        } else if (response.status === 422 && result.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([key, messages]) => {
            formattedErrors[key] = Array.isArray(messages) ? messages[0] as string : messages as string;
          });
          setErrors(formattedErrors);
        } else {
          setGeneralError(result.message || "Terjadi kesalahan saat mengirim kode verifikasi.");
        }
      }
    } catch (error) {
      console.error("Error saat request OTP:", error);
      setGeneralError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }
  
  // Handle step 2: Verify OTP and reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGeneralError("")
    
    // Validasi password match
    if (formData.password !== formData.passwordConfirmation) {
      setErrors({ passwordConfirmation: "Konfirmasi kata sandi tidak cocok" });
      setIsLoading(false);
      return;
    }
    
    const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    
    try {
      // Reset password dengan OTP
      const response = await fetch(`${baseURL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          token: formData.otp,
          password: formData.password,
          password_confirmation: formData.passwordConfirmation
        })
      })
      
      // Handle response
      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error("Server mengembalikan respons yang bukan JSON");
      }
      
      if (response.ok) {
        toast({
          title: "Kata sandi berhasil diubah",
          description: "Kata sandi Anda telah berhasil diubah. Silakan login dengan kata sandi baru Anda.",
          duration: 5000,
        });
        
        // Redirect ke halaman login
        setTimeout(() => {
          window.location.href = "/masuk";
        }, 2000);
      } else {
        if (response.status === 422 && result.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([key, messages]) => {
            formattedErrors[key] = Array.isArray(messages) ? messages[0] as string : messages as string;
          });
          setErrors(formattedErrors);
        } else if (response.status === 400) {
          setErrors({ otp: "Kode verifikasi tidak valid atau telah kedaluwarsa." });
        } else {
          setGeneralError(result.message || "Terjadi kesalahan saat mengatur ulang kata sandi.");
        }
      }
    } catch (error) {
      console.error("Error saat reset password:", error);
      setGeneralError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");    } finally {
      setIsLoading(false);
    }
  }
    return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Atur Ulang Kata Sandi</h1>
        <p className="text-sm text-balance text-muted-foreground">
          {step === 1
            ? "Masukkan email Anda untuk menerima kode verifikasi"
            : "Masukkan kode verifikasi dan kata sandi baru Anda"
          }
        </p>
      </div>
      
      {/* General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="grid gap-5">
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
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Mengirim..." : "Kirim Kode Verifikasi"}
          </Button>
            <div className="text-sm text-center">
            <a href="/masuk" className="text-sm text-muted-foreground hover:text-foreground">
              Kembali ke halaman masuk
            </a>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="otp">Kode Verifikasi</Label>
            <Input 
              id="otp" 
              name="otp" 
              type="text" 
              placeholder="Masukkan kode verifikasi" 
              required 
              value={formData.otp}
              onChange={handleChange}
              className={errors.otp ? "border-red-500" : ""}
            />
            {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password">Kata Sandi Baru</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Minimal 8 karakter" 
              required 
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
              minLength={8}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="passwordConfirmation">Konfirmasi Kata Sandi</Label>
            <Input 
              id="passwordConfirmation" 
              name="passwordConfirmation" 
              type="password" 
              placeholder="Ketik ulang kata sandi baru" 
              required 
              value={formData.passwordConfirmation}
              onChange={handleChange}
              className={errors.passwordConfirmation ? "border-red-500" : ""}
            />
            {errors.passwordConfirmation && (
              <p className="mt-1 text-xs text-red-500">{errors.passwordConfirmation}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
          </Button>
          
          <div className="flex justify-between text-sm">
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="text-muted-foreground hover:text-foreground"
            >
              Kembali
            </button>
            <button 
              type="button"
              onClick={handleRequestOTP}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              Kirim Ulang Kode
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
