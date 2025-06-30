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

// Tidak menggunakan data default user lagi
const defaultUser: User = {
  name: "",
  email: "",
  role: "",
  avatar: "/storage/Beswan.png", // Menggunakan gambar yang sudah ada
};

export function NavUser() {
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const { toast } = useToast();
    // Add listener for login success event
  useEffect(() => {
    // Handler for custom login event
    const handleLoginSuccess = (event: CustomEvent) => {
      console.log("Login success event captured in NavUser!", event.detail);
      if (event.detail?.user) {
        setUser(event.detail.user);
        setIsLoading(false);
        
        // Update last check time
        setLastCheckTime(event.detail.timestamp || Date.now());
      } else {
        // Fallback to fetching user data
        fetchUserData();
      }
    };
    
    // Add event listener with type assertion
    window.addEventListener(
      'bersekolah:login-success', 
      handleLoginSuccess as EventListener
    );
    
    // Also keep the interval check as a backup
    const intervalId = setInterval(() => {
      const loginTime = localStorage.getItem('bersekolah_login_time');
      
      // If login time exists and is newer than our last check, refresh user data
      if (loginTime) {
        const loginTimeNum = parseInt(loginTime);
        if (loginTimeNum > lastCheckTime) {
          console.log("Detected new login! Refreshing user data...");
          setLastCheckTime(loginTimeNum);
          fetchUserData();
        }
      }
    }, 5000); // Check every 5 seconds
    
    // Clean up
    return () => {
      window.removeEventListener(
        'bersekolah:login-success', 
        handleLoginSuccess as EventListener
      );
      clearInterval(intervalId);
    };
  }, [lastCheckTime]);
  
  // Fetch data user dari API
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      
      console.log('Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log("Tidak ada token, coba gunakan cached data");
        tryGetCachedUser();
        setIsLoading(false);
        return;
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL;
      const apiUrl = `${baseURL}/me`;
      
      console.log('Fetching user data from:', apiUrl);
      console.log('Using token:', token.substring(0, 20) + '...');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('User API response status:', response.status);
      console.log('User API response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('User API response:', result);          // Handle different response structures
        const userData = result.user || result.data || result;
        
        if (userData) {
          // Pastikan nama tidak kosong - gunakan fallback yang tepat
          const userName = userData.nama_lengkap || userData.name || userData.nama || '';
          const userEmail = userData.email || '';
            // Validasi data user yang didapat
          if (!userName || !userEmail) {
            console.warn('User data incomplete:', { name: userName, email: userEmail });            toast({
              title: "Data Pengguna Tidak Lengkap",
              description: "Beberapa informasi pengguna tidak tersedia",
              variant: "destructive",
            });
          }
          
          const processedUserData = {
            id: userData.id,
            name: userName || 'Pengguna', // Fallback jika semua field nama kosong
            email: userEmail || 'Email tidak tersedia',
            phone: userData.phone,
            role: userData.role || 'user',
            avatar: userData.avatar || '/storage/Beswan.png',
            status: userData.status,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            nama_lengkap: userData.nama_lengkap,
          };
          
          console.log('Processed user data:', processedUserData);
          setUser(processedUserData);
          
          // Simpan ke localStorage untuk cache
          localStorage.setItem('bersekolah_user', JSON.stringify(processedUserData));
        } else {
          console.log('No user data in response:', result);
          tryGetCachedUser();
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
          
          // Jika login tapi data tidak lengkap, arahkan ke login
          const token = localStorage.getItem('bersekolah_auth_token');
          if (token) {
            toast({
              title: "Sesi Tidak Valid",
              description: "Silakan login kembali untuk melanjutkan",
              variant: "destructive",
            });
            
            // Clear invalid data
            localStorage.removeItem('bersekolah_auth_token');
            localStorage.removeItem('bersekolah_user');
          }
        }
      } else {
        console.log("Tidak ada cached user data");
      }
    } catch (error) {
      console.error("Error parsing cached user data:", error);
    }
  };
    // Function to check if we have fresh login data
  const checkForFreshLoginData = () => {
    try {
      const cachedUser = localStorage.getItem('bersekolah_user');
      const loginTime = localStorage.getItem('bersekolah_login_time');
      
      if (cachedUser && loginTime) {
        const parsedUser = JSON.parse(cachedUser);
        const timeElapsed = Date.now() - parseInt(loginTime);
        
        // If login data is fresh (less than 1 minute old), use it immediately
        if (timeElapsed < 60000 && parsedUser && parsedUser.name && parsedUser.email) {
          console.log("Fresh login data detected! Using it:", parsedUser.name);
          setUser(parsedUser);
          // Still fetch from API but don't wait for it to show UI
          fetchUserData();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking fresh login data:", error);
      return false;
    }
  };
  
  // Mengambil data user saat komponen dimuat
  useEffect(() => {
    // First check if we have fresh login data
    const hasFreshData = checkForFreshLoginData();
    
    // If no fresh data, fetch from API as usual
    if (!hasFreshData) {
      fetchUserData();
    }
  }, []);
    // Fungsi untuk mendapatkan inisial dari nama user
  const getInitials = () => {
    if (!user?.name || user.name.trim() === '') {
      // Jika nama kosong, coba gunakan email
      if (user?.email && user.email.includes('@')) {
        // Gunakan karakter pertama dari email
        return user.email[0].toUpperCase();
      }
      return '...'; // Placeholder saat loading
    }
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };
  // Fungsi untuk mendapatkan role yang user-friendly
  const getUserRole = () => {
    if (isLoading) return 'Memuat...';
    if (!user?.role || user.role.trim() === '') return 'Pengguna';
    
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'superadmin': 'Super Admin',
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
      
      // Tetap hapus data lokal meskipun API error
      localStorage.removeItem('bersekolah_auth_token');
      localStorage.removeItem('bersekolah_user');
      localStorage.removeItem('bersekolah_login_time');
      
      window.location.href = '/masuk';
    }
  };
  // Check if we have actual user data
  const hasUserData = user.name && user.email;
  
  // Loading state - only show loading if we don't have any user data yet
  if (isLoading && !hasUserData) {
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
            >              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name || "User"} />
                <AvatarFallback className="text-blue-800 bg-blue-100 rounded-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Memuat data...</span>
                    </div>
                  ) : (
                    user.name || "Memuat..."
                  )}
                </span>
                <span className="text-xs truncate text-muted-foreground">
                  {user.email || (isLoading ? "Mengambil email..." : "Login untuk melihat")}
                </span>
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
                </Avatar>                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Memuat data...</span>
                      </div>
                    ) : (
                      user.name || "Memuat..."
                    )}
                  </span>
                  <span className="text-xs truncate">{user.email || "Mengambil email..."}</span>
                  <span className="text-xs capitalize truncate text-muted-foreground">
                    {getUserRole()}
                  </span>
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}