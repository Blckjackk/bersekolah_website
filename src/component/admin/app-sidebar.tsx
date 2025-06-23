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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
            <Award className="size-4" />
          </div>
          <div className="grid flex-1 text-sm leading-tight text-left">
            <span className="font-semibold truncate">Bersekolah</span>
            <span className="text-xs truncate">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}