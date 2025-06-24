"use client"

import { useEffect, useState } from 'react'
import { navigate } from 'astro:transitions/client'
import AdminSeleksiPage from '@/component/admin/aplikasi/seleksi-page'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminSeleksiRoute() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        router.push('/login?redirect=/admin/seleksi')
        return
      }

      // Check user profile and role
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to check user profile')
      }

      const userData = await response.json()
      const role = userData.data?.role

      setUserRole(role)

      if (role === 'admin' || role === 'super_admin') {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
      }

    } catch (error) {
      console.error('Error checking admin access:', error)
      setIsAuthorized(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memverifikasi akses admin...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="container py-6 mx-auto">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold">Akses Ditolak</h2>
              <p className="mb-6 text-gray-600">
                {userRole ? 
                  `Role Anda (${userRole}) tidak memiliki akses ke halaman admin seleksi beasiswa.` :
                  'Anda tidak memiliki akses ke halaman admin. Silakan login dengan akun admin.'
                }
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Login sebagai Admin
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <AdminSeleksiPage />
}