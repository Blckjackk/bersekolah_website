import React, { useState, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Avatar } from "@heroui/react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activePath, setActivePath] = useState("/");

  // Menu navigasi utama
  const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/tentang" },
    { name: "Program Beasiswa", href: "/program" },
    { name: "Donasi", href: "/donasi" },
    { name: "Kontak", href: "/kontak" },
    { name: "Artikel", href: "/artikel" },
  ];

  // ✅ UPDATED: Cek status login dengan prefix bersekolah_
  useEffect(() => {
    const checkLoginStatus = () => {
      // ✅ FIXED: Gunakan prefix bersekolah_ seperti di login/register
      const token = localStorage.getItem('bersekolah_auth_token');
      const userDataString = localStorage.getItem('bersekolah_user');
      
      if (token && userDataString) {
        try {
          const parsedUserData = JSON.parse(userDataString);
          setIsLoggedIn(true);
          setUserData(parsedUserData);
          console.log("User logged in:", parsedUserData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Hapus data yang rusak
          localStorage.removeItem('bersekolah_auth_token');
          localStorage.removeItem('bersekolah_user');
          localStorage.removeItem('bersekolah_login_time');
        }
      }
    };
    
    // Deteksi current path untuk active item
    const detectActivePath = () => {
      const currentPath = window.location.pathname;
      console.log("Current path:", currentPath);
      setActivePath(currentPath);
    };
    
    checkLoginStatus();
    detectActivePath();
    
    // Optional: tambahkan listener untuk perubahan URL (jika menggunakan SPA)
    const handleRouteChange = () => {
      detectActivePath();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Fungsi untuk mengecek apakah link aktif
  const isActive = (path) => {
    // Exact match untuk homepage
    if (path === "/" && activePath === "/") {
      return true;
    }
    
    // Untuk halaman lain, cek apakah path adalah substring dari activePath
    if (path !== "/" && activePath.startsWith(path)) {
      return true;
    }
    
    return false;
  };

  // ✅ UPDATED: Handle logout dengan prefix bersekolah_ dan API call
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
          // Continue with local logout even if API fails
        }
      }
      
      // ✅ FIXED: Hapus semua data dengan prefix bersekolah_
      localStorage.removeItem('bersekolah_auth_token');
      localStorage.removeItem('bersekolah_user');
      localStorage.removeItem('bersekolah_login_time');
      
      // Update state
      setIsLoggedIn(false);
      setUserData(null);
      
      // Redirect ke halaman beranda
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Tetap hapus data lokal meskipun API error
      localStorage.removeItem('bersekolah_auth_token');
      localStorage.removeItem('bersekolah_user');
      localStorage.removeItem('bersekolah_login_time');
      
      window.location.href = '/';
    }
  };

  // ✅ UPDATED: Dapatkan path dashboard berdasarkan role
  const getDashboardPath = () => {
    if (!userData) return "/dashboard";
    
    const role = userData.role?.toLowerCase() || "user";
    return role === "admin" ? "/dashboard" : "/form-pendaftaran";
  };

  // Dapatkan inisial untuk avatar
  const getInitials = () => {
    if (!userData?.name) return "U";
    
    const nameParts = userData.name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return userData.name.substring(0, 2).toUpperCase();
  };

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      {/* Toggle Menu untuk Mobile dan Tablet */}
      <NavbarContent className="md:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      {/* Logo untuk Mobile dan Tablet */}
      <NavbarContent className="pr-3 md:hidden" justify="start">
        <NavbarBrand className="ml-4">
          <img src="/assets/image/navbar/logo.png" className="max-w-[100px]" alt="Logo Bersekolah" />
        </NavbarBrand>
      </NavbarContent>

      {/* Menu Desktop */}
      <NavbarContent className="hidden gap-4 md:flex" justify="center">
        <NavbarBrand className="mr-6">
          <img src="/assets/image/navbar/logo.png" className="max-w-[100px]" alt="Logo Bersekolah" />
        </NavbarBrand>
        
        {/* Nav Items untuk Desktop */}
        {navItems.map((item, index) => (
          <NavbarItem key={index} isActive={isActive(item.href)} className={index > 3 ? "hidden xl:flex" : ""}>
            <Link 
              className={isActive(item.href) ? "text-[#406386] font-semibold" : "text-foreground"}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
        
        {/* Dropdown untuk item yang tersembunyi di tablet */}
        <NavbarItem className="hidden md:flex xl:hidden">
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="light" 
                className="flex items-center gap-1"
              >
                Menu Lainnya <ChevronDown size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu Lainnya">
              {navItems.slice(4).map((item, index) => (
                <DropdownItem key={index} className={isActive(item.href) ? "text-[#406386]" : ""}>
                  <Link 
                    className={`w-full ${isActive(item.href) ? "text-[#406386] font-semibold" : "text-foreground"}`}
                    href={item.href}
                  >
                    {item.name}
                  </Link>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      {/* ✅ UPDATED: Menu Login/Register atau User Profile Dropdown */}
      <NavbarContent justify="end">
        {isLoggedIn ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar
                  isBordered
                  className="border-[#406386]"
                  size="sm"
                  src={userData?.avatar}
                  fallback={getInitials()}
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{userData?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{userData?.role || 'User'}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem key="profile" startContent={<User size={18} />}>
                <Link href={`${getDashboardPath()}/profil`} className="w-full">
                  Profil Saya
                </Link>
              </DropdownItem>
              <DropdownItem key="dashboard" startContent={<Settings size={18} />}>
                <Link href={getDashboardPath()} className="w-full">
                  Dashboard
                </Link>
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                startContent={<LogOut size={18} />}
                onClick={handleLogout}
              >
                Keluar
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link 
                href="/masuk" 
                className={isActive("/masuk") ? "text-[#406386] font-semibold" : "text-foreground"}
              >
                Masuk
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button 
                as={Link} 
                className={isActive("/daftar") ? "bg-[#406386] text-white" : "bg-warning text-warning-foreground"}
                href="/daftar" 
                variant="flat"
              >
                Daftar
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* Menu Mobile */}
      <NavbarMenu>
        {/* Menu items dari navItems */}
        {navItems.map((item, index) => (
          <NavbarMenuItem key={index}>
            <Link
              className={`w-full ${isActive(item.href) ? "text-[#406386] font-semibold" : "text-foreground"}`}
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        
        {/* Login dan Register untuk mobile jika tidak login */}
        {!isLoggedIn && (
          <>
            <NavbarMenuItem>
              <Link
                className={`w-full ${isActive("/masuk") ? "text-[#406386] font-semibold" : "text-foreground"}`}
                href="/masuk"
                size="lg"
              >
                Masuk
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button 
                as={Link} 
                className={isActive("/daftar") ? "bg-[#406386] text-white" : "bg-warning text-warning-foreground"}
                href="/daftar" 
                variant="flat"
                fullWidth
              >
                Daftar
              </Button>
            </NavbarMenuItem>
          </>
        )}
        
        {/* ✅ UPDATED: Profile links untuk mobile jika sudah login */}
        {isLoggedIn && (
          <>
            <NavbarMenuItem>
              <Link
                className="w-full"
                color="foreground"
                href={`${getDashboardPath()}/profil`}
                size="lg"
              >
                Profil Saya
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                className="w-full"
                color="foreground"
                href={getDashboardPath()}
                size="lg"
              >
                Dashboard
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                className="w-full"
                color="danger"
                href="#"
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Keluar
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
}

