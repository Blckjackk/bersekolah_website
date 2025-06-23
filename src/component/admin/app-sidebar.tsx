"use client"

import * as React from "react"
import {
  Users,
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
    {
      title: "Konten & Halaman",
      url: "#",
      icon: BookOpen,      items: [        {
          title: "Kelola Konten",
          url: "/dashboard/content",
          icon: BookOpen,
        },
        {
          title: "Kelola Halaman",
          url: "/dashboard/kelola-halaman",
          icon: FileText,
        },        {
          title: "Pengumuman",
          url: "/dashboard/pengumuman-react",
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
      title: "Donasi",
      url: "/dashboard/donasi",
      icon: Heart,
      items: [
        {
          title: "Daftar Donasi",
          url: "/dashboard/donasi",
          icon: DollarSign,
        },
        {
          title: "Laporan Donasi",
          url: "/dashboard/donasi/laporan",
          icon: BarChart3,
        },
      ],
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
  
  // Hook untuk mendapatkan informasi user saat komponen dimount
  React.useEffect(() => {
    // Get user data from localStorage
    try {
      const userStr = localStorage.getItem('bersekolah_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
        // Set user data
        setUserData({
          name: user.name || 'Admin',
          email: user.email || 'admin@bersekolah.com',
          avatar: user.avatar || '/images/admin-avatar.jpg',
        });
        
        // Periksa apakah pengguna adalah superadmin
        const userIsSuperAdmin = user.role === 'superadmin';
        setIsSuperAdmin(userIsSuperAdmin);
        console.log('User role:', user.role, 'Is SuperAdmin:', userIsSuperAdmin);
        
        // Jika superadmin, tambahkan menu khusus
        if (userIsSuperAdmin) {
          setNavItems([
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
                  title: "Logs Sistem",
                  url: "/dashboard/system-logs",
                  icon: FileText,
                },
                {
                  title: "Konfigurasi API",
                  url: "/dashboard/api-config",
                  icon: Settings,
                }
              ]
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);
  
  return (
    <Sidebar collapsible="icon" {...props}>
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
      </SidebarContent>      <SidebarFooter>
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