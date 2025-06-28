import React from "react";

export interface Artikel {
  id: number;
  judul_halaman: string;
  deskripsi: string;
  gambar_url?: string;
  created_at?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArtikelGrid({ artikels }: { artikels: Artikel[] }) {
  if (!artikels || artikels.length === 0) {
    return <div className="col-span-full text-center text-gray-500">Belum ada artikel.</div>;
  }
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {artikels.map((artikel) => (
        <div
          key={artikel.id}
          className="group p-4 bg-white rounded-2xl shadow hover:shadow-2xl transition flex flex-col border border-slate-100 hover:-translate-y-1 duration-200"
          style={{ minHeight: 420 }}
        >
          <div className="relative mb-4">
            <img
              src={artikel.gambar_url || "/assets/image/artikel/default.jpg"}
              alt={artikel.judul_halaman}
              className="object-cover w-full h-48 rounded-xl border transition group-hover:scale-105 duration-200"
              loading="lazy"
              onError={e => {
                (e.target as HTMLImageElement).src = "/assets/image/artikel/default.jpg";
              }}
            />
            <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-[#406386] font-semibold shadow">
              {formatDate(artikel.created_at)}
            </div>
          </div>
          <h2 className="text-xl font-bold mb-1 line-clamp-2 text-[#406386] group-hover:text-blue-700 transition">{artikel.judul_halaman}</h2>
          <p className="mb-3 text-gray-700 line-clamp-3">{artikel.deskripsi}</p>
          <a
            href={`/artikel/artikel-detail?id=${artikel.id}`}
            className="mt-auto inline-block font-medium text-white bg-[#406386] hover:bg-blue-700 px-4 py-2 rounded transition shadow group-hover:scale-105"
          >
            Baca Selengkapnya
          </a>
        </div>
      ))}
    </div>
  );
}
