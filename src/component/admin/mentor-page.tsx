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
  Loader2
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
import { Switch } from "@/components/ui/switch";

import { MentorService } from "@/lib/mentor-service";
import type { Mentor } from "@/lib/mentor-service";

export default function MentorPage() {
  // State for mentor data
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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
  
  // Fetch mentors data on component mount
  useEffect(() => {
    fetchMentors();
  }, []);
  
  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 5000);
  };
  
  // Fetch mentors data
  const fetchMentors = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
        setError(null);
      const data = await MentorService.getAllMentors();
      console.log('Fetched mentor data:', data);
      setMentors(data);
      
      if (isRefresh) {
        showToast("Data berhasil diperbarui", "success");
      }
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError("Gagal memuat data mentor");
      showToast("Gagal memuat data mentor", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form switch changes  // handleSwitchChange removed as is_active is no longer used
  
  // Handle photo file upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };
  
  // Open create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      name: "",
      email: "",
      photo: ""
    });
    setPhotoFile(null);
    setCreateDialog(true);
  };
  
  // Open edit dialog
  const handleEditClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setFormData({
      name: mentor.name,
      email: mentor.email,
      photo: mentor.photo || ""
    });
    setEditDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setDeleteDialog(true);
  };
  
  // Handle create mentor
  const handleCreateMentor = async () => {
    try {
      setIsSubmitting(true);
      
      const result = await MentorService.createMentor(formData, photoFile);
      
      showToast("Mentor berhasil ditambahkan", "success");
      setCreateDialog(false);
      await fetchMentors();
    } catch (err) {
      console.error("Error creating mentor:", err);
      showToast("Gagal menambahkan mentor", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle update mentor
  const handleUpdateMentor = async () => {
    if (!selectedMentor) return;
    
    try {
      setIsSubmitting(true);
      
      await MentorService.updateMentor(selectedMentor.id, formData, photoFile);
      
      showToast("Mentor berhasil diperbarui", "success");
      setEditDialog(false);
      await fetchMentors();
    } catch (err) {
      console.error("Error updating mentor:", err);
      showToast("Gagal memperbarui mentor", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete mentor
  const handleDeleteMentor = async () => {
    if (!selectedMentor) return;
    
    try {
      setIsSubmitting(true);
      
      await MentorService.deleteMentor(selectedMentor.id);
      
      showToast("Mentor berhasil dihapus", "success");
      setDeleteDialog(false);
      await fetchMentors();
    } catch (err) {
      console.error("Error deleting mentor:", err);
      showToast("Gagal menghapus mentor", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
    // Handle toggle mentor status removed as it's no longer needed
    // Filter mentors by search term
  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simple loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Memuat data mentor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white transition-all duration-300`}>
          <p>{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Mentor</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchMentors(true)} 
            variant="outline" 
            size="sm" 
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreateDialog} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Mentor
          </Button>
        </div>
      </div>

      {/* Search and filter */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" /> 
            Daftar Mentor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="search" className="sr-only">
              Cari Mentor
            </Label>
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Cari berdasarkan nama atau email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats summary */}
          <div className="grid gap-4 mb-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Mentor</p>
                    <p className="text-2xl font-bold">{mentors.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktif</p>
                    <p className="text-2xl font-bold">{mentors.length}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Non-aktif</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Mentors table */}          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada data mentor
                  </TableCell>
                </TableRow>
              ) : (
                filteredMentors.map((mentor) => (                  <TableRow key={mentor.id}>
                    <TableCell>
                      <div className="relative w-10 h-10 overflow-hidden rounded-full">
                        <img 
                          src={mentor.photo && `/${mentor.photo}`} 
                          alt={mentor.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{mentor.name}</TableCell>
                    <TableCell>{mentor.email}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-8 h-8 p-0">
                            <span className="sr-only">Menu</span>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(mentor)}>
                            <FileEdit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(mentor)} className="text-red-600 focus:text-red-600">
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tambah Mentor Baru</DialogTitle>
            <DialogDescription>
              Lengkapi form berikut untuk menambahkan mentor baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Contoh: john.doe@bersekolah.org"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Foto</Label>
              <Input
                id="photo"
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
              />
              <p className="text-sm text-muted-foreground">
                Format: JPG, PNG. Maks 2MB.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleCreateMentor} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
            <DialogTitle>Edit Mentor</DialogTitle>
            <DialogDescription>
              {selectedMentor && `Edit data untuk mentor: ${selectedMentor.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-photo">Foto</Label>
              <Input
                id="edit-photo"
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
              />
              {formData.photo && (
                <div className="mt-2">
                  <p className="mb-1 text-sm font-medium">Foto saat ini:</p>
                  <div className="relative w-20 h-20 overflow-hidden rounded-md">
                    <img
                      src={`/${formData.photo}`}
                      alt="Foto mentor"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleUpdateMentor} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
            <DialogTitle>Konfirmasi Hapus Mentor</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus mentor ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMentor && (
              <div className="flex items-center gap-4 p-4 border rounded-md bg-muted/50">
                <div className="relative w-16 h-16 overflow-hidden rounded-full">
                  <img                    src={selectedMentor.photo ? `/${selectedMentor.photo}` : ''}
                    alt={selectedMentor.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '';
                    }}
                  />
                </div>
                <div>                  <h4 className="font-medium">{selectedMentor.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedMentor.email}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteMentor} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
