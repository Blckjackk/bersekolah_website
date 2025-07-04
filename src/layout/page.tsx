import { AppSidebar } from "@/component/beswan/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CustomSidebarTrigger } from "@/component/layout/custom-sidebar-trigger";
import { SidebarProvider as CustomSidebarProvider, useSidebar } from "@/contexts/SidebarContext";

import type { ReactNode } from "react";

// Simple auth utilities
const getAuthData = () => {
  try {
    const token = localStorage.getItem("bersekolah_auth_token");
    const userData = localStorage.getItem("bersekolah_user");
    const timestamp = localStorage.getItem("bersekolah_login_time");

    if (!token || !userData || !timestamp) {
      return null;
    }

    const user = JSON.parse(userData);

    // Check if token is expired (24 hours)
    const loginTime = parseInt(timestamp);
    const now = Date.now();
    const hoursPassed = (now - loginTime) / (1000 * 60 * 60);

    if (hoursPassed > 24) {
      // Token expired, clear auth data
      localStorage.removeItem("bersekolah_auth_token");
      localStorage.removeItem("bersekolah_user");
      localStorage.removeItem("bersekolah_login_time");
      return null;
    }

    return { user, token, timestamp: loginTime };
  } catch (error) {
    console.error("Error getting auth data:", error);
    return null;
  }
};

export default function Page({ children }: { children: ReactNode }) {
  return (
    <CustomSidebarProvider>
      <PageContent>{children}</PageContent>
    </CustomSidebarProvider>
  );
}

function PageContent({ children }: { children: ReactNode }) {
  const { isOpen, toggle } = useSidebar();
  const [pathSegments, setPathSegments] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Monitor window size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth middleware check
  useEffect(() => {
    const checkAuth = () => {
      console.log("🔒 Checking authentication...");

      const authData = getAuthData();

      if (!authData) {
        console.log("❌ No valid auth data, redirecting to login");
        window.location.href = "/masuk";
        return;
      }

      const { user } = authData;      // Check if user role is 'user'
      if (user.role !== "user" && user.role !== "beswan") {
        console.log(`❌ User role "${user.role}" not authorized. Required: "user" or "beswan"`);
        
        // Redirect admin dan superadmin ke dashboard admin
        if (user.role === "admin" || user.role === "superadmin") {
          console.log("🔄 Redirecting admin/superadmin to dashboard");
          window.location.href = "/dashboard";
          return;
        }

        // Simple unauthorized page
        document.body.innerHTML = `
          <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <div style="
              background: white;
              padding: 2rem;
              border-radius: 0.5rem;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              margin: 1rem;
            ">
              <div style="
                width: 4rem;
                height: 4rem;
                background: #fee2e2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
                font-size: 1.5rem;
              ">⚠️</div>
              <h1 style="
                font-size: 1.5rem;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 0.5rem;
              ">Akses Ditolak</h1>
              <p style="
                color: #6b7280;
                margin-bottom: 1.5rem;
                line-height: 1.5;
              ">
                Halaman ini khusus untuk pengguna dengan role "user". 
                Role Anda saat ini: <strong>${user.role}</strong>
              </p>
              <button 
                onclick="window.location.href='/masuk'" 
                style="
                  background: #dc2626;
                  color: white;
                  padding: 0.75rem 1.5rem;
                  border: none;
                  border-radius: 0.375rem;
                  font-weight: 500;
                  cursor: pointer;
                  width: 100%;
                "
              >
                Logout & Login Ulang
              </button>
            </div>
          </div>
        `;
        return;
      }

      console.log("✅ User authorized:", user.name, "Role:", user.role);
      setIsAuthorized(true);
      setIsAuthChecking(false);
    };

    // Small delay to prevent flash
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Path tracking
  useEffect(() => {
    const updatePath = () => {
      const path = window.location.pathname;
      setCurrentPath(path);

      const segments = path.replace(/^\/|\/$/g, "").split("/");
      if (segments.length === 1 && segments[0] === "") {
        setPathSegments([]);
      } else {
        setPathSegments(segments);
      }
    };

    updatePath();

    const handlePopState = () => updatePath();
    window.addEventListener("popstate", handlePopState);

    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        updatePath();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      observer.disconnect();
    };
  }, [currentPath]);

  const buildHref = (index: number) => {
    return "/" + pathSegments.slice(0, index + 1).join("/");
  };

  const getBreadcrumbLabel = (segment: string, index: number) => {
    const labels: Record<string, string> = {      "form-pendaftaran": "Dashboard",
      pendaftaran: "Formulir",
      "data-pribadi": "Data Pribadi",
      "data-keluarga": "Data Keluarga",
      alamat: "Alamat & Kontak",
      dokumen: "Dokumen",
      wajib: "Dokumen Wajib",
      sosmed: "Bukti Sosial Media",
      pendukung: "Dokumen Pendukung",
      seleksi: "Seleksi",
      berkas: "Seleksi Berkas",
      "jadwal-wawancara": "Jadwal Wawancara",
      "hasil-wawancara": "Hasil Wawancara",
      status: "Status",
      progres: "Progres Pendaftaran",
      kelulusan: "Status Kelulusan",
      pengumuman: "Pengumuman",
    };

    return (
      labels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    );
  };

  // Show loading while checking auth
  if (isAuthChecking || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => {
            // Close sidebar on mobile when clicking overlay
            toggle();
          }}
        />
      )}
      
      {/* Sidebar - Fixed position */}
      <AppSidebar />
      
      {/* Main content area - Adjust margin for sidebar */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isMobile 
            ? "ml-0" 
            : (isOpen ? "ml-64" : "ml-16")
        }`}
      >
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <CustomSidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.length === 0 ? (
                  <BreadcrumbItem className="block">
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  pathSegments.map((segment, index) => {
                    const isLast = index === pathSegments.length - 1;
                    const label = getBreadcrumbLabel(segment, index);

                    return (
                      <div key={index} className="flex items-center gap-3">
                        <BreadcrumbItem className="block">
                          {!isLast ? (
                            <BreadcrumbLink href={buildHref(index)}>
                              {label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator className="block" />}
                      </div>
                    );
                  })
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="p-4 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
