"use client"
import * as React from "react"
import { useContext, useEffect, useState } from "react"
import {
  PanelsTopLeft,
  Command,
  LifeBuoy,
  Send,
  FileVideo,
  UsersRound,
  ClipboardList,
  Upload,
  FileCheck,
  Home,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle, // ✅ TAMBAHKAN untuk indikator finalisasi
  Lock // ✅ TAMBAHKAN untuk lock icon
} from "lucide-react"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// ✅ TAMBAHKAN: Interface untuk application status
interface ApplicationStatus {
  status: string
  finalized_at?: string
  can_finalize?: boolean
}

// ✅ TAMBAHKAN: Function untuk fetch application status
const fetchApplicationStatus = async (): Promise<ApplicationStatus | null> => {
  try {
    const token = localStorage.getItem('bersekolah_auth_token')
    if (!token) return null

    const baseURL = import.meta.env.PUBLIC_API_BASE_URL
    const response = await fetch(`${baseURL}/application-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const result = await response.json()
      return result.data
    }
  } catch (error) {
    console.log('Could not fetch application status:', error)
  }
  return null
}

// ✅ UPDATE: Function getNavData dengan application status
const getNavData = (currentPath: string, applicationStatus: ApplicationStatus | null) => {
  console.log('🔍 Current path for dashboard check:', currentPath)
  console.log('📋 Application status:', applicationStatus)
  
  const isDashboardPage = currentPath === '/form-pendaftaran'
  const isPengumumanPage = currentPath === '/form-pendaftaran/pengumuman'
  const dashboardActive = isDashboardPage || isPengumumanPage
  
  // ✅ Tentukan status lock untuk tahapan seleksi
  const isFinalized = applicationStatus?.finalized_at !== null && applicationStatus?.finalized_at !== undefined
  const canFinalize = applicationStatus?.can_finalize === true
  const applicationStatusValue = applicationStatus?.status || 'pending'
  
  // ✅ Logic untuk disable tahapan berdasarkan status
  const canAccessInterview = isFinalized && ['lolos_berkas', 'lolos_wawancara', 'diterima'].includes(applicationStatusValue)
  const canAccessResult = isFinalized && ['lolos_wawancara', 'diterima', 'ditolak'].includes(applicationStatusValue)
  
  return {
    navMain: [
      {
        title: "Dashboard Pendaftaran",
        icon: Home,
        isActive: dashboardActive,
        items: [
          {
            title: "Beranda",
            url: "/form-pendaftaran",
            disabled: false,
          },
          {
            title: "Pengumuman",
            url: "/form-pendaftaran/pengumuman", 
            disabled: false,
          },
        ],
      },
      {
        title: "Formulir Pendaftaran",
        icon: ClipboardList,
        isActive: currentPath.includes('/form-pendaftaran/pendaftaran/'),
        items: [
          {
            title: "Data Pribadi",
            url: "/form-pendaftaran/pendaftaran/data-pribadi",
            disabled: false,
          },
          {
            title: "Data Keluarga",
            url: "/form-pendaftaran/pendaftaran/data-keluarga",
            disabled: false,
          },
          {
            title: "Alamat & Kontak",
            url: "/form-pendaftaran/pendaftaran/alamat",
            disabled: false,
          },
        ],
      },
      {
        title: "Unggah Dokumen",
        icon: Upload,
        isActive: currentPath.includes('/form-pendaftaran/dokumen/'),
        items: [
          {
            title: "Dokumen Wajib",
            url: "/form-pendaftaran/dokumen/wajib",
            disabled: false,
          },
          {
            title: "Bukti Sosial Media",
            url: "/form-pendaftaran/dokumen/sosmed",
            disabled: false,
          },
          {
            title: "Dokumen Pendukung",
            url: "/form-pendaftaran/dokumen/pendukung",
            disabled: false,
          },
        ],
      },
      {
        title: "Tahapan Seleksi",
        icon: Clock,
        isActive: currentPath.includes('/form-pendaftaran/seleksi/'),
        items: [
          {
            title: "Seleksi Berkas",
            url: "/form-pendaftaran/seleksi/berkas",
            disabled: false,
            // ✅ TAMBAHKAN: Indikator finalisasi
            badge: canFinalize && !isFinalized ? {
              icon: AlertCircle,
              color: "text-orange-600",
              tooltip: "Siap untuk finalisasi"
            } : undefined
          },
          {
            title: "Jadwal Wawancara",
            url: "/form-pendaftaran/seleksi/jadwal-wawancara",
            disabled: !canAccessInterview || applicationStatus?.status === 'ditolak', // ✅ UPDATED: Lock jika ditolak
            badge: !canAccessInterview || applicationStatus?.status === 'ditolak' ? {
              icon: Lock,
              color: "text-gray-400",
              tooltip: applicationStatus?.status === 'ditolak' ? "Tidak lolos seleksi berkas" : "Menunggu lolos seleksi berkas"
            } : undefined
          },
          {
            title: "Hasil Seleksi", // ✅ UPDATED: Rename dari "Hasil Wawancara"
            url: "/form-pendaftaran/seleksi/hasil-wawancara",
            disabled: !canAccessResult,
            badge: !canAccessResult ? {
              icon: Lock,
              color: "text-gray-400",
              tooltip: "Menunggu finalisasi berkas"
            } : undefined
          },
        ],
      },
      {
        title: "Status Pendaftaran",
        icon: CheckCircle,
        isActive: currentPath.includes('/form-pendaftaran/status/'),
        items: [
          {
            title: "Progres Pendaftaran",
            url: "/form-pendaftaran/status/progres",
            disabled: false,
          },
          {
            title: "Status Kelulusan",
            url: "/form-pendaftaran/status/kelulusan",
            disabled: false,
          },
        ],
      },
    ],
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentPath, setCurrentPath] = useState("")
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null) // ✅ TAMBAHKAN state
  
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
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      observer.disconnect()
    }
  }, [currentPath])

  // ✅ TAMBAHKAN: Fetch application status
  useEffect(() => {
    const loadApplicationStatus = async () => {
      const status = await fetchApplicationStatus()
      setApplicationStatus(status)
    }
    
    loadApplicationStatus()
    
    // ✅ Refresh status setiap 30 detik
    const interval = setInterval(loadApplicationStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Get nav data based on current path and application status
  const data = getNavData(currentPath, applicationStatus)

  return (
    <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/form-pendaftaran">
                  <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-sm leading-tight text-left">
                    <span className="font-semibold truncate">Yayasan Bersekolah</span>
                    <span className="text-xs truncate text-sidebar-muted-foreground">
                      Platform Pendaftaran
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
    </Sidebar>
  )
}