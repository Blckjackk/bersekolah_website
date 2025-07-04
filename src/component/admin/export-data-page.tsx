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
      }      // Persiapkan data untuk ekspor sebagai query params untuk GET request
      const tablesParam = selectedTables.join(',');
      const queryParams = new URLSearchParams({
        tables: tablesParam, 
        format: exportFormat,
        dateRange: exportDateRange
      });      // Set appropriate Accept header based on format and adjust headers
      let acceptHeader = 'application/json';
      
      if (exportFormat === 'excel') {
        acceptHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (exportFormat === 'csv') {
        acceptHeader = 'text/csv';
      }
      
      // Jalankan request ke API
      const response = await fetch(`${baseURL}/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': acceptHeader,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache' 
        }
      });
      
      // Verifikasi respon
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = "Gagal mengunduh data";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Buat nama file
      const selectedFormat = exportFormats.find(format => format.id === exportFormat);
      const fileExtension = selectedFormat?.extension || '.xlsx';
      const fileName = `bersekolah_export_${new Date().toISOString().slice(0, 10)}${fileExtension}`;      // Handle different response types
      const blob = await response.blob();
      if (!blob) {
        throw new Error("Gagal mendapatkan data ekspor");
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
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
      });      // Mode pengembangan - coba lagi dengan URL lokal
      if (import.meta.env.DEV) {
        console.log("DEV mode: Retrying with local URL");
        
        // Coba gunakan URL lokal yang spesifik (ini hanya untuk mode pengembangan)
        const localApiURL = "http://localhost:8000/api";
          try {
          // Get auth token again to be safe
          const devToken = localStorage.getItem('bersekolah_auth_token');
          if (!devToken) {
            throw new Error("Anda harus login untuk mengekspor data");
          }
          
          // Persiapkan data untuk ekspor sebagai query params untuk GET request jika belum ada
          const devTablesParam = selectedTables.join(',');
          const devQueryParams = new URLSearchParams({
            tables: devTablesParam, 
            format: exportFormat,
            dateRange: exportDateRange
          });
          
          // Set headers for API request
          const devHeaders: Record<string, string> = {
            'Authorization': `Bearer ${devToken}`
          };
          
          // For Excel format, we need to accept octet-stream or spreadsheet formats
          if (exportFormat === 'excel') {
            devHeaders['Accept'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream';
          } else if (exportFormat === 'csv') {
            devHeaders['Accept'] = 'text/csv, application/octet-stream';
          } else {
            devHeaders['Accept'] = 'application/json';
          }
          
          // Notifikasi ke pengguna
          toast({
            title: "Mode Pengembangan",
            description: "Mencoba menggunakan API lokal...",
          });
          
          // Coba kembali request dengan URL lokal
          const devResponse = await fetch(`${localApiURL}/export?${devQueryParams.toString()}`, {
            method: 'GET',
            headers: devHeaders
          });
          
          // Tetap tampilkan error jika masih gagal
          if (!devResponse.ok) {
            throw new Error(`Error dari API lokal: ${devResponse.status} ${devResponse.statusText}`);
          }
          
          // Proses response dari API lokal
          let devBlob;
          if (exportFormat === 'json' && devResponse.headers.get('Content-Type')?.includes('application/json')) {
            const jsonData = await devResponse.json();
            devBlob = new Blob([JSON.stringify(jsonData, null, 2)], { 
              type: 'application/json'
            });
          } else {
            devBlob = await devResponse.blob();
          }
          
          // Download file
          const devUrl = window.URL.createObjectURL(devBlob);
          const devAnchor = document.createElement('a');
          devAnchor.href = devUrl;
          
          const devFileName = `bersekolah_export_dev_${exportFormat}_${new Date().toISOString().slice(0, 10)}${
            exportFormats.find(format => format.id === exportFormat)?.extension || '.json'
          }`;
          
          devAnchor.download = devFileName;
          document.body.appendChild(devAnchor);
          devAnchor.click();
          
          setTimeout(() => {
            document.body.removeChild(devAnchor);
            window.URL.revokeObjectURL(devUrl);
          }, 100);
          
          toast({
            title: "Export Berhasil (DEV)",
            description: `Data berhasil diekspor ke file ${devFileName}`,
          });
          
          // Keluar dari handler jika berhasil
          return;
        } catch (devError) {
          console.error("DEV mode retry failed:", devError);
          toast({
            title: "Gagal (DEV Mode)",
            description: "Tidak dapat menggunakan API lokal. Periksa server Anda.",
            variant: "destructive"
          });
          // No longer fallback to dummy data, instead throw the error to be handled properly
          throw new Error("Export gagal: Tidak dapat terhubung ke server API lokal");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6 mx-auto space-y-6">
      <div className="flex justify-between items-center">
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
              <div className="flex gap-2 items-center">
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
                  <div key={table.id} className="flex items-start p-3 space-x-3 rounded-md border">
                    <Checkbox 
                      id={`table-${table.id}`} 
                      checked={selectedTables.includes(table.id)}
                      onCheckedChange={() => handleTableSelect(table.id)}
                    />
                    <div className="grid gap-1.5">
                      <div className="flex gap-2 items-center">
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
            <div className="flex gap-2 items-center">
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
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Download className="mr-2 w-4 h-4" />
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
              <ol className="space-y-1 text-sm list-decimal list-inside text-muted-foreground">
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
