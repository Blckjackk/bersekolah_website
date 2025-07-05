"use client"

import React, { useState, useEffect } from "react";
import { 
  Search, 
  PlusCircle, 
  FileEdit, 
  Trash2, 
  MoreHorizontal, 
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TestimoniService } from "@/lib/testimoni-service";
import type { Testimoni } from "@/lib/testimoni-service";

export default function TestimoniPage() {
  // State for testimoni data
  const [testimoni, setTestimoni] = useState<Testimoni[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedTestimoni, setSelectedTestimoni] = useState<Testimoni | null>(null);
    
  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    angkatan_beswan: "",
    sekarang_dimana: "",
    isi_testimoni: "",
    status: "active" as 'active' | 'inactive',
    foto_testimoni: ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
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
  
  // Fetch testimoni data on component mount
  useEffect(() => {
    fetchTestimoni();
  }, []);
  
  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 5000);
  };
  
  // Fetch testimoni data
  const fetchTestimoni = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      const data = await TestimoniService.getAllTestimoni();
      console.log('Fetched testimoni data:', data);
      setTestimoni(data);
      
      if (isRefresh) {
        showToast("Data berhasil diperbarui", "success");
      }
    } catch (err) {
      console.error("Error fetching testimoni:", err);
      setError("Gagal memuat data testimoni");
      showToast("Gagal memuat data testimoni", "error");
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

  // Handle status change
  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value as 'active' | 'inactive'
    });
  };
  
  // Handle photo file upload with preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Open create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      nama: "",
      angkatan_beswan: "",
      sekarang_dimana: "",
      isi_testimoni: "",
      status: "active",
      foto_testimoni: ""
    });
    setPhotoFile(null);
    setPhotoPreview("");
    setCreateDialog(true);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      nama: "",
      angkatan_beswan: "",
      sekarang_dimana: "",
      isi_testimoni: "",
      status: "active",
      foto_testimoni: ""
    });
    setPhotoFile(null);
    setPhotoPreview("");
  };
  
  // Handle edit button click
  const handleEditClick = (item: Testimoni) => {
    setSelectedTestimoni(item);
    setFormData({
      nama: item.nama,
      angkatan_beswan: item.angkatan_beswan,
      sekarang_dimana: item.sekarang_dimana || "",
      isi_testimoni: item.isi_testimoni,
      status: item.status,
      foto_testimoni: item.foto_testimoni || ""
    });
    setPhotoFile(null);
    setPhotoPreview("");
    setEditDialog(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (item: Testimoni) => {
    setSelectedTestimoni(item);
    setDeleteDialog(true);
  };
  
  // Handle create testimoni
  const handleCreateTestimoni = async () => {
    try {
      setIsSubmitting(true);
      // Validation
      if (!formData.nama || !formData.angkatan_beswan || !formData.isi_testimoni) {
        showToast("Mohon lengkapi data yang diperlukan", "error");
        return;
      }
      
      // @ts-ignore - TypeScript can't properly recognize the imported service
      const result = await TestimoniService.createTestimoni(formData, photoFile);
      
      showToast("Testimoni berhasil ditambahkan", "success");
      setCreateDialog(false);
      resetForm();
      
      // Refresh data
      fetchTestimoni();
    } catch (err) {
      console.error("Error creating testimoni:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal menambahkan testimoni";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle update testimoni
  const handleUpdateTestimoni = async () => {
    if (!selectedTestimoni) return;
    
    try {
      setIsSubmitting(true);
      // Validation
      if (!formData.nama || !formData.angkatan_beswan || !formData.isi_testimoni) {
        showToast("Mohon lengkapi data yang diperlukan", "error");
        return;
      }
      
      // @ts-ignore - TypeScript can't properly recognize the imported service
      await TestimoniService.updateTestimoni(selectedTestimoni.id, formData, photoFile);
      
      showToast("Testimoni berhasil diperbarui", "success");
      setEditDialog(false);
      resetForm();
      
      // Refresh data
      fetchTestimoni();
    } catch (err) {
      console.error("Error updating testimoni:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal memperbarui testimoni";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete testimoni
  const handleDeleteTestimoni = async () => {
    if (!selectedTestimoni) return;
    try {
      setIsSubmitting(true);
      
      // @ts-ignore - TypeScript can't properly recognize the imported service
      await TestimoniService.deleteTestimoni(selectedTestimoni.id);
      
      showToast("Testimoni berhasil dihapus", "success");
      setDeleteDialog(false);
      
      // Refresh data
      fetchTestimoni();
    } catch (err) {
      console.error("Error deleting testimoni:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal menghapus testimoni";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter testimoni by search term
  const filteredTestimoni = testimoni.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.angkatan_beswan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sekarang_dimana && item.sekarang_dimana.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Simple loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col gap-2 items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data testimoni...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col gap-2 items-center text-destructive">
          <XCircle className="w-8 h-8" />
          <p>{error}</p>
          <Button onClick={() => fetchTestimoni()} variant="outline" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
          toast.type === "success" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
        }`}>
          <div className="flex gap-2 items-center">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={toast.type === "success" ? "text-green-800" : "text-red-800"}>
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Data Testimoni</h2>
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchTestimoni(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 w-4 h-4" />
            Tambah Testimoni
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Testimoni</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimoni.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Testimoni Aktif</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimoni.filter(t => t.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Testimoni Non-aktif</CardTitle>
            <XCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimoni.filter(t => t.status === 'inactive').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Testimoni table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Testimoni</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau angkatan..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Angkatan</TableHead>
                <TableHead>Aktifitas Saat Ini</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestimoni.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada data testimoni
                  </TableCell>
                </TableRow>
              ) : (
                filteredTestimoni.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="overflow-hidden relative w-10 h-10 rounded-full">
                        <img 
                          src={item.foto_testimoni_url || '/storage/testimoni/default.jpg'}
                          alt={item.nama}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/storage/testimoni/default.jpg';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.angkatan_beswan}</TableCell>
                    <TableCell>{item.sekarang_dimana || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-0 w-8 h-8">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            <FileEdit className="mr-2 w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(item)}>
                            <Trash2 className="mr-2 w-4 h-4" />
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tambah Testimoni Baru</DialogTitle>
            <DialogDescription>
              Masukkan data testimoni yang ingin ditambahkan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Contoh: John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="angkatan_beswan">Angkatan Beswan</Label>
                <Input
                  id="angkatan_beswan"
                  name="angkatan_beswan"
                  value={formData.angkatan_beswan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Beswan 2023"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sekarang_dimana">Aktifitas Saat Ini</Label>
              <Input
                id="sekarang_dimana"
                name="sekarang_dimana"
                value={formData.sekarang_dimana}
                onChange={handleInputChange}
                placeholder="Contoh: Mahasiswa S1 Ilmu Komputer UPI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isi_testimoni">Testimoni</Label>
              <Textarea
                id="isi_testimoni"
                name="isi_testimoni"
                value={formData.isi_testimoni}
                onChange={handleInputChange}
                placeholder="Masukkan testimoni di sini"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foto_testimoni">Foto</Label>
              <Input
                id="foto_testimoni"
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
              />
              {photoPreview && (
                <div className="mt-2">
                  <p className="mb-1 text-sm font-medium">Preview foto baru:</p>
                  <div className="overflow-hidden relative w-20 h-20 rounded-md">
                    <img
                      src={photoPreview}
                      alt="Preview foto"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Format: JPG, PNG. Maks 2MB.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Non-aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleCreateTestimoni} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Testimoni</DialogTitle>
            <DialogDescription>
              {selectedTestimoni && `Edit testimoni dari: ${selectedTestimoni.nama}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nama">Nama Lengkap</Label>
                <Input
                  id="edit-nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-angkatan_beswan">Angkatan Beswan</Label>
                <Input
                  id="edit-angkatan_beswan"
                  name="angkatan_beswan"
                  value={formData.angkatan_beswan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Beswan 2023"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sekarang_dimana">Aktifitas Saat Ini</Label>
              <Input
                id="edit-sekarang_dimana"
                name="sekarang_dimana"
                value={formData.sekarang_dimana}
                onChange={handleInputChange}
                placeholder="Contoh: Mahasiswa S1 Ilmu Komputer UPI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-isi_testimoni">Testimoni</Label>
              <Textarea
                id="edit-isi_testimoni"
                name="isi_testimoni"
                value={formData.isi_testimoni}
                onChange={handleInputChange}
                placeholder="Masukkan testimoni di sini"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-foto_testimoni">Foto</Label>
              <Input
                id="edit-foto_testimoni"
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
              />
              <div className="flex gap-4 mt-2">
                {selectedTestimoni?.foto_testimoni_url && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Foto saat ini:</p>
                    <div className="overflow-hidden relative w-20 h-20 rounded-md">
                      <img
                        src={selectedTestimoni.foto_testimoni_url || '/storage/testimoni/default.jpg'}
                        alt="Foto testimoni saat ini"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/storage/testimoni/default.jpg';
                        }}
                      />
                    </div>
                  </div>
                )}
                {photoPreview && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Preview foto baru:</p>
                    <div className="overflow-hidden relative w-20 h-20 rounded-md">
                      <img
                        src={photoPreview}
                        alt="Preview foto baru"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Format: JPG, PNG. Maks 2MB. Kosongkan jika tidak ingin mengubah foto.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Non-aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleUpdateTestimoni} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Testimoni</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus testimoni ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTestimoni && (
              <div className="flex gap-4 items-center p-4 rounded-md border bg-muted/50">
                <div className="overflow-hidden relative w-16 h-16 rounded-full">
                  <img
                    src={selectedTestimoni?.foto_testimoni_url || '/storage/testimoni/default.jpg'}
                    alt={selectedTestimoni?.nama}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/storage/testimoni/default.jpg';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedTestimoni.nama}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTestimoni.angkatan_beswan}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteTestimoni} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
