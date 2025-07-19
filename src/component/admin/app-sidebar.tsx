"use client"
import * as React from "react"
import { useContext, useEffect, useState } from "react"
import {
  Users,
  Database,
  GraduationCap,
  FileText,
  Heart,
  Settings,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Shield,
  BookOpen,
  Calendar,
  MessageSquare,
  DollarSign,
  Award,
  Target,
  Share2,
  Bell,
  X
} from "lucide-react"

import { NavMain } from "@/component/admin/nav-main"
import { NavUser } from "@/component/admin/nav-user"
import { useSidebar } from "@/contexts/SidebarContext"

// Menu data untuk admin
const getNavData = (currentPath: string, isSuperAdmin: boolean) => {
  console.log('🔍 Current path for dashboard check:', currentPath)
  
  const baseNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: currentPath === '/dashboard',
    },
    {
      title: "Manajemen Beasiswa",
      icon: GraduationCap,
      isActive: currentPath.includes('/dashboard/pendaftar') || 
               currentPath.includes('/dashboard/seleksi') || 
               currentPath.includes('/dashboard/periode'),
      items: [
        {
          title: "Pendaftar Beasiswa",
          url: "/dashboard/pendaftar-beasiswa",
          icon: Users,
          disabled: false,
          isActive: currentPath === '/dashboard/pendaftar-beasiswa'
        },
        {
          title: "Seleksi Aplikasi",
          url: "/dashboard/seleksi",
          icon: CheckCircle,
          disabled: false,
          isActive: currentPath === '/dashboard/seleksi'
        },
        {
          title: "Periode Beasiswa",
          url: "/dashboard/periode-beasiswa",
          icon: Calendar,
          disabled: false,
          isActive: currentPath === '/dashboard/periode-beasiswa'
        },
      ],
    },
    {
      title: "Manajemen Dokumen",
      icon: FileText,
      isActive: currentPath.includes('/dashboard/dokumen/'),
      items: [
        {
          title: "Dokumen Wajib",
          url: "/dashboard/dokumen/wajib",
          icon: ClipboardList,
          disabled: false,
          isActive: currentPath === '/dashboard/dokumen/wajib'
        },
        {
          title: "Bukti Sosial Media",
          url: "/dashboard/dokumen/sosmed",
          icon: Share2,
          disabled: false,
          isActive: currentPath === '/dashboard/dokumen/sosmed'
        },
        {
          title: "Dokumen Pendukung",
          url: "/dashboard/dokumen/pendukung",
          icon: FileText,
          disabled: false,
          isActive: currentPath === '/dashboard/dokumen/pendukung'
        },
      ],
    },
    {
      title: "Konten & Halaman",
      icon: BookOpen,
      isActive: currentPath.includes('/dashboard/kelola-artikel') || 
                currentPath.includes('/dashboard/pengumuman') || 
                currentPath.includes('/dashboard/faq'),
      items: [
        {
          title: "Kelola Artikel",
          url: "/dashboard/kelola-artikel",
          icon: FileText,
          disabled: false,
          isActive: currentPath === '/dashboard/kelola-artikel'
        },
        {
          title: "Pengumuman",
          url: "/dashboard/pengumuman",
          icon: Bell,
          disabled: false,
          isActive: currentPath === '/dashboard/pengumuman'
        },
        {
          title: "FAQ",
          url: "/dashboard/faq",
          icon: MessageSquare,
          disabled: false,
          isActive: currentPath === '/dashboard/faq'
        },
      ],
    },
    {
      title: "Data Mentor",
      url: "/dashboard/data-mentor",
      icon: Users,
      isActive: currentPath === '/dashboard/data-mentor',
    },
    {
      title: "Data Testimoni",
      url: "/dashboard/data-testimoni",
      icon: MessageSquare,
      isActive: currentPath === '/dashboard/data-testimoni',
    },
    {
      title: "Pengaturan",
      url: "/dashboard/pengaturan",
      icon: Settings,
      isActive: currentPath === '/dashboard/pengaturan',
    },
  ];

  // Add super admin tools if needed
  if (isSuperAdmin) {
    baseNavItems.push({
      title: "Super Admin Tools",
      icon: Shield,
      isActive: currentPath.includes('/dashboard/manage-admin') || currentPath.includes('/dashboard/export-data'),
      items: [
        {
          title: "Manajemen Admin",
          url: "/dashboard/manage-admin",
          icon: Shield,
          disabled: false,
          isActive: currentPath === '/dashboard/manage-admin'
        },
        {
          title: "Export Data",
          url: "/dashboard/export-data",
          icon: Database,
          disabled: false,
          isActive: currentPath === '/dashboard/export-data'
        },
      ]
    });
  }

  return {
    navMain: baseNavItems
  };
};

