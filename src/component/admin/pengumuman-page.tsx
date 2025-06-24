"use client"

import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  FileEdit, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Upload, 
  FileCheck2,
  Archive,
  Bold,
  Italic,
  Heading2,
  List,
  Link
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AnnouncementService } from "@/lib/announcement-service";
import type { Announcement } from "@/lib/announcement-service";

export default function PengumumanPage() {
  // State for announcements data
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
    // Form states
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    tag: string | null;
    published_at: string | null;
  }>({
    title: "",
    content: "",
    status: "draft",
    tag: "info",
    published_at: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast notification state for simple implementation
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success"
  });
  
  // Fetch announcements data on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 5000);
  };
  
  // Fetch announcements data
  const fetchAnnouncements = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      const data = await AnnouncementService.getAllAnnouncements();
      console.log("Announcements fetched:", data);
      setAnnouncements(data);
      
      if (isRefresh) {
        showToast("Data berhasil diperbarui", "success");
      }
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Gagal memuat data pengumuman");
      showToast("Gagal memuat data pengumuman", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
    // Open create dialog
  const openCreateDialog = () => {
    setFormData({
      title: "",
      content: "",
      status: "draft",
      tag: "info",
      published_at: null
    });
    setCreateDialog(true);
  };
    // Open edit dialog
  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      tag: announcement.tag,
      published_at: announcement.published_at
    });
    setEditDialog(true);
  };
  
  // Open view dialog
  const openViewDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialog(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialog(true);
  };
  
  // Create new announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await AnnouncementService.createAnnouncement(formData);
      showToast("Pengumuman berhasil dibuat", "success");
      setCreateDialog(false);
      fetchAnnouncements(true);
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      showToast(err.message || "Gagal membuat pengumuman", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update existing announcement
  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    
    setIsSubmitting(true);
    try {
      await AnnouncementService.updateAnnouncement(selectedAnnouncement.id, formData);
      showToast("Pengumuman berhasil diperbarui", "success");
      setEditDialog(false);
      fetchAnnouncements(true);
    } catch (err: any) {
      console.error("Error updating announcement:", err);
      showToast(err.message || "Gagal memperbarui pengumuman", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete announcement
  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    setIsSubmitting(true);
    try {
      await AnnouncementService.deleteAnnouncement(selectedAnnouncement.id);
      showToast("Pengumuman berhasil dihapus", "success");
      setDeleteDialog(false);
      fetchAnnouncements(true);
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      showToast(err.message || "Gagal menghapus pengumuman", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update announcement status
  const handleUpdateStatus = async (announcement: Announcement, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await AnnouncementService.updateAnnouncementStatus(announcement.id, newStatus);
      showToast(`Status pengumuman berhasil diubah menjadi ${newStatus}`, "success");
      fetchAnnouncements(true);
    } catch (err: any) {
      console.error("Error updating status:", err);
      showToast(err.message || "Gagal mengubah status pengumuman", "error");
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };
  
  // Filter announcements based on search term and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || announcement.status === statusFilter;
    const matchesTag = tagFilter === "all" || announcement.tag === tagFilter;
    
    return matchesSearch && matchesStatus && matchesTag;
  });
  
  // Get tag badge class
  const getTagBadgeClass = (tag: string | null) => {
    switch (tag) {
      case "beasiswa":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "event":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "penting":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "info":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Unique tags from announcements
  const uniqueTags = ["all", ...new Set(announcements
    .filter(a => a.tag)
    .map(a => a.tag as string))];

  return (
    <div className="container p-6 mx-auto">
      {/* Toast message */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
          toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          <p>{toast.message}</p>
        </div>
      )}
      
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pengumuman</h1>
          <p className="mt-1 text-gray-500">Kelola pengumuman Bersekolah</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => fetchAnnouncements(true)}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button 
            variant="default"
            className="bg-[#406386] hover:bg-[#2c4863]"
            onClick={openCreateDialog}
          >
            + Tambah Pengumuman
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Daftar Pengumuman</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search input */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Cari pengumuman..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute text-gray-500 transform -translate-y-1/2 left-2 top-1/2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              
              {/* Filters */}
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={tagFilter}
                onValueChange={setTagFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tag</SelectItem>
                  {uniqueTags
                    .filter(tag => tag !== "all")
                    .map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal Publikasi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw size={24} className="mb-2 animate-spin" />
                      <p>Loading...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-red-600">
                    <div className="flex flex-col items-center justify-center">
                      <p className="mb-2">{error}</p>
                      <Button variant="outline" onClick={() => fetchAnnouncements(true)}>
                        Coba Lagi
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                    Tidak ada pengumuman ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>
                      {announcement.tag && (
                        <Badge className={`capitalize ${getTagBadgeClass(announcement.tag)}`}>
                          {announcement.tag}
                        </Badge>
                      )}
                      

                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${getStatusBadgeClass(announcement.status)}`}>
                        {announcement.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(announcement.published_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(announcement)}
                          title="Lihat"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(announcement)}
                          title="Edit"
                        >
                          <FileEdit size={16} className="text-amber-600" />
                        </Button>
                                              
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(announcement)}
                          title="Hapus"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Create/Edit Dialog */}
      <Dialog open={createDialog || editDialog} onOpenChange={open => {
        if (!open) {
          setCreateDialog(false);
          setEditDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editDialog ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editDialog ? handleUpdateAnnouncement : handleCreateAnnouncement}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tag">Tag</Label>
                <Select
                  value={formData.tag || "info"}
                  onValueChange={(value) => setFormData({...formData, tag: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beasiswa">Beasiswa</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="penting">Penting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                <div className="grid gap-2">
                <Label htmlFor="content">Konten</Label>                <div className="border rounded-md shadow-sm">
                  {/* Toolbar WYSIWYG sederhana */}
                  <div className="flex items-center gap-1 p-2 border-b bg-slate-50">
                    {/* Format Bold */}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-8 p-1"
                      onClick={() => {
                        const textarea = document.getElementById("content") as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = formData.content.substring(start, end);
                          const newText = 
                            formData.content.substring(0, start) + 
                            `<strong>${selectedText}</strong>` + 
                            formData.content.substring(end);
                          
                          setFormData({...formData, content: newText});
                          
                          // Setelah disisipkan, fokus kembali ke textarea
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 8, // <strong>
                              start + 8 + selectedText.length
                            );
                          }, 0);
                        }
                      }}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    
                    {/* Format Italic */}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-8 p-1"
                      onClick={() => {
                        const textarea = document.getElementById("content") as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = formData.content.substring(start, end);
                          const newText = 
                            formData.content.substring(0, start) + 
                            `<em>${selectedText}</em>` + 
                            formData.content.substring(end);
                          
                          setFormData({...formData, content: newText});
                          
                          // Setelah disisipkan, fokus kembali ke textarea
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 4, // <em>
                              start + 4 + selectedText.length
                            );
                          }, 0);
                        }
                      }}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    
                    {/* Format Heading */}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-8 p-1"
                      onClick={() => {
                        const textarea = document.getElementById("content") as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = formData.content.substring(start, end);
                          const newText = 
                            formData.content.substring(0, start) + 
                            `<h3>${selectedText}</h3>` + 
                            formData.content.substring(end);
                          
                          setFormData({...formData, content: newText});
                          
                          // Setelah disisipkan, fokus kembali ke textarea
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 4, // <h3>
                              start + 4 + selectedText.length
                            );
                          }, 0);
                        }
                      }}
                      title="Heading"
                    >
                      <Heading2 className="w-4 h-4" />
                    </Button>
                    
                    {/* Format List */}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-8 p-1"
                      onClick={() => {
                        const textarea = document.getElementById("content") as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = formData.content.substring(start, end);
                          
                          // Split by new line and create list items
                          const lines = selectedText.split('\n').filter(line => line.trim() !== '');
                          const listItems = lines.map(line => `<li>${line}</li>`).join('');
                          
                          const newText = 
                            formData.content.substring(0, start) + 
                            `<ul>${listItems}</ul>` + 
                            formData.content.substring(end);
                          
                          setFormData({...formData, content: newText});
                          
                          // Setelah disisipkan, fokus kembali ke textarea
                          setTimeout(() => textarea.focus(), 0);
                        }
                      }}
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    
                    {/* Format Link */}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-8 p-1"
                      onClick={() => {
                        const textarea = document.getElementById("content") as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = formData.content.substring(start, end);
                          const url = prompt("Masukkan URL:", "https://");
                          if (url) {
                            const newText = 
                              formData.content.substring(0, start) + 
                              `<a href="${url}" target="_blank">${selectedText || url}</a>` + 
                              formData.content.substring(end);
                            
                            setFormData({...formData, content: newText});
                            
                            // Setelah disisipkan, fokus kembali ke textarea
                            setTimeout(() => textarea.focus(), 0);
                          }
                        }
                      }}
                      title="Insert Link"
                    >
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                    {/* Editor area */}
                  <Textarea
                    id="content"
                    name="content"
                    rows={8}
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    placeholder="Tulis konten pengumuman di sini... (Anda dapat menggunakan tombol formatting di atas)"
                    className="font-mono text-sm border-0 focus-visible:ring-0"
                  />
                  
                  {/* Preview area */}
                  <div className="p-4 border-t bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs font-normal bg-white">
                        Preview
                      </Badge>
                      <span className="text-xs text-slate-500">Tampilan konten setelah disimpan</span>
                    </div>
                    <div 
                      className="p-4 bg-white border rounded-md prose prose-sm max-w-none min-h-[100px]" 
                      dangerouslySetInnerHTML={{ __html: formData.content || '<em class="text-slate-400">Belum ada konten...</em>' }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {!editDialog && <SelectItem value="draft">Draft</SelectItem>}
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialog(false);
                  setEditDialog(false);
                }}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="bg-[#406386] hover:bg-[#2c4863]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedAnnouncement?.title}</span>
              <div className="flex gap-2">
                {selectedAnnouncement?.tag && (
                  <Badge className={getTagBadgeClass(selectedAnnouncement.tag)}>
                    {selectedAnnouncement.tag}
                  </Badge>
                )}
                <Badge className={selectedAnnouncement?.status ? 
                  getStatusBadgeClass(selectedAnnouncement.status) : ""}
                >
                  {selectedAnnouncement?.status}
                </Badge>
              </div>
            </DialogTitle>
            <p className="mt-1 text-sm text-gray-500">
              {selectedAnnouncement?.published_at 
                ? `Dipublikasikan pada ${formatDate(selectedAnnouncement.published_at)}` 
                : 'Belum dipublikasikan'}
            </p>
          </DialogHeader>
          
          <div className="py-4">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedAnnouncement?.content || "" }}></div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setViewDialog(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Apakah Anda yakin ingin menghapus pengumuman "{selectedAnnouncement?.title}"?</p>
            <p className="mt-2 text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAnnouncement}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
