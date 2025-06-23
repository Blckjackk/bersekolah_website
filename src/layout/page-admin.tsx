import { AppSidebar } from "@/component/admin/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type { ReactNode } from "react";

// Simple auth utilities for admin
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
  const [pathSegments, setPathSegments] = useState<string[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Auth middleware check for admin
  useEffect(() => {
    const checkAuth = () => {
      console.log("🔒 Checking admin authentication...");

      const authData = getAuthData();

      if (!authData) {
        console.log("❌ No valid auth data, redirecting to login");
        window.location.href = "/masuk";
        return;
      }

      const { user } = authData;      // Check if user role is 'admin' or 'superadmin'
      const allowedRoles = ["admin", "superadmin"];
      if (!allowedRoles.includes(user.role)) {
        console.log(
          `❌ User role "${user.role}" not authorized. Required: admin/superadmin`
        );
        
        // Simple unauthorized page for non-admin users
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
              ">🚫</div>
              <h1 style="
                font-size: 1.5rem;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 0.5rem;
              ">Akses Admin Ditolak</h1>
              <p style="
                color: #6b7280;
                margin-bottom: 1.5rem;
                line-height: 1.5;
              ">
                Halaman ini khusus untuk Administrator. 
                Role Anda saat ini: <strong>${user.role}</strong>
              </p>
              <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                <button 
                  onclick="window.location.href='/form-pendaftaran'" 
                  style="
                    background: #3b82f6;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 0.375rem;
                    font-weight: 500;
                    cursor: pointer;
                    width: 100%;
                  "
                >
                  Ke Dashboard User
                </button>
                <button 
                  onclick="
                    localStorage.removeItem('bersekolah_auth_token');
                    localStorage.removeItem('bersekolah_user');
                    localStorage.removeItem('bersekolah_login_time');
                    window.location.href='/masuk';
                  " 
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
          </div>
        `;
        return;
      }

      console.log("✅ Admin authorized:", user.name, "Role:", user.role);
      setIsAuthorized(true);
      setIsAuthChecking(false);
    };

    // Small delay to prevent flash
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Path tracking
  useEffect(() => {
    const path = window.location.pathname;
    // Remove leading and trailing slashes, then split by "/"
    const segments = path.replace(/^\/|\/$/g, "").split("/");
    // If empty array with one empty string, means root
    if (segments.length === 1 && segments[0] === "") {
      setPathSegments([]);
    } else {
      setPathSegments(segments);
    }
  }, []);

  // Create hrefs for each breadcrumb segment cumulatively
  const buildHref = (index: number) => {
    return "/" + pathSegments.slice(0, index + 1).join("/");
  };

  // Better breadcrumb labels for admin pages
  const getBreadcrumbLabel = (segment: string, index: number) => {
    const labels: Record<string, string> = {
      dashboard: "Dashboard Admin",
      "pendaftar-beasiswa": "Pendaftar Beasiswa",
      "kelola-halaman": "Kelola Halaman",
      testimoni: "Data Testimoni",
      "data-mentor": "Data Mentor",
      donasi: "Donasi",
      faq: "FAQ",
      pengaturan: "Pengaturan",
      laporan: "Laporan",
      statistik: "Statistik",
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
          <p className="text-sm text-gray-600">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center h-16 gap-2 shrink-0">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.length === 0 ? (
                  <BreadcrumbItem className="block">
                    <BreadcrumbPage>Dashboard Admin</BreadcrumbPage>
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
        <div className="flex flex-col flex-1 gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
