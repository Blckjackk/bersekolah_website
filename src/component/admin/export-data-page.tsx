"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Download, 
  FileSpreadsheet, 
  Database as DatabaseIcon, 
  Users, 
  GraduationCap, 
  FileText,
  Calendar,
  Loader2
} from "lucide-react";

// Daftar tabel yang dapat diekspor
const exportableTables = [
  {
    id: "users",
    name: "Data Pengguna",
    description: "Informasi pengguna seperti admin, superadmin, dll.",
    icon: Users
  },
  {
    id: "calon_beswans",
    name: "Data Calon Beswan",
    description: "Informasi calon penerima beasiswa.",
    icon: GraduationCap
  },
  {
    id: "beswans",
    name: "Data Beswan",
    description: "Informasi penerima beasiswa aktif.",
    icon: GraduationCap
  },
  {
    id: "beasiswa_applications",
    name: "Data Aplikasi Beasiswa",
    description: "Pendaftaran dan aplikasi beasiswa.",
    icon: FileText
  },
  {
    id: "beasiswa_periods",
    name: "Periode Beasiswa",
    description: "Periode dan jadwal beasiswa.",
    icon: Calendar
  },
  {
    id: "documents",
    name: "Data Dokumen",
    description: "Dokumen-dokumen pendukung.",
    icon: FileText
  },
];

// Format ekspor yang tersedia
const exportFormats = [
  { id: "csv", name: "CSV", extension: ".csv" },
  { id: "excel", name: "Excel", extension: ".xlsx" },
  { id: "json", name: "JSON", extension: ".json" },
];

export default function ExportDataPage() {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<string>("excel");
  const [exportDateRange, setExportDateRange] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handler untuk checkbox tabel
  const handleTableSelect = (tableId: string) => {
    setSelectedTables((prevSelected) => {
      if (prevSelected.includes(tableId)) {
        return prevSelected.filter(id => id !== tableId);
      } else {
        return [...prevSelected, tableId];
      }
    });
  };

  // Handler untuk export semua tabel
  const handleSelectAll = () => {
    if (selectedTables.length === exportableTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(exportableTables.map(table => table.id));
    }
  };

  // Handler untuk mengubah format ekspor
  const handleFormatChange = (value: string) => {
    setExportFormat(value);
  };

  // Handler untuk mengubah rentang tanggal
  const handleDateRangeChange = (value: string) => {
    setExportDateRange(value);
  };

  // Handler untuk eksekusi proses ekspor
  const handleExport = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "Pilih Tabel",
        description: "Silakan pilih minimal satu tabel untuk diekspor.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Menghubungi API endpoint untuk ekspor data
      const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const token = localStorage.getItem('bersekolah_auth_token');
      
      if (!token) {
        throw new Error("Anda harus login untuk mengekspor data");
      }

      // Persiapkan data untuk ekspor
      const requestData = {
        tables: selectedTables,
        format: exportFormat,
        dateRange: exportDateRange
      };      // Jalankan request ke API
      const response = await fetch(`${baseURL}/export-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      // Verifikasi respon
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengunduh data");
      }

      // Ambil file dari respon
      const blob = await response.blob();
      
      // Buat nama file
      const selectedFormat = exportFormats.find(format => format.id === exportFormat);
      const fileExtension = selectedFormat?.extension || '.xlsx';
      const fileName = `bersekolah_export_${new Date().toISOString().slice(0, 10)}${fileExtension}`;

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      // Notifikasi sukses
      toast({
        title: "Ekspor Berhasil",
        description: `Data berhasil diekspor ke file ${fileName}`
      });

    } catch (error) {
      console.error("Ekspor error:", error);
      
      // Notifikasi error
      toast({
        title: "Ekspor Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor data",
        variant: "destructive"
      });
      
      // Mode pengembangan - langsung berikan file contoh
      if (import.meta.env.DEV) {        const dummyData = {
          meta: {
            exported_at: new Date().toISOString(),
            tables: selectedTables,
            format: exportFormat
          },
          data: selectedTables.reduce<Record<string, any[]>>((acc, tableId) => {
            acc[tableId] = [
              { id: 1, name: "Sample Data 1", created_at: new Date().toISOString() },
              { id: 2, name: "Sample Data 2", created_at: new Date().toISOString() }
            ];
            return acc;
          }, {} as Record<string, any[]>)
        };

        // Buat file JSON contoh
        const blob = new Blob([JSON.stringify(dummyData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bersekolah_export_sample_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Mode Pengembangan",
          description: "File contoh telah dibuat untuk mode pengembangan"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ekspor Data</h1>
          <p className="text-muted-foreground">
            Ekspor data dari database untuk kebutuhan analisis atau cadangan
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel pilihan tabel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DatabaseIcon className="w-5 h-5 text-primary" />
                <CardTitle>Pilih Tabel untuk Diekspor</CardTitle>
              </div>
              <CardDescription>
                Pilih tabel yang ingin Anda ekspor datanya
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="select-all" 
                    checked={selectedTables.length === exportableTables.length} 
                    onCheckedChange={handleSelectAll} 
                  />
                  <Label htmlFor="select-all" className="font-medium">Pilih Semua Tabel</Label>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {exportableTables.map((table) => (
                  <div key={table.id} className="flex items-start space-x-3 p-3 border rounded-md">
                    <Checkbox 
                      id={`table-${table.id}`} 
                      checked={selectedTables.includes(table.id)}
                      onCheckedChange={() => handleTableSelect(table.id)}
                    />
                    <div className="grid gap-1.5">
                      <div className="flex items-center gap-2">
                        {table.icon && <table.icon className="w-4 h-4 text-muted-foreground" />}
                        <Label htmlFor={`table-${table.id}`} className="font-medium">{table.name}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">{table.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel opsi ekspor */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <CardTitle>Opsi Ekspor</CardTitle>
            </div>
            <CardDescription>
              Atur format dan parameter lain untuk ekspor data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Format File</Label>
              <Select value={exportFormat} onValueChange={handleFormatChange}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Pilih format ekspor" />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Rentang Waktu</Label>
              <Select value={exportDateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Pilih rentang waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Data</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="this_week">Minggu Ini</SelectItem>
                  <SelectItem value="this_month">Bulan Ini</SelectItem>
                  <SelectItem value="this_year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleExport} 
              className="w-full"
              disabled={isLoading || selectedTables.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Panel petunjuk */}
      <Card>
        <CardHeader>
          <CardTitle>Petunjuk Penggunaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Tentang Ekspor Data</h3>
              <p className="text-sm text-muted-foreground">
                Fitur ini memungkinkan admin untuk mengekspor data dari database Bersekolah. Data yang diekspor dapat digunakan untuk keperluan analisis, cadangan, atau integrasi dengan sistem lain.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Langkah-langkah</h3>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                <li>Pilih tabel yang ingin Anda ekspor datanya</li>
                <li>Pilih format file ekspor (Excel, CSV, atau JSON)</li>
                <li>Tentukan rentang waktu data (opsional)</li>
                <li>Klik tombol "Ekspor Data" dan tunggu proses selesai</li>
                <li>File akan otomatis terunduh ke perangkat Anda</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Perhatian</h3>
              <p className="text-sm text-muted-foreground">
                Data yang diekspor mungkin berisi informasi sensitif. Pastikan untuk menyimpan file hasil ekspor dengan aman dan tidak membagikannya kepada pihak yang tidak berwenang.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
