import { useState, useEffect } from 'react'

interface EditStatus {
  can_edit: boolean
  message: string
  finalized_at?: string
  application_status?: string
}

export function useEditStatus() {
  const [editStatus, setEditStatus] = useState<EditStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkEditStatus = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('bersekolah_auth_token')
      
      if (!token) {
        setEditStatus({
          can_edit: false,
          message: 'Token tidak ditemukan. Silakan login kembali.'
        })
        return
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/documents/edit-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to check edit status')
      }

      const data = await response.json()
      setEditStatus(data)

    } catch (error) {
      console.error('Error checking edit status:', error)
      setEditStatus({
        can_edit: true, // Default to allow editing if check fails
        message: 'Gagal mengecek status edit. Defaulting to allow editing.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkEditStatus()
  }, [])

  return {
    editStatus,
    isLoading,
    checkEditStatus,
    canEdit: editStatus?.can_edit ?? true,
    isFinalized: editStatus?.finalized_at ? true : false,
    finalizedAt: editStatus?.finalized_at,
    applicationStatus: editStatus?.application_status
  }
}