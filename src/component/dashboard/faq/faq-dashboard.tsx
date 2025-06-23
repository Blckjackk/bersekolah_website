"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FAQ {
  id: number
  pertanyaan: string
  jawaban: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export default function FaqDashboard() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    pertanyaan: "",
    jawaban: "",
    status: "draft" as "draft" | "published"
  })
  const { toast } = useToast()

  // ✅ Fetch all FAQs
  const fetchFaqs = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/faqs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        setFaqs(result.data || result || [])
      } else {
        throw new Error('Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data FAQ.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Create FAQ
  const createFaq = async () => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/faqs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setFaqs(prev => [...prev, result.data || result.faq])
        toast({
          title: "Berhasil",
          description: "FAQ berhasil ditambahkan.",
        })
        closeDialog()
      } else {
        throw new Error('Failed to create FAQ')
      }
    } catch (error) {
      console.error('Error creating FAQ:', error)
      toast({
        title: "Error",
        description: "Gagal menambahkan FAQ.",
        variant: "destructive",
      })
    }
  }

  // ✅ Update FAQ
  const updateFaq = async () => {
    if (!currentFaq) return

    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/faqs/${currentFaq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setFaqs(prev => prev.map(faq => 
          faq.id === currentFaq.id ? { ...faq, ...formData } : faq
        ))
        toast({
          title: "Berhasil",
          description: "FAQ berhasil diperbarui.",
        })
        closeDialog()
      } else {
        throw new Error('Failed to update FAQ')
      }
    } catch (error) {
      console.error('Error updating FAQ:', error)
      toast({
        title: "Error",
        description: "Gagal memperbarui FAQ.",
        variant: "destructive",
      })
    }
  }

  // ✅ Delete FAQ
  const deleteFaq = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return

    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('No authentication token')

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        setFaqs(prev => prev.filter(faq => faq.id !== id))
        toast({
          title: "Berhasil",
          description: "FAQ berhasil dihapus.",
        })
      } else {
        throw new Error('Failed to delete FAQ')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast({
        title: "Error",
        description: "Gagal menghapus FAQ.",
        variant: "destructive",
      })
    }
  }

  // ✅ Dialog handlers
  const openCreateDialog = () => {
    setIsEditing(false)
    setCurrentFaq(null)
    setFormData({ pertanyaan: "", jawaban: "", status: "draft" })
    setShowDialog(true)
  }

  const openEditDialog = (faq: FAQ) => {
    setIsEditing(true)
    setCurrentFaq(faq)
    setFormData({
      pertanyaan: faq.pertanyaan,
      jawaban: faq.jawaban,
      status: faq.status
    })
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
    setIsEditing(false)
    setCurrentFaq(null)
    setFormData({ pertanyaan: "", jawaban: "", status: "draft" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing) {
      updateFaq()
    } else {
      createFaq()
    }
  }

  // ✅ Initial fetch
  useEffect(() => {
    fetchFaqs()
  }, [])

  const getStatusBadge = (status: string) => {
    return status === 'published' 
      ? <Badge variant="default">Published</Badge>
      : <Badge variant="secondary">Draft</Badge>
  }

  if (isLoading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold">Memuat FAQ...</h3>
              <p className="text-sm text-muted-foreground">Mengambil data FAQ dari server</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">FAQ Management</h1>
          <p className="mt-1 text-gray-500">Kelola Frequently Asked Questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFaqs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} className="bg-[#406386] hover:bg-[#375573]">
            <Plus className="w-4 h-4 mr-2" />
            Tambah FAQ
          </Button>
        </div>
      </div>

      {/* FAQ Cards */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">Belum ada FAQ. Klik tombol "Tambah FAQ" untuk membuat FAQ baru.</p>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{faq.pertanyaan}</CardTitle>
                    <CardDescription className="mt-2">{faq.jawaban}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusBadge(faq.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Dibuat: {new Date(faq.created_at).toLocaleDateString('id-ID')}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(faq)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteFaq(faq.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Form */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit FAQ' : 'Tambah FAQ Baru'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Perbarui informasi FAQ' : 'Buat FAQ baru untuk ditampilkan di website'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pertanyaan">Pertanyaan</Label>
              <Input
                id="pertanyaan"
                value={formData.pertanyaan}
                onChange={(e) => setFormData(prev => ({ ...prev, pertanyaan: e.target.value }))}
                placeholder="Masukkan pertanyaan FAQ"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jawaban">Jawaban</Label>
              <Textarea
                id="jawaban"
                value={formData.jawaban}
                onChange={(e) => setFormData(prev => ({ ...prev, jawaban: e.target.value }))}
                placeholder="Masukkan jawaban FAQ"
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "draft" | "published") => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Batal
            </Button>
            <Button onClick={handleSubmit} className="bg-[#406386] hover:bg-[#375573]">
              {isEditing ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}