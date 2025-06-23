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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

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
  avatar: "/assets/image/users/default-avatar.jpg",
};

export function NavUser() {
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
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

      console.log('User API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('User API response:', result);
        
        if (result.user) {
          const userData = {
            id: result.user.id,
            name: result.user.nama_lengkap || result.user.name || result.user.email,
            email: result.user.email,
            phone: result.user.phone,
            role: result.user.role || 'Siswa',
            avatar: result.user.avatar || '/assets/image/users/default-avatar.jpg',
            status: result.user.status,
            created_at: result.user.created_at,
            updated_at: result.user.updated_at,
            nama_lengkap: result.user.nama_lengkap,
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
        setUser(parsedUser);
      } else {
        // Fallback ke old localStorage keys jika ada
        const oldUser = localStorage.getItem('user');
        if (oldUser) {
          const parsedOldUser = JSON.parse(oldUser);
          console.log("Menggunakan old user data:", parsedOldUser);
          
          const userWithDefaults = {
            ...parsedOldUser,
            role: parsedOldUser.role || 'Siswa',
            avatar: parsedOldUser.avatar || '/assets/image/users/default-avatar.jpg'
          };
          
          setUser(userWithDefaults);
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
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Memuat...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-blue-800 bg-blue-100 rounded-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">{user.name}</span>
                <span className="text-xs truncate text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
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
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">{user.name}</span>
                  <span className="text-xs truncate">{user.email}</span>
                  <span className="text-xs capitalize truncate text-muted-foreground">
                    {getUserRole()}
                  </span>
                  {user.phone && (
                    <span className="text-xs truncate text-muted-foreground">
                      {user.phone}
                    </span>
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
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-500 cursor-pointer hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}