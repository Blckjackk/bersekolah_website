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

import { ArtikelService } from "@/lib/artikel-service";
import type { Artikel } from "@/lib/artikel-service";

export default function KelolaArtikelPage({ defaultCategory = "news" }: { defaultCategory?: string }) {
  // State for articles data
  const [artikels, setArtikels] = useState<Artikel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
  // Form states
  const [formData, setFormData] = useState<{
    judul_halaman: string;
    slug: string;
    deskripsi: string;
    category: string;
    status: "draft" | "published" | "archived";
    gambar: File | null;
  }>({
    judul_halaman: "",
    slug: "",
    deskripsi: "",
    category: defaultCategory, // Use the provided defaultCategory
    status: "archived", // Default to archived for new articles
    gambar: null,
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
  
  // Fetch artikels data on component mount
  useEffect(() => {
    fetchArtikels();
  }, []);
  
  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 5000);
  };
  
  // Fetch artikels data
  const fetchArtikels = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      const data = await ArtikelService.getAllArtikels();
      setArtikels(data);
      
      if (isRefresh) {
        showToast("Data berhasil diperbarui", "success");
      }
    } catch (err) {
      console.error("Error fetching artikels:", err);
      setError("Gagal memuat data artikel");
      showToast("Gagal memuat data artikel", "error");
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
      status: "archived", // Default to archived for new articles
      gambar: null
    });
    setCreateDialog(true);
  };
  
  // Open edit dialog
  const openEditDialog = (artikel: Artikel) => {
    setSelectedArtikel(artikel);
    setFormData({
      judul_halaman: artikel.judul_halaman,
      slug: artikel.slug,
      deskripsi: artikel.deskripsi,
      category: artikel.category,
      status: artikel.status,
      gambar: null // Can't pre-populate file input
    });
    setEditDialog(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (artikel: Artikel) => {
    setSelectedArtikel(artikel);
    setDeleteDialog(true);
  };
  
  // Create new artikel
  const handleCreateArtikel = async () => {
    setIsSubmitting(true);
    try {
      await ArtikelService.createArtikel({
        judul_halaman: formData.judul_halaman,
        slug: formData.slug,
        deskripsi: formData.deskripsi,
        category: formData.category,
        status: formData.status,
        gambar: formData.gambar || undefined
      });
      showToast("Artikel berhasil dibuat", "success");
      setCreateDialog(false);
      fetchArtikels(true);
    } catch (err) {
      console.error("Error creating artikel:", err);
      showToast("Gagal membuat artikel", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update existing artikel
  const handleUpdateArtikel = async () => {
    if (!selectedArtikel) return;
    
    setIsSubmitting(true);
    try {
      await ArtikelService.updateArtikel(selectedArtikel.id, {
        judul_halaman: formData.judul_halaman,
        slug: formData.slug,
        deskripsi: formData.deskripsi,
        category: formData.category,
        status: formData.status,
        gambar: formData.gambar || undefined
      });
      showToast("Artikel berhasil diperbarui", "success");
      setEditDialog(false);
      fetchArtikels(true);
    } catch (err) {
      console.error("Error updating artikel:", err);
      showToast("Gagal memperbarui artikel", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete artikel
  const handleDeleteArtikel = async () => {
    if (!selectedArtikel) return;
    
    setIsSubmitting(true);
    try {
      await ArtikelService.deleteArtikel(selectedArtikel.id);
      showToast("Artikel berhasil dihapus", "success");
      setDeleteDialog(false);
      fetchArtikels(true);
    } catch (err) {
      console.error("Error deleting artikel:", err);
      showToast("Gagal menghapus artikel", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle artikel status
  const handleToggleStatus = async (artikel: Artikel) => {
    try {
      const newStatus = artikel.status === "published" ? "draft" : "published";
      await ArtikelService.updateArtikelStatus(artikel.id, newStatus);
      showToast(`Status artikel berhasil diubah menjadi ${newStatus}`, "success");
      fetchArtikels(true);
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Gagal mengubah status artikel", "error");
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
  
  // Filter artikels based on search term
  const filteredArtikels = artikels.filter((artikel: Artikel) => 
    artikel.judul_halaman.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artikel.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artikel.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="text-green-700 bg-green-100 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="text-yellow-700 bg-yellow-100 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-gray-700 bg-gray-100 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-4 text-gray-600">Memuat data artikel...</p>
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
              <AlertCircle className="w-5 h-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
          <CardFooter className="bg-red-50">
            <Button 
              onClick={() => fetchArtikels()}
              variant="outline"
              className="border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kelola Artikel</h1>
          <p className="text-gray-600">Kelola artikel terbaru</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchArtikels(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} className="bg-[#406386] hover:bg-[#355475]">
            <PlusCircle className="w-4 h-4 mr-2" />
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
          <CardTitle className="text-lg">Daftar Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Judul Artikel</TableHead>
                <TableHead className="w-[150px]">Slug</TableHead>
                <TableHead className="w-[100px]">Kategori</TableHead>
                <TableHead className="w-[100px]">Tanggal</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[100px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArtikels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <p className="text-gray-500">Belum ada data artikel</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openCreateDialog}
                      className="mt-2"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Tambah Artikel Baru
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {filteredArtikels.map((artikel) => (
                <TableRow key={artikel.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {artikel.gambar ? (
                        <div className="w-8 h-8 overflow-hidden bg-gray-100 rounded">
                          <img 
                            src={ArtikelService.getImageUrl(artikel.gambar)} 
                            alt={artikel.judul_halaman}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
                          <Image className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{artikel.judul_halaman}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {artikel.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {artikel.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(artikel.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => handleToggleStatus(artikel)}
                      className="inline-flex rounded-full hover:bg-gray-50"
                    >
                      {getStatusBadge(artikel.status)}
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
                        <DropdownMenuItem onClick={() => openEditDialog(artikel)}>
                          <FileEdit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(artikel)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
            <DialogTitle>Tambah Artikel Baru</DialogTitle>
            <DialogDescription>
              Buat artikel baru pada website
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="judul_halaman">Judul Artikel</Label>
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
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
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
              <Label htmlFor="deskripsi">Konten / Deskripsi</Label>
              <Textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Tulis konten atau deskripsi halaman"
                className="h-40 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gambar" className="text-sm font-medium text-gray-700">Gambar</Label>
              <div className="mt-1">
                <label 
                  htmlFor="gambar"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG atau GIF (Max. 2MB)</p>
                  </div>
                  <Input
                    id="gambar"
                    name="gambar"
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                {formData.gambar && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700">
                      ✓ File terpilih: {formData.gambar.name}
                    </p>
                  </div>
                )}
              </div>
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
              onClick={handleCreateArtikel}
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
            <DialogTitle>Edit Artikel</DialogTitle>
            <DialogDescription>
              Perbarui informasi artikel
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* --- Input Judul --- */}
            <div>
              <Label htmlFor="edit_judul_halaman">Judul Artikel</Label>
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
                  onValueChange={(value) => setFormData({ ...formData, status: value as "draft" | "published" | "archived" })}
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
                className="h-40 mt-1"
              />
            </div>

            {/* --- Gambar --- */}
            <div>
              <Label htmlFor="edit_gambar" className="text-sm font-medium text-gray-700">Gambar</Label>
              <div className="mt-1">
                <label 
                  htmlFor="edit_gambar"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG atau GIF (Max. 2MB)</p>
                  </div>
                  <Input
                    id="edit_gambar"
                    name="gambar"
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                {formData.gambar && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700">
                      ✓ File terpilih: {formData.gambar.name}
                    </p>
                  </div>
                )}
              </div>
              {selectedArtikel?.gambar && (
                <div className="mt-3">
                  <p className="mb-2 text-sm font-medium text-gray-700">Gambar Saat Ini:</p>
                  <div className="p-2 border rounded-lg bg-gray-50">
                    <img
                      src={ArtikelService.getImageUrl(selectedArtikel.gambar) || ''}
                      alt={selectedArtikel.judul_halaman}
                      className="object-cover w-32 h-32 border rounded mx-auto"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Upload file baru untuk mengganti gambar ini
                    </p>
                  </div>
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
              onClick={handleUpdateArtikel}
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
            <DialogTitle>Hapus Artikel</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedArtikel && (
              <div className="p-4 border rounded-md bg-red-50">
                <p className="font-medium">{selectedArtikel.judul_halaman}</p>
                <p className="text-sm text-gray-500">{selectedArtikel.slug}</p>
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
              onClick={handleDeleteArtikel}
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
