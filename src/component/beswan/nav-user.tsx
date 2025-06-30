"use client"
import {
  UserCog,
  PanelsTopLeft,
  ChevronsUpDown,
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  Loader2
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/contexts/SidebarContext"

// Interface untuk tipe data user
interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  nama_lengkap?: string;
}

// Data default user jika localStorage kosong
const defaultUser: User = {
  name: "Guest User",
  email: "guest@example.com",
  role: "guest",
  avatar: "/storage/users/default-avatar.jpg",
};

export function NavUser() {
  const { isOpen } = useSidebar()
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Coba load user dari localStorage saat inisialisasi
  useEffect(() => {
    try {
      const cachedUser = localStorage.getItem('bersekolah_user');
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        if (parsedUser && parsedUser.name && parsedUser.email) {
          console.log("Menggunakan cached user data untuk tampilan awal:", parsedUser);
          setUser(parsedUser);
        }
      }
    } catch (e) {
      console.error("Error parsing cached user data during init:", e);
    }
  }, []);
    // Fetch data user dari API
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      
      if (!token) {
        console.log("Tidak ada token, menggunakan data default");
        setIsLoading(false);
        return;
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL;
      console.log('Fetching user data from:', `${baseURL}/me`);
      
      const response = await fetch(`${baseURL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('User API response status:', response.status);if (response.ok) {
        const result = await response.json();
        console.log('User API response:', result);
        
        // Periksa apakah datanya berada di result.user atau langsung di result
        const userResponse = result.user || result;
        
        if (userResponse && userResponse.id) {
          const userData = {
            id: userResponse.id,
            name: userResponse.nama_lengkap || userResponse.name || userResponse.email,
            email: userResponse.email,
            phone: userResponse.phone,
            role: userResponse.role || 'Siswa',
            avatar: userResponse.avatar || '/storage/users/default-avatar.jpg',
            status: userResponse.status,
            created_at: userResponse.created_at,
            updated_at: userResponse.updated_at,
            nama_lengkap: userResponse.nama_lengkap,
          };
          
          console.log('Processed user data:', userData);
          setUser(userData);
          
          // Simpan ke localStorage untuk cache
          localStorage.setItem('bersekolah_user', JSON.stringify(userData));
        }
      } else {
        console.error('Error response:', response.status);
        
        if (response.status === 401) {
          // Token expired atau invalid
          console.log("Token tidak valid, menghapus dari localStorage");
          localStorage.removeItem('bersekolah_auth_token');
          localStorage.removeItem('bersekolah_user');
          localStorage.removeItem('bersekolah_login_time');
          
          toast({
            title: "Sesi Berakhir",
            description: "Silakan login kembali",
            variant: "destructive",
            duration: 3000,
          });
          
          setTimeout(() => {
            window.location.href = '/masuk';
          }, 1000);
        } else {
          // Try to get cached user data
          tryGetCachedUser();
        }
      }
    } catch (error) {
      console.error('Network error fetching user:', error);
      // Try to get cached user data on network error
      tryGetCachedUser();
    } finally {
      setIsLoading(false);
    }
  };
  // Fallback ke data cache jika API gagal
  const tryGetCachedUser = () => {
    try {
      const cachedUser = localStorage.getItem('bersekolah_user');
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        console.log("Menggunakan cached user data:", parsedUser);
        
        // Pastikan data user valid sebelum menggunakannya
        if (parsedUser && parsedUser.name && parsedUser.email) {
          setUser(parsedUser);
        } else {
          console.log("Cached user data tidak lengkap");
        }
      } else {
        // Fallback ke old localStorage keys jika ada
        const oldUser = localStorage.getItem('user');
        if (oldUser) {
          const parsedOldUser = JSON.parse(oldUser);
          console.log("Menggunakan old user data:", parsedOldUser);
          
          const userWithDefaults = {
            ...parsedOldUser,
            role: parsedOldUser.role || 'Siswa',
            avatar: parsedOldUser.avatar || '/storage/users/default-avatar.jpg'
          };
          
          setUser(userWithDefaults);
          
          // Upgrade ke format penyimpanan baru
          localStorage.setItem('bersekolah_user', JSON.stringify(userWithDefaults));
        } else {
          console.log("Tidak ada cached user data");
        }
      }
    } catch (error) {
      console.error("Error parsing cached user data:", error);
    }
  };
    // Mengambil data user saat komponen dimuat
  useEffect(() => {
    fetchUserData();
    
    // Tambahkan event listener untuk login berhasil
    const handleLoginSuccess = (e: any) => {
      console.log('Login success event received:', e.detail);
      if (e.detail && e.detail.user) {
        setUser(e.detail.user);
        setIsLoading(false);
      }
    };
    
    window.addEventListener('bersekolah:login-success', handleLoginSuccess);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('bersekolah:login-success', handleLoginSuccess);
    };
  }, []);
  
  // Fungsi untuk mendapatkan inisial dari nama user
  const getInitials = () => {
    if (!user?.name) return 'UN';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Fungsi untuk mendapatkan role yang user-friendly
  const getUserRole = () => {
    if (!user?.role) return 'Pengguna';
    
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'user': 'Siswa',
      'siswa': 'Siswa',
      'mahasiswa': 'Mahasiswa',
      'guest': 'Tamu'
    };
    
    return roleMap[user.role.toLowerCase()] || user.role;
  };

  // Fungsi logout yang menghapus data dari localStorage dan API
  const handleLogout = async () => {
    try {
      console.log("User logging out...");
      
      const token = localStorage.getItem('bersekolah_auth_token');
      
      if (token) {
        // Call logout API
        const baseURL = import.meta.env.PUBLIC_API_BASE_URL;
        
        try {
          await fetch(`${baseURL}/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
        } catch (error) {
          console.error('Error calling logout API:', error);
        }
      }
      
      // Hapus semua data dari localStorage (both new and old keys)
      localStorage.removeItem('bersekolah_auth_token');
      localStorage.removeItem('bersekolah_user');
      localStorage.removeItem('bersekolah_login_time');
      
      // Remove old keys for backward compatibility
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_time');
      
      toast({
        title: "Berhasil Keluar",
        description: "Anda telah berhasil keluar dari sistem",
        duration: 3000,
      });
      
      // Redirect ke halaman login
      setTimeout(() => {
        window.location.href = '/masuk';
      }, 1000);
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Tetap hapus data lokal meskipun API error
      localStorage.removeItem('bersekolah_auth_token');
      localStorage.removeItem('bersekolah_user');
      localStorage.removeItem('bersekolah_login_time');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_time');
      
      window.location.href = '/masuk';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        {isOpen && <span className="text-sm">Memuat...</span>}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
          <Avatar className="w-8 h-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-blue-800 bg-blue-100 rounded-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="flex-1 text-left hide-when-collapsed">
              <div className="font-semibold truncate text-sm">{user.name}</div>
              <div className="text-xs truncate text-muted-foreground">{user.email}</div>
            </div>
          )}
          {isOpen && (
            <ChevronsUpDown className="w-4 h-4 hide-when-collapsed" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side="right"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="w-8 h-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-blue-800 bg-blue-100 rounded-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-semibold truncate text-sm">{user.name}</div>
              <div className="text-xs truncate">{user.email}</div>
              <div className="text-xs capitalize truncate text-muted-foreground">
                {getUserRole()}
              </div>
              {user.phone && (
                <div className="text-xs truncate text-muted-foreground">
                  {user.phone}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="/" className="flex items-center w-full">
              <PanelsTopLeft className="w-4 h-4 mr-2" />
              Halaman Utama
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-500 cursor-pointer hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}