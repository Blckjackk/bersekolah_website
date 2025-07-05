import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";

type Beswan = {
  id: string;
  nama_panggilan?: string;
  user_name?: string;
  email?: string;
  phone?: string;
  no_hp?: string;
  created_at?: string;
  foto?: string;
  jenis_kelamin?: string;
  agama?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  application_status?: string;
  submitted_at?: string;
  sekolah?: {
    nama_sekolah?: string;
    jenjang?: string;
    jurusan?: string;
    semester?: string;
    ipk?: string;
    [key: string]: any;
  };
  keluarga?: {
    nama_ayah?: string;
    pekerjaan_ayah?: string;
    nama_ibu?: string;
    pekerjaan_ibu?: string;
    penghasilan?: string;
    [key: string]: any;
  };
  alamat?: {
    alamat_lengkap?: string;
    rt_rw?: string;
    kelurahan?: string;
    kecamatan?: string;
    kota_kabupaten?: string;
    provinsi?: string;
    kode_pos?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const DashboardBeswanTable: React.FC = () => {
  const [data, setData] = useState<Beswan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Beswan | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Beswan[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter data based on search term
    const filtered = data.filter((beswan) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (beswan.nama_panggilan?.toLowerCase().includes(searchLower) || false) ||
        (beswan.user_name?.toLowerCase().includes(searchLower) || false) ||
        (beswan.email?.toLowerCase().includes(searchLower) || false) ||
        (beswan.phone?.toLowerCase().includes(searchLower) || false)
      );
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("bersekolah_auth_token");
    const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${baseURL}/beswan/accepted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === 'success') {
        setData(json.data || []);
      } else {
        setData([]);
      }
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  };

  // Handler untuk fetch detail beswan
  const handleShowDetail = async (beswanId: string) => {
    setModalLoading(true);
    setModalError(null);
    setModal(null);
    const token = localStorage.getItem("bersekolah_auth_token");
    const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${baseURL}/beswan/${beswanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Gagal fetch detail beswan: ${res.status}`);
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setModal(json.data);
      } else {
        setModalError('Data beswan tidak ditemukan');
      }
    } catch (e: any) {
      setModalError(e?.message || 'Gagal memuat detail beswan');
    } finally {
      setModalLoading(false);
    }
  };

  // Handler untuk reject beswan
  const handleRejectBeswan = async (beswanId: string) => {
    if (!confirm('Apakah Anda yakin ingin mengubah status beswan ini menjadi tidak lolos?')) {
      return;
    }

    const token = localStorage.getItem("bersekolah_auth_token");
    const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${baseURL}/beswan/${beswanId}/reject`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) throw new Error(`Gagal update status beswan: ${res.status}`);
      
      const json = await res.json();
      if (json.status === 'success') {
        alert('Status beswan berhasil diubah menjadi tidak lolos');
        fetchData(); // Refresh data
      } else {
        alert('Gagal mengubah status beswan');
      }
    } catch (e: any) {
      alert(e?.message || 'Gagal mengubah status beswan');
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Cari beswan berdasarkan nama, email, atau nomor telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead>Nama Panggilan</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>No. HP</TableHead>
            <TableHead>Tanggal Registrasi</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center">
                Memuat data beswan...
              </TableCell>
            </TableRow>
          ) : filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                {searchTerm ? 'Tidak ada data beswan yang sesuai dengan pencarian' : 'Tidak ada data beswan yang lolos ditemukan'}
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((beswan, idx) => (
              <TableRow key={beswan.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{beswan.user_name || "-"}</TableCell>
                <TableCell>{beswan.nama_panggilan || "-"}</TableCell>
                <TableCell>{beswan.email || "-"}</TableCell>
                <TableCell>{beswan.phone || beswan.no_hp || "-"}</TableCell>
                <TableCell>{formatDate(beswan.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:underline"
                      onClick={() => handleShowDetail(beswan.id)}
                    >
                      Detail
                    </button>
                    <button
                      className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 flex items-center gap-1"
                      onClick={() => handleRejectBeswan(beswan.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal */}
      <Dialog open={!!(modalLoading || modal || modalError)} onOpenChange={() => { setModal(null); setModalError(null); }}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Beswan</DialogTitle>
            <DialogDescription>
              Data lengkap beswan yang lolos seleksi
            </DialogDescription>
          </DialogHeader>
          {modalLoading && (
            <div className="py-10 text-center text-muted-foreground">Memuat detail beswan...</div>
          )}
          {modalError && !modalLoading && (
            <div className="py-10 text-center text-red-500">{modalError}</div>
          )}
          {modal && !modalLoading && (
            <div className="space-y-6">
              {/* Data Pribadi */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Data Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                    <p className="text-sm">{modal.user_name || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nama Panggilan</Label>
                    <p className="text-sm">{modal.nama_panggilan || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm">{modal.user_email || modal.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">No. HP</Label>
                    <p className="text-sm">{modal.user_phone || modal.phone || modal.no_hp || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tempat Lahir</Label>
                    <p className="text-sm">{modal.tempat_lahir || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal Lahir</Label>
                    <p className="text-sm">{formatDate(modal.tanggal_lahir)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Jenis Kelamin</Label>
                    <p className="text-sm">{modal.jenis_kelamin || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Agama</Label>
                    <p className="text-sm">{modal.agama || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Data Sekolah */}
              {modal.sekolah && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Sekolah</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nama Sekolah</Label>
                      <p className="text-sm">{modal.sekolah.asal_sekolah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Daerah Sekolah</Label>
                      <p className="text-sm">{modal.sekolah.daerah_sekolah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Jurusan</Label>
                      <p className="text-sm">{modal.sekolah.jurusan || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tingkat Kelas</Label>
                      <p className="text-sm">{modal.sekolah.tingkat_kelas || "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Keluarga */}
              {modal.keluarga && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Keluarga</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nama Ayah</Label>
                      <p className="text-sm">{modal.keluarga.nama_ayah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Pekerjaan Ayah</Label>
                      <p className="text-sm">{modal.keluarga.pekerjaan_ayah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Penghasilan Ayah</Label>
                      <p className="text-sm">{modal.keluarga.penghasilan_ayah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nama Ibu</Label>
                      <p className="text-sm">{modal.keluarga.nama_ibu || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Pekerjaan Ibu</Label>
                      <p className="text-sm">{modal.keluarga.pekerjaan_ibu || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Penghasilan Ibu</Label>
                      <p className="text-sm">{modal.keluarga.penghasilan_ibu || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Jumlah Saudara Kandung</Label>
                      <p className="text-sm">{modal.keluarga.jumlah_saudara_kandung || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Jumlah Tanggungan</Label>
                      <p className="text-sm">{modal.keluarga.jumlah_tanggungan || "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Alamat */}
              {modal.alamat && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Alamat</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-500">Alamat Lengkap</Label>
                      <p className="text-sm">{modal.alamat.alamat_lengkap || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">RT</Label>
                      <p className="text-sm">{modal.alamat.rt || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">RW</Label>
                      <p className="text-sm">{modal.alamat.rw || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kelurahan/Desa</Label>
                      <p className="text-sm">{modal.alamat.kelurahan_desa || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kecamatan</Label>
                      <p className="text-sm">{modal.alamat.kecamatan || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kota/Kabupaten</Label>
                      <p className="text-sm">{modal.alamat.kota_kabupaten || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Provinsi</Label>
                      <p className="text-sm">{modal.alamat.provinsi || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kode Pos</Label>
                      <p className="text-sm">{modal.alamat.kode_pos || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nomor Telepon</Label>
                      <p className="text-sm">{modal.alamat.nomor_telepon || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kontak Darurat</Label>
                      <p className="text-sm">{modal.alamat.kontak_darurat || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-sm">{modal.alamat.email || "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => { setModal(null); setModalError(null); }}>
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Fungsi untuk fetch statistik dashboard
export async function fetchDashboardStats() {
  const token = localStorage.getItem("bersekolah_auth_token");
  const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  let stats = { totalBeswan: 0, totalDocuments: 0, totalDiterima: 0 };
  try {
    // Coba endpoint /beswan/count
    const res = await fetch(`${baseURL}/beswan/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.data) {
      stats.totalBeswan = json.data.total_beswan || 0;
      stats.totalDocuments = json.data.total_documents || 0;
      stats.totalDiterima = json.data.total_diterima || 0;
      return stats;
    }
  } catch {}
  // Fallback: endpoint lain jika perlu
  try {
    const res = await fetch(`${baseURL}/dashboard/consolidated-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.data) {
      if (json.data.dashboard) {
        stats.totalBeswan = json.data.dashboard.total_pendaftar || 0;
        stats.totalDocuments = json.data.dashboard.total_dokumen || 0;
      }
      if (json.data.applications) {
        stats.totalDiterima = json.data.applications.diterima || 0;
      }
      return stats;
    }
  } catch {}
  // Fallback: individual endpoints
  try {
    const resDoc = await fetch(`${baseURL}/documents/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const docJson = await resDoc.json();
    stats.totalDocuments = docJson.data?.total_documents || docJson.data?.total || docJson.total_documents || docJson.total || 0;
  } catch {}
  try {
    const resApp = await fetch(`${baseURL}/applications/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appJson = await resApp.json();
    if (appJson.data?.overview) {
      stats.totalBeswan = appJson.data.overview.total || 0;
      stats.totalDiterima = appJson.data.overview.diterima || 0;
    } else {
      stats.totalBeswan = appJson.total || 0;
      stats.totalDiterima = appJson.diterima || appJson.approved || 0;
    }
  } catch {}
  return stats;
}

export default DashboardBeswanTable; 