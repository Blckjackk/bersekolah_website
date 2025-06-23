"use client"

import React, { useState, useEffect } from "react"
import { 
  PlusCircle,
  Search,
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  MoreHorizontal, 
  FileText, 
  Users,
  RefreshCw,
  Tag,
  Calendar, 
  AlertTriangle,
  Archive,
  Edit,
  Trash2,
  Eye
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Define Announcement interface
interface Announcement {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  tag: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementPage() {
  // State for announcement data
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "draft",
    tag: "",
    published_at: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch announcements data on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
  // Fetch announcements data
  const fetchAnnouncements = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      
      console.log('Announcements data:', data);
      
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch announcements');
      }
      
      // Handle response structure
      let announcementsData = [];
      if (Array.isArray(data)) {
        announcementsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        announcementsData = data.data;
      }
      
      setAnnouncements(announcementsData);
      
      if (isRefresh) {
        toast({
          title: "Data diperbarui",
          description: "Data pengumuman berhasil diperbarui",
        });
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError(error instanceof Error ? error.message : "Gagal memuat data pengumuman");
      toast({
        title: "Error",
        description: "Gagal memuat data pengumuman",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Open create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      title: "",
      content: "",
      status: "draft",
      tag: "",
      published_at: ""
    });
    setCreateDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      tag: announcement.tag || "",
      published_at: announcement.published_at ? new Date(announcement.published_at).toISOString().split('T')[0] : ""
    });
    setEditDialog(true);
  };
  
  // Open view dialog
  const handleOpenViewDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialog(true);
  };
  
  // Handle create announcement
  const handleCreateAnnouncement = async () => {
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create announcement');
      }

      const result = await response.json();
      
      toast({
        title: "Berhasil",
        description: "Pengumuman berhasil ditambahkan",
      });
      
      setCreateDialog(false);
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menambahkan pengumuman",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle update announcement
  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/announcements/${selectedAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update announcement');
      }

      const result = await response.json();
      
      toast({
        title: "Berhasil",
        description: "Pengumuman berhasil diperbarui",
      });
      
      setEditDialog(false);
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui pengumuman",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete announcement
  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/announcements/${selectedAnnouncement.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete announcement');
      }

      toast({
        title: "Berhasil",
        description: "Pengumuman berhasil dihapus",
      });
      
      setDeleteDialog(false);
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus pengumuman",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle status update
  const handleUpdateStatus = async (announcement: Announcement, status: 'draft' | 'published' | 'archived') => {
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/announcements/${announcement.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      toast({
        title: "Berhasil",
        description: `Status pengumuman berhasil diubah menjadi ${status === 'published' ? 'dipublikasikan' : status === 'archived' ? 'diarsipkan' : 'draft'}`,
      });
      
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui status pengumuman",
        variant: "destructive",
      });
    }
  };
  
  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (announcement.tag && announcement.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    const matchesTag = tagFilter === 'all' || announcement.tag === tagFilter;
    
    return matchesSearch && matchesStatus && matchesTag;
  });
  
  // Extract unique tags for filter dropdown
  const uniqueTags = Array.from(new Set(announcements.map(a => a.tag).filter(Boolean))) as string[];
  
  // Count announcements by status
  const stats = {
    total: announcements.length,
    draft: announcements.filter(a => a.status === 'draft').length,
    published: announcements.filter(a => a.status === 'published').length,
    archived: announcements.filter(a => a.status === 'archived').length
  };
  
  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="text-green-800 bg-green-100 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Dipublikasikan
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline">
            <Archive className="w-3 h-3 mr-1" />
            Diarsipkan
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Memuat data pengumuman...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container py-6 mx-auto">
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <CardTitle>Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-red-600">{error}</p>
            <Button onClick={() => fetchAnnouncements()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Pengumuman</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchAnnouncements(true)} 
            variant="outline" 
            size="sm" 
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreateDialog} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Pengumuman
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengumuman</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dipublikasikan</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diarsipkan</p>
                <p className="text-2xl font-bold">{stats.archived}</p>
              </div>
              <Archive className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Cari Pengumuman</Label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                <Input
                  id="search"
                  placeholder="Judul, konten, atau tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Dipublikasikan</SelectItem>
                  <SelectItem value="archived">Diarsipkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tag">Tag</Label>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tag</SelectItem>
                  {uniqueTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTagFilter("all");
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Pengumuman</CardTitle>
            <Badge variant="outline">
              {filteredAnnouncements.length} pengumuman
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Judul</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Tanggal Publikasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada pengumuman yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>
                      {announcement.tag ? (
                        <Badge variant="outline" className="bg-blue-50">
                          <Tag className="w-3 h-3 mr-1" />
                          {announcement.tag}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {announcement.published_at ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {formatDate(announcement.published_at)}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(announcement.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenViewDialog(announcement)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(announcement)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          
                          {announcement.status !== 'published' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(announcement, 'published')}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Publikasikan
                            </DropdownMenuItem>
                          )}
                          
                          {announcement.status !== 'draft' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(announcement, 'draft')}>
                              <Clock className="w-4 h-4 mr-2" />
                              Kembalikan ke Draft
                            </DropdownMenuItem>
                          )}
                          
                          {announcement.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(announcement, 'archived')}>
                              <Archive className="w-4 h-4 mr-2" />
                              Arsipkan
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => handleOpenDeleteDialog(announcement)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Pengumuman Baru</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk membuat pengumuman baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="title">Judul Pengumuman</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul pengumuman"
                />
              </div>
              
              <div>
                <Label htmlFor="tag">Tag (Opsional)</Label>
                <Input
                  id="tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  placeholder="Contoh: beasiswa, event, info"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Dipublikasikan</SelectItem>
                    <SelectItem value="archived">Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="content">Konten</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Masukkan konten pengumuman (HTML diperbolehkan)"
                  rows={10}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleCreateAnnouncement} disabled={isSubmitting || !formData.title || !formData.content}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Pengumuman"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pengumuman</DialogTitle>
            <DialogDescription>
              Ubah informasi pengumuman sesuai kebutuhan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="edit-title">Judul Pengumuman</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul pengumuman"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-tag">Tag (Opsional)</Label>
                <Input
                  id="edit-tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  placeholder="Contoh: beasiswa, event, info"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Dipublikasikan</SelectItem>
                    <SelectItem value="archived">Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-content">Konten</Label>
                <Textarea
                  id="edit-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Masukkan konten pengumuman (HTML diperbolehkan)"
                  rows={10}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleUpdateAnnouncement} disabled={isSubmitting || !formData.title || !formData.content}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  {selectedAnnouncement ? formatDate(selectedAnnouncement.created_at) : ''}
                </Badge>
                
                {selectedAnnouncement?.tag && (
                  <Badge variant="outline" className="bg-blue-50">
                    <Tag className="w-3 h-3 mr-1" />
                    {selectedAnnouncement.tag}
                  </Badge>
                )}
                
                {selectedAnnouncement && getStatusBadge(selectedAnnouncement.status)}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 border-t border-b">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedAnnouncement?.content || '' }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>
              Tutup
            </Button>
            <Button onClick={() => {
              setViewDialog(false);
              if (selectedAnnouncement) {
                handleOpenEditDialog(selectedAnnouncement);
              }
            }}>
              Edit Pengumuman
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pengumuman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 border rounded-md bg-red-50">
            <div className="flex items-start gap-3 px-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-600">Pengumuman: {selectedAnnouncement?.title}</h4>
                <p className="text-sm text-red-600">Status: {selectedAnnouncement?.status}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAnnouncement} 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Hapus Pengumuman"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
