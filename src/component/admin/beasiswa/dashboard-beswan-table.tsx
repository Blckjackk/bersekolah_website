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

type Beswan = {
  id: string;
  nama_lengkap?: string;
  nama?: string;
  email?: string;
  phone?: string;
  no_hp?: string;
  created_at?: string;
  foto?: string;
  jenis_kelamin?: string;
  agama?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  status?: string;
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

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

const DashboardBeswanTable: React.FC = () => {
  const [data, setData] = useState<Beswan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Beswan | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("bersekolah_auth_token");
      const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      try {
        const res = await fetch(`${baseURL}/beswan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json.data || []);
      } catch (e) {
        setData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>No. HP</TableHead>
            <TableHead>Tanggal Registrasi</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                Memuat data beswan...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Tidak ada data beswan ditemukan
              </TableCell>
            </TableRow>
          ) : (
            data.map((beswan, idx) => (
              <TableRow key={beswan.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{beswan.nama_lengkap || beswan.nama || "-"}</TableCell>
                <TableCell>{beswan.email || "-"}</TableCell>
                <TableCell>{beswan.phone || beswan.no_hp || "-"}</TableCell>
                <TableCell>{formatDate(beswan.created_at)}</TableCell>
                <TableCell>
                  <button
                    className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:underline"
                    onClick={() => handleShowDetail(beswan.id)}
                  >
                    Detail
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Modal */}
      {(modalLoading || modal || modalError) && (
        <Dialog open={!!(modalLoading || modal || modalError)} onOpenChange={() => { setModal(null); setModalError(null); }}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Beswan</DialogTitle>
              <DialogDescription>
                Data lengkap beswan yang terdaftar
              </DialogDescription>
            </DialogHeader>
            {modalLoading && (
              <div className="py-10 text-center text-muted-foreground">Memuat detail beswan...</div>
            )}
            {modalError && !modalLoading && (
              <div className="py-10 text-center text-red-500">{modalError}</div>
            )}
            {modal && !modalLoading && !modalError && (
              <div className="grid gap-6 py-4">
                {/* Foto jika ada */}
                {modal.foto && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={modal.foto}
                      alt={modal.nama_lengkap || modal.nama || 'Foto Beswan'}
                      className="object-cover w-32 h-32 rounded-full border shadow"
                    />
                  </div>
                )}
                {/* Data Pribadi */}
                <div>
                  <div className="mb-2 text-base font-bold">Data Pribadi</div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <Label>ID</Label>
                    <div>{modal.id}</div>
                    <Label>Nama Lengkap</Label>
                    <div>{modal.nama_lengkap || '-'}</div>
                    <Label>Nama Panggilan</Label>
                    <div>{modal.nama || '-'}</div>
                    <Label>Email</Label>
                    <div>{modal.email || '-'}</div>
                    <Label>No HP</Label>
                    <div>{modal.phone || modal.no_hp || '-'}</div>
                    <Label>Jenis Kelamin</Label>
                    <div>{modal.jenis_kelamin || '-'}</div>
                    <Label>Agama</Label>
                    <div>{modal.agama || '-'}</div>
                    <Label>Tempat Lahir</Label>
                    <div>{modal.tempat_lahir || '-'}</div>
                    <Label>Tanggal Lahir</Label>
                    <div>{formatDate((modal as any).tanggal_lahir)}</div>
                    <Label>Tanggal Registrasi</Label>
                    <div>{formatDate(modal.created_at)}</div>
                    {modal.status && (
                      <Label>Status</Label>
                    )}
                    {modal.status && (
                      <div>
                        <Badge variant="outline">{modal.status}</Badge>
                      </div>
                    )}
                  </div>
                </div>
                {/* Data Pendidikan */}
                {modal.sekolah && (
                  <div>
                    <div className="mt-4 mb-2 text-base font-bold">Data Pendidikan</div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <Label>Asal Sekolah</Label>
                      <div>{modal.sekolah.asal_sekolah || modal.sekolah.nama_sekolah || '-'}</div>
                      <Label>Daerah Sekolah</Label>
                      <div>{modal.sekolah.daerah_sekolah || '-'}</div>
                      <Label>Jurusan</Label>
                      <div>{modal.sekolah.jurusan || '-'}</div>
                      <Label>Tingkat Kelas</Label>
                      <div>{modal.sekolah.tingkat_kelas || modal.sekolah.semester || '-'}</div>
                    </div>
                  </div>
                )}
                {/* Data Keluarga */}
                {modal.keluarga && (
                  <div>
                    <div className="mt-4 mb-2 text-base font-bold">Data Keluarga</div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <Label>Nama Ayah</Label>
                      <div>{modal.keluarga.nama_ayah || '-'}</div>
                      <Label>Pekerjaan Ayah</Label>
                      <div>{modal.keluarga.pekerjaan_ayah || '-'}</div>
                      <Label>Penghasilan Ayah</Label>
                      <div>{modal.keluarga.penghasilan_ayah || modal.keluarga.penghasilan || '-'}</div>
                      <Label>Nama Ibu</Label>
                      <div>{modal.keluarga.nama_ibu || '-'}</div>
                      <Label>Pekerjaan Ibu</Label>
                      <div>{modal.keluarga.pekerjaan_ibu || '-'}</div>
                      <Label>Penghasilan Ibu</Label>
                      <div>{modal.keluarga.penghasilan_ibu || '-'}</div>
                      <Label>Jumlah Saudara Kandung</Label>
                      <div>{modal.keluarga.jumlah_saudara_kandung || '-'}</div>
                      <Label>Jumlah Tanggungan</Label>
                      <div>{modal.keluarga.jumlah_tanggungan || '-'}</div>
                    </div>
                  </div>
                )}
                {/* Data Alamat */}
                {modal.alamat && (
                  <div>
                    <div className="mt-4 mb-2 text-base font-bold">Data Alamat</div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <Label>Alamat Lengkap</Label>
                      <div>{modal.alamat.alamat_lengkap || '-'}</div>
                      <Label>RT</Label>
                      <div>{modal.alamat.rt || '-'}</div>
                      <Label>RW</Label>
                      <div>{modal.alamat.rw || '-'}</div>
                      <Label>Kelurahan/Desa</Label>
                      <div>{modal.alamat.kelurahan_desa || modal.alamat.kelurahan || '-'}</div>
                      <Label>Kecamatan</Label>
                      <div>{modal.alamat.kecamatan || '-'}</div>
                      <Label>Kota/Kabupaten</Label>
                      <div>{modal.alamat.kota_kabupaten || '-'}</div>
                      <Label>Provinsi</Label>
                      <div>{modal.alamat.provinsi || '-'}</div>
                      <Label>Kode Pos</Label>
                      <div>{modal.alamat.kode_pos || '-'}</div>
                      <Label>Nomor Telepon</Label>
                      <div>{modal.alamat.nomor_telepon || '-'}</div>
                      <Label>Kontak Darurat</Label>
                      <div>{modal.alamat.kontak_darurat || '-'}</div>
                      <Label>Email</Label>
                      <div>{modal.alamat.email || '-'}</div>
                    </div>
                  </div>
                )}
                {/* Data Lainnya */}
                <div>
                  <div className="mt-4 mb-2 text-base font-bold">Data Lainnya</div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {Object.entries(modal).map(([key, value]) => {
                      if (["id","nama_lengkap","nama","email","phone","no_hp","jenis_kelamin","agama","tempat_lahir","tanggal_lahir","created_at","status","foto","sekolah","keluarga","alamat"].includes(key)) return null;
                      if (typeof value === "object" && value !== null) return null;
                      return (
                        <React.Fragment key={key}>
                          <Label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                          <div>{String(value)}</div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setModal(null); setModalError(null); }}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
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