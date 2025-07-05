"use client"

import * as React from "react"

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
  Share2, // ✅ Import icon untuk Media Sosial
  Bell    // Import icon untuk Pengumuman
} from "lucide-react"

import { NavMain } from "@/component/admin/nav-main"
import { NavUser } from "@/component/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/contexts/SidebarContext"

// Menu data untuk admin
const data = {
  user: {
    name: "Admin Bersekolah",
    email: "admin@bersekolah.com",
    avatar: "/images/admin-avatar.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Manajemen Beasiswa",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "Pendaftar Beasiswa",
          url: "/dashboard/pendaftar-beasiswa",
          icon: Users,
        },
        {
          title: "Seleksi Aplikasi",
          url: "/dashboard/seleksi",
          icon: CheckCircle,
        },
        {
          title: "Periode Beasiswa",
          url: "/dashboard/periode-beasiswa",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Manajemen Dokumen",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Dokumen Wajib",
          url: "/dashboard/dokumen/wajib",
          icon: ClipboardList,
        },
        {
          title: "Bukti Sosial Media", // ✅ URL diperbaiki
          url: "/dashboard/dokumen/sosmed",
          icon: Share2,
        },
        {
          title: "Dokumen Pendukung",
          url: "/dashboard/dokumen/pendukung",
          icon: FileText,
        },
      ],
    },
    {      title: "Konten & Halaman",
      url: "#",
      icon: BookOpen,      items: [        {
          title: "Kelola Artikel",
          url: "/dashboard/kelola-artikel",
          icon: FileText,
        },        
        {
          title: "Pengumuman",
          url: "/dashboard/pengumuman",
          icon: Bell,
        },
        {
          title: "FAQ",
          url: "/dashboard/faq",
          icon: MessageSquare,
        },

      ],
    },    {
      title: "Data Mentor",
      url: "/dashboard/data-mentor",
      icon: Users,
    },
    {
      title: "Data Testimoni",
      url: "/dashboard/data-testimoni",
      icon: MessageSquare,
    },
    
    {
      title: "Pengaturan",
      url: "/dashboard/pengaturan",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // State untuk menyimpan data pengguna dan status superadmin
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [userData, setUserData] = React.useState(data.user);
  const [navItems, setNavItems] = React.useState(data.navMain);
  const { isOpen, sidebarRef } = useSidebar(); // Get sidebar state from context
  const [currentPath, setCurrentPath] = React.useState("");

  // Update currentPath on mount and on popstate
  React.useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    updatePath();
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  // Mark active menu/submenu every path change, always from base data (not prev)
  React.useEffect(() => {
    // Use latest menu (with superadmin if needed)
    const baseNav = isSuperAdmin ? [
      ...data.navMain,
      {
        title: "Super Admin Tools",
        url: "#",
        icon: Shield,
        items: [
          {
            title: "Manajemen Admin",
            url: "/dashboard/manage-admin",
            icon: Shield,
          },
          {
            title: "Export Data",
            url: "/dashboard/export-data",
            icon: Database,
          },
        ]
      }
    ] : data.navMain;
    const markActive = (items: any[]) => items.map(item => {
      const hasSub = Array.isArray(item.items);
      const isActive = hasSub
        ? item.items.some((sub: any) => sub.url === currentPath)
        : item.url === currentPath;
      return {
        ...item,
        isActive,
        items: hasSub ? item.items.map((sub: any) => ({
          ...sub,
          isActive: sub.url === currentPath
        })) : undefined
      };
    });
    setNavItems(markActive(baseNav));
  }, [currentPath, isSuperAdmin]);

  // Hook untuk mendapatkan informasi user saat komponen dimount
  React.useEffect(() => {
    // Get user data from localStorage
    try {
      const userStr = localStorage.getItem('bersekolah_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({
          name: user.name || 'Admin',
          email: user.email || 'admin@bersekolah.com',
          avatar: user.avatar || '/images/admin-avatar.jpg',
        });
        const userIsSuperAdmin = user.role === 'superadmin';
        setIsSuperAdmin(userIsSuperAdmin);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  return (
    <Sidebar 
      ref={sidebarRef} 
      id="main-sidebar"
      collapsible="icon" 
      className={`sidebar-container sidebar ${!isOpen ? 'sidebar-closed' : ''}`} 
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
            <Award className="size-4" />
          </div>
          <div className="grid flex-1 text-sm leading-tight text-left">
            <span className="font-semibold truncate">Bersekolah</span>
            <span className="text-xs truncate">
              {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        {isSuperAdmin && (
          <div className="px-4 py-2 mt-2 text-xs font-semibold text-center text-sidebar-primary">
            Super Admin Mode
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}