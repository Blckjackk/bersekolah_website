import { ArrowLeft, GalleryVerticalEnd } from "lucide-react"
import { useEffect, useState } from "react"
import { LoginForm } from "@/component/masuk/login-form"
import { Button } from "@/components/ui/button"

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
          window.location.href = previousPage;        } else {
          // Jika tidak ada halaman sebelumnya, redirect ke home atau dashboard
          try {
            const userData = JSON.parse(user);
            const role = userData.role?.toLowerCase() || "user";
            window.location.href = (role === "admin" || role === "superadmin") ? "/dashboard" : "/form-pendaftaran";
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
        localStorage.removeItem('bersekolah_auth_token');
        localStorage.removeItem('bersekolah_user');
        localStorage.removeItem('bersekolah_login_time');
      }
      
      // Tampilkan halaman login
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);
  // Tampilkan loading indicator selama pengecekan
  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 border-4 rounded-full border-primary/20 border-t-primary animate-spin"></div>
          <div>
            <h3 className="text-lg font-medium">Memeriksa status login...</h3>
            <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
        
        <div className="mt-6 text-sm text-center text-muted-foreground">
          <p>Dengan masuk, Anda menyetujui <a href="/terms" className="underline underline-offset-4 hover:text-foreground">Ketentuan Layanan</a> dan <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">Kebijakan Privasi</a> kami.</p>
        </div>
      </div>      <div className="relative hidden bg-muted lg:block">
        <img
          src="/storage/ProgramBeasiswa.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute max-w-md text-white bottom-8 left-8">
          <h2 className="mb-2 text-2xl font-bold">Masa Depan Cerah Dimulai Dari Sini</h2>
          <p>Berikan kesempatan pendidikan terbaik untuk mereka yang membutuhkan melalui program beasiswa Bersekolah.</p>
        </div>
      </div>
    </div>
  )
}
