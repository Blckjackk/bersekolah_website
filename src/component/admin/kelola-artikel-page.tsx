"use client"

import React, { useState, useEffect } from "react";
import { 
  Search, 
  PlusCircle, 
  FileEdit, 
  Trash2, 
  MoreHorizontal, 
  RefreshCw, 
  Image, 
  Clock, 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
  DialogDescription,
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

import { HalamanService } from "@/lib/halaman-service";
import type { Halaman } from "@/lib/halaman-service";

export default function KelolaArtikelPage({ defaultCategory = "news" }: { defaultCategory?: string }) {
  // State for pages data
  const [halaman, setHalaman] = useState<Halaman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Halaman | null>(null);
    // Form states
  const [formData, setFormData] = useState({
    judul_halaman: "",
    slug: "",
    deskripsi: "",
    category: defaultCategory, // Use the provided defaultCategory
    status: "draft",
    gambar: null as File | null,
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
  
  // Fetch halaman data on component mount
  useEffect(() => {
    fetchHalaman();
  }, []);
  
  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast((prev) => ({ visible: false, message: "", type })); // Reset dulu
    setTimeout(() => {
      setToast({ visible: true, message, type });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }, 50); // Delay kecil agar reset benar
  };
  
  // Fetch halaman data
  const fetchHalaman = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const data = await HalamanService.getAllHalamanNoPaginate();
      setHalaman(data);
      if (isRefresh) {
        showToast("Data berhasil diperbarui", "success");
      }
    } catch (err) {
      console.error("Error fetching halaman:", err);
      setError("Gagal memuat data halaman");
      showToast("Gagal memuat data halaman", "error");
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
  
  // Handle auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      judul_halaman: title,
      slug: title.toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Remove duplicate hyphens
    });
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        gambar: e.target.files[0]
      });
    }
  };
    // Open create dialog
  const openCreateDialog = () => {
    setFormData({
      judul_halaman: "",
      slug: "",
      deskripsi: "",
      category: defaultCategory, // Use the provided defaultCategory
      status: "draft",
      gambar: null
    });
    setCreateDialog(true);
  };
  
  // Open edit dialog
  const openEditDialog = (page: Halaman) => {
    setSelectedPage(page);
    setFormData({
      judul_halaman: page.judul_halaman,
      slug: page.slug,
      deskripsi: page.deskripsi,
      category: page.category,
      status: page.status,
      gambar: null // Can't pre-populate file input
    });
    setEditDialog(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (page: Halaman) => {
    setSelectedPage(page);
    setDeleteDialog(true);
  };
  
  // Create new halaman
  const handleCreateHalaman = async () => {
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("judul_halaman", formData.judul_halaman);
      formDataObj.append("slug", formData.slug);
      formDataObj.append("deskripsi", formData.deskripsi);
      formDataObj.append("category", formData.category);
      formDataObj.append("status", formData.status);
      
      if (formData.gambar) {
        formDataObj.append("gambar", formData.gambar);
      }
      
      await HalamanService.createHalaman(formDataObj);
      showToast("Halaman berhasil dibuat", "success");
      setCreateDialog(false);
      fetchHalaman(true);
    } catch (err) {
      let errorMsg = "Gagal membuat halaman";
      const axiosErr = err as any;
      if (axiosErr && typeof axiosErr === "object") {
        if ("response" in axiosErr && axiosErr.response && axiosErr.response.data) {
          if (axiosErr.response.data.message) {
            errorMsg = axiosErr.response.data.message;
          } else if (typeof axiosErr.response.data === "string") {
            errorMsg = axiosErr.response.data;
          } else if (axiosErr.response.data.errors) {
            errorMsg = Object.values(axiosErr.response.data.errors).flat().join(", ");
          } else {
            errorMsg = JSON.stringify(axiosErr.response.data);
          }
        } else if ("message" in axiosErr) {
          errorMsg = axiosErr.message;
        }
      }
      console.error("Error creating halaman:", err);
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update existing halaman
  const handleUpdateHalaman = async () => {
    if (!selectedPage) return;
    
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("judul_halaman", formData.judul_halaman);
      formDataObj.append("slug", formData.slug);
      formDataObj.append("deskripsi", formData.deskripsi);
      formDataObj.append("category", formData.category);
      formDataObj.append("status", formData.status);
      
      if (formData.gambar) {
        formDataObj.append("gambar", formData.gambar);
      }
      
      await HalamanService.updateHalaman(selectedPage.id, formDataObj);
      showToast("Halaman berhasil diperbarui", "success");
      setEditDialog(false);
      fetchHalaman(true);
    } catch (err) {
      let errorMsg = "Gagal memperbarui halaman";
      const axiosErr = err as any;
      if (axiosErr && typeof axiosErr === "object") {
        if ("response" in axiosErr && axiosErr.response && axiosErr.response.data) {
          if (axiosErr.response.data.message) {
            errorMsg = axiosErr.response.data.message;
          } else if (typeof axiosErr.response.data === "string") {
            errorMsg = axiosErr.response.data;
          } else if (axiosErr.response.data.errors) {
            errorMsg = Object.values(axiosErr.response.data.errors).flat().join(", ");
          } else {
            errorMsg = JSON.stringify(axiosErr.response.data);
          }
        } else if ("message" in axiosErr) {
          errorMsg = axiosErr.message;
        }
      }
      console.error("Error updating halaman:", err);
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete halaman
  const handleDeleteHalaman = async () => {
    if (!selectedPage) return;
    
    setIsSubmitting(true);
    try {
      await HalamanService.deleteHalaman(selectedPage.id);
      showToast("Halaman berhasil dihapus", "success");
      setDeleteDialog(false);
      fetchHalaman(true);
    } catch (err) {
      console.error("Error deleting halaman:", err);
      showToast("Gagal menghapus halaman", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle halaman status
  const handleToggleStatus = async (page: Halaman) => {
    try {
      const newStatus = page.status === "published" ? "draft" : "published";
      await HalamanService.updateHalamanStatus(page.id, newStatus);
      showToast(`Status halaman berhasil diubah menjadi ${newStatus}`, "success");
      fetchHalaman(true);
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Gagal mengubah status halaman", "error");
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };
  
  // Filter halaman based on search term
  const filteredHalaman = halaman.filter(page => 
    page.judul_halaman.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="text-green-700 bg-green-100 border-green-200">
            <CheckCircle className="mr-1 w-3 h-3" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="text-yellow-700 bg-yellow-100 border-yellow-200">
            <Clock className="mr-1 w-3 h-3" />
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-gray-700 bg-gray-100 border-gray-200">
            <AlertCircle className="mr-1 w-3 h-3" />
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  // Helper untuk membangun URL gambar dari nama file
  const getImageUrl = (gambar: string | null | undefined): string | undefined => {
    if (!gambar) return undefined;
    return `/assets/image/artikel/${gambar}`;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-4 text-gray-600">Memuat data halaman...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container p-6 mx-auto">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="mr-2 w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
          <CardFooter className="bg-red-50">
            <Button 
              onClick={() => fetchHalaman()}
              variant="outline"
              className="border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Coba lagi
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          <p>{toast.message}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kelola Artikel</h1>
          <p className="text-gray-600">Kelola artikel terbaru</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchHalaman(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} className="bg-[#406386] hover:bg-[#355475]">
            <PlusCircle className="mr-2 w-4 h-4" />
            Tambah Artikel
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari berdasarkan judul, slug atau kategori..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Halaman List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Halaman</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Judul Halaman</TableHead>
                <TableHead className="w-[150px]">Slug</TableHead>
                <TableHead className="w-[100px]">Kategori</TableHead>
                <TableHead className="w-[100px]">Tanggal</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[100px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHalaman.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <p className="text-gray-500">Belum ada data halaman</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openCreateDialog}
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 w-4 h-4" />
                      Tambah Halaman Baru
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {filteredHalaman.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {page.gambar ? (
                        <div className="overflow-hidden w-8 h-8 bg-gray-100 rounded">
                          <img 
                            src={page.gambar || "/storage/artikel/default.jpg"}
                            alt={page.judul_halaman}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/storage/artikel/default.jpg";
                            }}
                          />
                          {/* Debug: tampilkan nama file gambar */}
                          <span style={{fontSize: '10px', color: '#888'}}>{page.gambar}</span>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center w-8 h-8 bg-gray-100 rounded">
                          <img
                            src="/assets/image/artikel/default.jpg"
                            alt="default"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{page.judul_halaman}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {page.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {page.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(page.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => handleToggleStatus(page)}
                      className="inline-flex rounded-full hover:bg-gray-50"
                    >
                      {getStatusBadge(page.status)}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(page)}>
                          <FileEdit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(page)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 w-4 h-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[550px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Halaman Baru</DialogTitle>
            <DialogDescription>
              Buat halaman atau artikel baru pada website
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="judul_halaman">Judul Halaman</Label>
              <Input
                id="judul_halaman"
                name="judul_halaman"
                value={formData.judul_halaman}
                onChange={handleTitleChange}
                placeholder="Masukkan judul halaman"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="judul-halaman"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL halaman: example.com/{formData.slug}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">Berita</SelectItem>
                    <SelectItem value="bertumbuh">Bertumbuh</SelectItem>
                    <SelectItem value="berolahraga">Berolahraga</SelectItem>
                    <SelectItem value="bercerita">bercerita</SelectItem>
                    <SelectItem value="bersekolah_fest">Bersekolah Fest</SelectItem>
                    <SelectItem value="berkunjung">Berkunjung</SelectItem>
                    <SelectItem value="bertemu">Bertemu</SelectItem>
                    <SelectItem value="beribadah">Beribadah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="deskripsi">Konten / Deskripsi</Label>
              <Textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Tulis konten atau deskripsi halaman"
                className="mt-1 h-40"
              />
            </div>
            <div>
              <Label htmlFor="gambar">Gambar</Label>
              <Input
                id="gambar"
                name="gambar"
                type="file"
                onChange={handleImageChange}
                className="mt-1"
                accept="image/*"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: JPG, PNG, atau GIF. Ukuran maksimal 2MB.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setCreateDialog(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              onClick={handleCreateHalaman}
              disabled={isSubmitting}
              className="bg-[#406386] hover:bg-[#355475]"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent
          className="w-[95vw] sm:w-full sm:max-w-[550px] max-h-[95vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Edit Halaman</DialogTitle>
            <DialogDescription>
              Perbarui informasi halaman
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* --- Input Judul --- */}
            <div>
              <Label htmlFor="edit_judul_halaman">Judul Halaman</Label>
              <Input
                id="edit_judul_halaman"
                name="judul_halaman"
                value={formData.judul_halaman}
                onChange={handleInputChange}
                placeholder="Masukkan judul halaman"
                className="mt-1"
              />
            </div>

            {/* --- Slug --- */}
            <div>
              <Label htmlFor="edit_slug">Slug</Label>
              <Input
                id="edit_slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="judul-halaman"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL halaman: example.com/{formData.slug}
              </p>
            </div>

            {/* --- Grid Kategori & Status --- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit_category">Kategori</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">Berita</SelectItem>
                    <SelectItem value="bertumbuh">Bertumbuh</SelectItem>
                    <SelectItem value="berolahraga">Berolahraga</SelectItem>
                    <SelectItem value="bercerita">bercerita</SelectItem>
                    <SelectItem value="bersekolah_fest">Bersekolah Fest</SelectItem>
                    <SelectItem value="berkunjung">Berkunjung</SelectItem>
                    <SelectItem value="bertemu">Bertemu</SelectItem>
                    <SelectItem value="beribadah">Beribadah</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* --- Deskripsi --- */}
            <div>
              <Label htmlFor="edit_deskripsi">Konten / Deskripsi</Label>
              <Textarea
                id="edit_deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Tulis konten atau deskripsi halaman"
                className="mt-1 h-40"
              />
            </div>

            {/* --- Gambar --- */}
            <div>
              <Label htmlFor="edit_gambar">Gambar</Label>
              <Input
                id="edit_gambar"
                name="gambar"
                type="file"
                onChange={handleImageChange}
                className="mt-1"
                accept="image/*"
              />
              {selectedPage?.gambar && (
                <div className="mt-2">
                  <p className="mb-1 text-xs text-gray-500">Gambar Saat Ini:</p>
                  <img
                    src={selectedPage.gambar || "/storage/artikel/default.jpg"}
                    alt={selectedPage.judul_halaman}
                    className="object-cover w-32 h-32 rounded border"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/storage/artikel/default.jpg";
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Kosongkan jika tidak ingin mengganti gambar
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateHalaman}
              disabled={isSubmitting}
              className="bg-[#406386] hover:bg-[#355475]"
            >
              {isSubmitting ? "Menyimpan..." : "Perbarui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Halaman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus halaman ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPage && (
              <div className="p-4 bg-red-50 rounded-md border">
                <p className="font-medium">{selectedPage.judul_halaman}</p>
                <p className="text-sm text-gray-500">{selectedPage.slug}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteHalaman}
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
