import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Shield, 
  RefreshCcw
} from "lucide-react";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  phone?: string; // Adding phone as optional since existing data might not have it
  created_at: string;
  updated_at: string;
}

export default function ManageAdminPage() {
  // State untuk menyimpan data pengguna dan status superadmin
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "admin",
    phone: "",
  });
  
  const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  
  // Periksa apakah user adalah superadmin
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('bersekolah_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userIsSuperAdmin = user.role === 'superadmin';
        setIsSuperAdmin(userIsSuperAdmin);
        
        // Redirect jika bukan superadmin
        if (!userIsSuperAdmin) {
          toast({
            title: "Akses ditolak",
            description: "Anda tidak memiliki akses untuk halaman ini. Hanya Super Admin yang dapat mengakses halaman Manajemen Admin.",
            variant: "destructive"
          });
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      } else {
        // Redirect jika tidak ada data user
        window.location.href = "/masuk";
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  }, []);
  
  // Fungsi untuk mengambil data admin
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }
      
      // Coba gunakan endpoint /users untuk mendapatkan semua user
      console.log("Mencoba mendapatkan semua user dari endpoint /users...");
      const usersResponse = await fetch(`${baseURL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (usersResponse.ok) {
        // Jika berhasil, filter untuk role admin dan superadmin
        const allUsers = await usersResponse.json();
        console.log("Data semua user:", allUsers);
        
        // Filter untuk admin dan superadmin saja
        const adminUsers = Array.isArray(allUsers) ? 
          allUsers.filter(user => user.role === 'admin' || user.role === 'superadmin') :
          [];
          
        console.log("Data admin yang difilter:", adminUsers);
        
        if (adminUsers.length > 0) {
          setAdmins(adminUsers);
          return; // Keluar dari fungsi jika data berhasil diambil
        } else {
          console.warn("Endpoint /users tersedia, tetapi tidak ada admin/superadmin yang ditemukan");
        }
      } else {
        console.error(`Error dari endpoint /users: ${usersResponse.status}`);
      }
      
      // Fallback: Gunakan endpoint /me untuk mendapatkan data user saat ini
      console.log("Fallback ke endpoint /me...");
      const userResponse = await fetch(`${baseURL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Error mendapatkan data user saat ini: ${userResponse.status}`);
      }
      
      // Dapatkan data user saat ini
      const userData = await userResponse.json();
      console.log("Data user saat ini:", userData);
      
      // Coba tambahkan dummy admin untuk testing
      const dummyAdmins: Admin[] = [
        {
          id: userData.id || 1,
          name: userData.name || 'Super Admin',
          email: userData.email || 'superadmin@bersekolah.com',
          role: 'superadmin',
          phone: userData.phone || '08123456789', // Add phone with default value
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString()
        },
        {
          id: 2,
          name: 'Admin Bersekolah',
          email: 'admin@bersekolah.com',
          role: 'admin',
          phone: '08198765432', // Add phone with default value
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Tampilkan dummy admin untuk testing
      console.log("Menampilkan dummy admin untuk testing");
      setAdmins(dummyAdmins);
      
      toast({
        title: "Informasi",
        description: "Menampilkan data dummy admin dan superadmin untuk testing. Endpoint API user management belum diimplementasikan dengan benar.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Gagal memuat data admin",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data saat komponen dimount
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }
      
      // Validasi password match jika sedang menambah admin baru atau mengubah password
      if (!editingAdmin || (formData.password && formData.password_confirmation)) {
        if (formData.password !== formData.password_confirmation) {
          toast({
            title: "Konfirmasi password tidak cocok",
            description: "Pastikan password dan konfirmasi password sama",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // URL dan method tergantung pada apakah sedang edit atau tambah baru
      const url = editingAdmin 
        ? `${baseURL}/users/${editingAdmin.id}` 
        : `${baseURL}/users`;
      
      const method = editingAdmin ? 'PUT' : 'POST';
      
      // Data untuk dikirim ke API
      const dataToSend = {
        ...formData,
        // Jika edit dan password kosong, jangan kirim password
        ...(editingAdmin && !formData.password && {
          password: undefined,
          password_confirmation: undefined
        })
      };
      
      console.log(`Mengirim ${method} request ke ${url} dengan data:`, dataToSend);
      
      // Cek terlebih dahulu apakah endpoint tersedia dengan OPTIONS request
      try {
        const checkResponse = await fetch(url, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        // Jika endpoints tidak tersedia (404), tampilkan pesan error untuk developer
        if (checkResponse.status === 404) {
          throw new Error("Endpoint pengelolaan user tidak tersedia di API");
        }
      } catch (error) {
        console.error("API endpoint check failed:", error);
        // Tampilkan pesan ini untuk user
        toast({
          title: "API Tidak Tersedia",
          description: "Endpoint API untuk mengelola admin belum diimplementasikan di backend. Silakan hubungi developer.",
          variant: "destructive"
        });
        
        // Log pesan untuk developer
        console.error(`
          DEVELOPER NOTE: 
          Endpoint yang diperlukan untuk halaman ini tidak tersedia.
          Perlu diimplementasikan di backend:
          
          Route::middleware(['auth:sanctum', 'role:superadmin'])->group(function () {
              Route::get('/users', 'AuthController@getUsers');
              Route::post('/users', 'AuthController@createUser');
              Route::put('/users/{id}', 'AuthController@updateUser');
              Route::delete('/users/{id}', 'AuthController@deleteUser');
          });
        `);
        setIsSubmitting(false);
        return;
      }
      
      // Jika endpoint tersedia, lanjutkan dengan request
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      await fetchAdmins(); // Refresh data
      setOpenDialog(false);
      
      toast({
        title: editingAdmin ? "Admin berhasil diperbarui" : "Admin baru berhasil ditambahkan",
        description: `${formData.name} telah ${editingAdmin ? 'diperbarui' : 'ditambahkan'} sebagai ${formData.role}`,
      });
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Gagal menyimpan data",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete admin
  const handleDelete = async (admin: Admin) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus admin ${admin.name}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('bersekolah_auth_token');
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }
      
      // Cek terlebih dahulu apakah endpoint tersedia dengan OPTIONS request
      try {
        const checkResponse = await fetch(`${baseURL}/users/${admin.id}`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        // Jika endpoints tidak tersedia (404), tampilkan pesan error untuk developer
        if (checkResponse.status === 404) {
          throw new Error("Endpoint pengelolaan user tidak tersedia di API");
        }
      } catch (error) {
        console.error("API endpoint check failed:", error);
        // Tampilkan pesan ini untuk user
        toast({
          title: "API Tidak Tersedia",
          description: "Endpoint API untuk menghapus admin belum diimplementasikan di backend. Silakan hubungi developer.",
          variant: "destructive"
        });
        
        // Log pesan untuk developer
        console.error(`
          DEVELOPER NOTE: 
          Endpoint DELETE /users/{id} tidak tersedia. 
          Perlu diimplementasikan di backend.
        `);
        return;
      }
      
      const response = await fetch(`${baseURL}/users/${admin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      await fetchAdmins(); // Refresh data
      
      toast({
        title: "Admin berhasil dihapus",
        description: `${admin.name} telah dihapus dari sistem`,
      });
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Gagal menghapus admin",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus admin",
        variant: "destructive"
      });
    }
  };
  
  // Handle edit admin
  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      password_confirmation: "",
      role: admin.role,
      phone: admin.phone || "", // Tambahkan field phone
    });
    setOpenDialog(true);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "admin",
      phone: "",
    });
    setEditingAdmin(null);
  };
  
  // Filtered admins berdasarkan search query
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (admin.phone && admin.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Format tanggal dengan error handling
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    
    try {
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "-";
    }
  };
  
  return (
    <div className="container py-6 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Admin</h1>
          <p className="text-muted-foreground">
            Kelola akun admin untuk mengakses dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetForm();
                    setOpenDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAdmin ? "Edit Admin" : "Tambah Admin Baru"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAdmin 
                        ? "Perbarui informasi admin yang sudah ada" 
                        : "Tambahkan admin baru ke sistem"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nama
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="col-span-3"
                          required
                        />
                      </div>
                      
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="col-span-3"
                          required
                        />
                      </div>
                      
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="col-span-3"
                          required={!editingAdmin}
                          placeholder={editingAdmin ? "Kosongkan jika tidak diubah" : ""}
                        />
                      </div>
                      
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="password_confirmation" className="text-right">
                          Konfirmasi
                        </Label>
                        <Input
                          id="password_confirmation"
                          type="password"
                          value={formData.password_confirmation}
                          onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                          className="col-span-3"
                          required={!editingAdmin}
                          placeholder={editingAdmin ? "Kosongkan jika tidak diubah" : ""}
                        />
                      </div>
                      
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({...formData, role: value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Pilih role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="phone" className="text-right">
                          No. Telepon
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="col-span-3"
                          required
                          placeholder="Format: 08xxxxxxxxxx"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setOpenDialog(false)}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Menyimpan..." : (editingAdmin ? "Perbarui" : "Simpan")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={fetchAdmins}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari admin berdasarkan nama, email, telepon, atau role..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
        <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-16 h-16 border-4 rounded-full border-primary/20 border-t-primary animate-spin"></div>
              <p className="text-muted-foreground">Memuat data admin...</p>
            </div>
          ) : !isSuperAdmin ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <Shield className="w-16 h-16 text-muted-foreground" />
              <h3 className="text-lg font-medium">Akses Terbatas</h3>
              <p className="max-w-md text-muted-foreground">
                Hanya Super Admin yang dapat mengakses halaman Manajemen Admin. Anda akan dialihkan ke Dashboard.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>No. Telepon</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead>Diperbarui</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phone || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Shield className={`w-4 h-4 mr-1 ${admin.role === 'superadmin' ? 'text-red-500' : 'text-blue-500'}`} />
                          <span className={admin.role === 'superadmin' ? 'text-red-500 font-medium' : ''}>
                            {admin.role === 'admin' ? 'Admin' : 'Super Admin'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(admin.created_at)}</TableCell>
                      <TableCell>{formatDate(admin.updated_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(admin)}
                          disabled={admin.role === 'superadmin' && admin.id !== 1} // Prevent editing other superadmins
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600" 
                          onClick={() => handleDelete(admin)}
                          disabled={admin.role === 'superadmin' && admin.id !== 1} // Prevent deleting other superadmins
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      {searchQuery 
                        ? "Tidak ada admin yang sesuai dengan pencarian Anda" 
                        : "Tidak ada admin yang terdaftar. Klik tombol 'Tambah Admin' untuk menambahkan admin baru."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t">
          <div className="text-sm text-muted-foreground">
            Total {filteredAdmins.length} admin {searchQuery && `(filter: "${searchQuery}")`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
