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
  name: "Admin Bersekolah",
  email: "admin@bersekolah.com",
  role: "admin",
  avatar: "/images/admin-avatar.jpg",
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
  
  // Fungsi untuk fetch data user
  const fetchUserData = async () => {
    try {
      // Prioritaskan data dari localStorage untuk kecepatan
      const userStr = localStorage.getItem('bersekolah_user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser({
          id: userData.id,
          name: userData.name || userData.nama_lengkap || 'Admin',
          email: userData.email || 'admin@bersekolah.com',
          phone: userData.phone,
          role: userData.role || 'admin',
          avatar: userData.avatar || '/images/admin-avatar.jpg',
          status: userData.status,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          nama_lengkap: userData.nama_lengkap,
        });
      } else {
        // Fallback ke default jika tidak ada data
        setUser(defaultUser);
      }
      
      const token = localStorage.getItem('bersekolah_auth_token');
      if (token) {
        try {
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${baseURL}/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            const userResponse = result.user || result;
            
            if (userResponse && userResponse.id) {
              const userData = {
                id: userResponse.id,
                name: userResponse.name || userResponse.nama_lengkap || 'Admin',
                email: userResponse.email || 'admin@bersekolah.com',
                phone: userResponse.phone,
                role: userResponse.role || 'admin',
                avatar: userResponse.avatar || '/images/admin-avatar.jpg',
                status: userResponse.status,
                created_at: userResponse.created_at,
                updated_at: userResponse.updated_at,
                nama_lengkap: userResponse.nama_lengkap,
              };
              
              setUser(userData);
              localStorage.setItem('bersekolah_user', JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.log('Could not fetch user data from API:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(defaultUser);
    } finally {
      setIsLoading(false);
    }
  };
  
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
    if (!user?.role) return 'Admin';
    
    const roleMap: { [key: string]: string } = {
      'superadmin': 'Super Administrator',
      'admin': 'Administrator',
      'user': 'Pengguna'
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
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
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
      
      // Hapus semua data dari localStorage
      localStorage.removeItem('bersekolah_auth_token');
      localStorage.removeItem('bersekolah_user');
      localStorage.removeItem('bersekolah_login_time');
      
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
      
      localStorage.removeItem('bersekolah_auth_token');
      localStorage.removeItem('bersekolah_user');
      localStorage.removeItem('bersekolah_login_time');
      
      window.location.href = '/login';
    }
  };
  
  // Effect hook untuk inisialisasi data user
  useEffect(() => {
    fetchUserData();
    
    // Refresh user data setiap 5 menit
    const interval = setInterval(fetchUserData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex gap-2 items-center p-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'w-auto opacity-100 translate-x-0' 
            : 'w-0 opacity-0 -translate-x-4'
        }`}>
          <span className="text-sm whitespace-nowrap">Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex gap-2 items-center p-2 w-full rounded-md transition-colors hover:bg-accent hover:text-accent-foreground">
          <Avatar className="flex-shrink-0 w-8 h-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-blue-800 bg-blue-100 rounded-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className={`flex-1 text-left overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen 
              ? 'w-auto opacity-100 translate-x-0' 
              : 'w-0 opacity-0 -translate-x-4'
          }`}>
            <div className="text-sm font-semibold truncate whitespace-nowrap">{user.name}</div>
            <div className="text-xs truncate whitespace-nowrap text-muted-foreground">{user.email}</div>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen 
              ? 'w-auto opacity-100 translate-x-0' 
              : 'w-0 opacity-0 -translate-x-4'
          }`}>
            <ChevronsUpDown className="w-4 h-4" />
          </div>
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
              <div className="text-sm font-semibold truncate">{user.name}</div>
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
            <a href="/dashboard/pengaturan" className="flex items-center w-full">
              <Settings className="mr-2 w-4 h-4" />
              Pengaturan Akun
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/" className="flex items-center w-full">
              <PanelsTopLeft className="mr-2 w-4 h-4" />
              Halaman Utama
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-500 cursor-pointer hover:bg-red-50"
        >
          <LogOut className="mr-2 w-4 h-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}