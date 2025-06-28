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
  AlertCircle,
  Lock
} from "lucide-react"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { useSidebar } from "@/contexts/SidebarContext"

// ✅ TAMBAHKAN: Interface untuk application status
interface ApplicationStatus {
  status: string
  finalized_at?: string
  can_finalize?: boolean
}

// ✅ TAMBAHKAN: Function untuk fetch application status
const fetchApplicationStatus = async (): Promise<ApplicationStatus | null> => {
  try {    const token = localStorage.getItem('bersekolah_auth_token')
    if (!token) return null
      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
    console.log('Fetching application status from:', `${baseURL}/application-status`)
    const response = await fetch(`${baseURL}/application-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',      },
    })
    
    if (response.ok) {
      const result = await response.json()
      return result.data
    }
    
    console.error('Application status error:', response.status, response.statusText)
    
    // Check if it's a 404 error and log additional details
    if (response.status === 404) {
      console.warn('Application status endpoint not found. Please verify the correct endpoint path in the API.')
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
          {            title: "Beranda",
            url: "/form-pendaftaran",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran'
          },
          {            title: "Pengumuman",
            url: "/form-pendaftaran/pengumuman", 
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/pengumuman'
          },
        ],
      },
      {
        title: "Formulir Pendaftaran",
        icon: ClipboardList,
        isActive: currentPath.includes('/form-pendaftaran/pendaftaran/'),
        items: [
          {            title: "Data Pribadi",
            url: "/form-pendaftaran/pendaftaran/data-pribadi",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/pendaftaran/data-pribadi'
          },
          {            title: "Data Keluarga",
            url: "/form-pendaftaran/pendaftaran/data-keluarga",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/pendaftaran/data-keluarga'
          },
          {            title: "Alamat & Kontak",
            url: "/form-pendaftaran/pendaftaran/alamat",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/pendaftaran/alamat'
          },
        ],
      },
      {
        title: "Unggah Dokumen",
        icon: Upload,
        isActive: currentPath.includes('/form-pendaftaran/dokumen/'),
        items: [
          {            title: "Dokumen Wajib",
            url: "/form-pendaftaran/dokumen/wajib",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/dokumen/wajib'
          },
          {            title: "Bukti Sosial Media",
            url: "/form-pendaftaran/dokumen/sosmed",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/dokumen/sosmed'
          },
          {            title: "Dokumen Pendukung",
            url: "/form-pendaftaran/dokumen/pendukung",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/dokumen/pendukung'
          },
        ],
      },
      {
        title: "Tahapan Seleksi",
        icon: Clock,
        isActive: currentPath.includes('/form-pendaftaran/seleksi/'),
        items: [
          {            title: "Seleksi Berkas",
            url: "/form-pendaftaran/seleksi/berkas",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/seleksi/berkas',
            // ✅ TAMBAHKAN: Indikator finalisasi
            badge: canFinalize && !isFinalized ? {
              icon: AlertCircle,
              color: "text-orange-600",
              tooltip: "Siap untuk finalisasi"
            } : undefined
          },
          {            title: "Jadwal Wawancara",
            url: "/form-pendaftaran/seleksi/jadwal-wawancara",
            disabled: !canAccessInterview || applicationStatus?.status === 'ditolak', // ✅ UPDATED: Lock jika ditolak
            isActive: currentPath === '/form-pendaftaran/seleksi/jadwal-wawancara',
            badge: !canAccessInterview || applicationStatus?.status === 'ditolak' ? {
              icon: Lock,
              color: "text-gray-400",
              tooltip: applicationStatus?.status === 'ditolak' ? "Tidak lolos seleksi berkas" : "Menunggu lolos seleksi berkas"
            } : undefined
          },
          {            title: "Hasil Seleksi", // ✅ UPDATED: Rename dari "Hasil Wawancara"
            url: "/form-pendaftaran/seleksi/hasil-wawancara",
            disabled: !canAccessResult,
            isActive: currentPath === '/form-pendaftaran/seleksi/hasil-wawancara',
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
          {            title: "Progres Pendaftaran",
            url: "/form-pendaftaran/status/progres",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/status/progres'
          },
          {            title: "Status Kelulusan",
            url: "/form-pendaftaran/status/kelulusan",
            disabled: false,
            isActive: currentPath === '/form-pendaftaran/status/kelulusan'
          },
        ],
      },
    ],
  }
}

export function AppSidebar() {
  const [currentPath, setCurrentPath] = useState("")
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null) 
  const { isOpen, sidebarRef } = useSidebar(); // Get sidebar state from context
  const [isMobile, setIsMobile] = useState(false)

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
    <div 
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen bg-background border-r border-border z-30 flex flex-col"
      style={{ 
        width: isMobile ? (isOpen ? '16rem' : '0') : (isOpen ? '16rem' : '4rem'),
        transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)'
      }}
    >
      {/* Header - Fixed di atas */}
      <div className="h-16 flex items-center px-4 border-b border-border flex-shrink-0 bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-primary text-primary-foreground">
            <Command className="size-4" />
          </div>
          {(isOpen || !isMobile) && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Yayasan Bersekolah</span>
              <span className="text-xs text-muted-foreground">Platform Pendaftaran</span>
            </div>
          )}
        </div>
      </div>

      {/* Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <NavMain items={data.navMain} />
      </div>

      {/* Footer NavUser - Fixed di bottom */}
      <div className="flex-shrink-0 bg-background border-t border-border">
        <div className="p-4">
          <NavUser />
        </div>
      </div>
    </div>
  )
}