export function AppSidebar() {
  const [currentPath, setCurrentPath] = useState("")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { isOpen, sidebarRef, toggle } = useSidebar();
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance required to trigger close
  const minSwipeDistance = 50
  
  // Update document body class for proper styling
  // NOTE: Disabled to prevent conflicts with page-admin.tsx layout
  // useEffect(() => {
  //   document.body.classList.toggle('has-sidebar', true);
  //   document.body.classList.toggle('sidebar-collapsed', !isOpen);
    
  //   return () => {
  //     document.body.classList.remove('has-sidebar');
  //     document.body.classList.remove('sidebar-collapsed');
  //   };
  // }, [isOpen]);

  // Monitor window size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Track current path
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname)
    }
    
    updatePath()
    
    const handlePopState = () => updatePath()
    window.addEventListener('popstate', handlePopState)
    
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        updatePath()
      }
    })
    
    observer.observe(document.body, { childList: true, subtree: true })
    
    // NOTE: Disabled CSS variables to prevent conflicts with page-admin.tsx layout
    // Update CSS variables based on sidebar state
    // document.documentElement.style.setProperty(
    //   '--sidebar-width', 
    //   isOpen ? '16rem' : '4rem'
    // )
    // document.documentElement.style.setProperty(
    //   '--sidebar-expanded-width', 
    //   '16rem'
    // )
    // document.documentElement.style.setProperty(
    //   '--sidebar-collapsed-width', 
    //   '4rem'
    // )
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      observer.disconnect()
    }
  }, [currentPath, isOpen])

  // Handle touch events for swipe to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }

  const handleTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    // Only close if swipe started from near the edge (first 50px of sidebar)
    if (isLeftSwipe && isOpen && touchStart < 50) {
      toggle();
    }
  }

  // Hook untuk mendapatkan informasi user saat komponen dimount
  useEffect(() => {
    // Get user data from localStorage
    try {
      const userStr = localStorage.getItem('bersekolah_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userIsSuperAdmin = user.role === 'superadmin';
        setIsSuperAdmin(userIsSuperAdmin);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  // Get nav data based on current path and prepare it for NavMain
  const navData = getNavData(currentPath, isSuperAdmin)

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-35"
          onClick={() => {
            // Close sidebar on mobile when clicking overlay
            toggle();
          }}
        />
      )}
      
      <aside 
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-screen bg-background border-r border-border z-30 flex flex-col sidebar-smooth-transition ${
          isMobile 
            ? `sidebar-mobile ${isOpen ? 'sidebar-mobile-visible' : 'sidebar-mobile-hidden'}` 
            : 'sidebar-desktop'
        }`}
        style={{ 
          width: isMobile ? '16rem' : (isOpen ? '16rem' : '4rem'),
          zIndex: isMobile ? 40 : 30 // Higher z-index for mobile
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header - Fixed di atas */}
        <header 
          className={`h-16 flex items-center border-b border-border flex-shrink-0 bg-background ${isOpen ? 'cursor-pointer hover:bg-accent/10' : ''}`}
          onClick={() => {
            if (isOpen) {
              console.log('Header area clicked, toggling sidebar');
              toggle();
            }
          }}
          title={isOpen ? "Klik untuk menutup sidebar" : ""}
          data-testid="sidebar-header"
        >
          <div 
            className="flex items-center justify-center w-16 h-full"
            onClick={(e) => {
              if (isOpen) {
                e.stopPropagation();
                console.log('Logo container clicked when sidebar open, toggling');
                toggle();
              }
            }}
          >
            <div 
              className="flex items-center justify-center transition-colors rounded-lg aspect-square size-8 bg-primary text-primary-foreground"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Logo clicked, toggle state:', isOpen);
                toggle(); // Always toggle regardless of state
              }}
              title={isOpen ? "Klik untuk menutup sidebar" : "Klik untuk membuka sidebar"}
            >
              <Award className="size-4 sidebar-icon" />
            </div>
          </div>
          
          <div className={`flex flex-col sidebar-text-transition ${
            isOpen || isMobile 
              ? 'sidebar-content-expanded' 
              : 'sidebar-content-collapsed'
          }`}>
            <span className="text-sm font-semibold whitespace-nowrap">Bersekolah</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
            </span>
          </div>
          
          {/* Mobile close button */}
          {isMobile && isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              className="flex items-center justify-center w-8 h-8 ml-auto mr-2 transition-colors rounded-md hover:bg-accent/10"
              aria-label="Tutup sidebar"
              title="Tutup sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </header>

        {/* Content - Scrollable area */}
        <nav className="flex-1 overflow-y-auto">
          <NavMain items={navData.navMain} />
        </nav>

        {/* Footer NavUser - Fixed di bottom */}
        <footer className="flex-shrink-0 bg-background border-t border-border">
          <div className={`transition-all duration-200 ${
            isMobile 
              ? 'p-2' 
              : isOpen 
                ? 'p-4' 
                : 'p-2'
          }`}>
            <NavUser />
          </div>
          {isSuperAdmin && isOpen && (
            <div className="px-4 py-2 mb-2 text-xs font-semibold text-center text-primary">
              Super Admin Mode
            </div>
          )}
        </footer>

        {/* Hover trigger for collapsed state on desktop */}
        {!isOpen && !isMobile && (
          <div 
            className="sidebar-hover-expand"
            onClick={toggle}
            title="Klik untuk membuka sidebar"
          />
        )}
      </aside>
    </>
  )
}