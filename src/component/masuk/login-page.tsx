import { GalleryVerticalEnd } from "lucide-react"
import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cek status login berdasarkan localStorage
    const checkAuthStatus = () => {
      const token = localStorage.getItem('bersekolah_auth_token');
      const user = localStorage.getItem('bersekolah_user');
      
      // Jika ada token dan user data, berarti sudah login
      if (token && user) {
        console.log("User sudah login, mengalihkan ke halaman sebelumnya");
        
        // Cek apakah ada halaman sebelumnya
        const previousPage = document.referrer;
        
        // Jika ada halaman sebelumnya dan bukan halaman login/register, kembali ke sana
        if (previousPage && !previousPage.includes('/masuk') && !previousPage.includes('/daftar')) {
          window.location.href = previousPage;
        } else {
          // Jika tidak ada halaman sebelumnya, redirect ke home atau dashboard
          try {
            const userData = JSON.parse(user);
            const role = userData.role?.toLowerCase() || "user";
            window.location.href = role === "admin" ? "/dashboard" : "/form-pendaftaran";
          } catch (error) {
            console.error("Error parsing user data:", error);
            window.location.href = "/";
          }
        }
        return;
      }
      
      // Jika hanya ada salah satu (token atau user), hapus keduanya
      if (token || user) {
        console.log("Data login tidak lengkap, menghapus data yang tersimpan");
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('login_time');
      }
      
      // Tampilkan halaman login
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Tampilkan loading indicator selama pengecekan
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-xs">
          <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="assets/image/cute-asian-little-girl-playing-with-coins-money-child-hand-holding-money-kid-saving-money-into-piggy-bank-child-counting-his-saved-coins-children-learning-about-future-concept.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
