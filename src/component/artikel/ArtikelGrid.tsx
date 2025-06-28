import React from "react";

export interface Artikel {
  id: number;
  judul_halaman: string;
  deskripsi: string;
  gambar_url?: string;
  created_at?: string;
  category?: string;
  status?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArtikelGrid({ artikels }: { artikels: Artikel[] }) {
  if (!artikels || artikels.length === 0) {
    return <div className="text-center text-gray-500 col-span-full">Belum ada artikel.</div>;
  }
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
      {artikels.map((artikel) => (
        <div
          key={artikel.id}
          className="flex flex-col overflow-hidden duration-200 bg-white border shadow-xl group rounded-3xl border-slate-100 hover:shadow-2xl hover:-translate-y-1 animate-fadein"
          style={{ minHeight: 440 }}
        >
          <div className="relative">
            <img
              src={artikel.gambar_url || "/assets/image/artikel/default.jpg"}
              alt={artikel.judul_halaman}
              className="object-cover w-full h-48 transition duration-200 border-b md:h-56 border-slate-100 group-hover:scale-105"
              loading="lazy"
              onError={e => {
                (e.target as HTMLImageElement).src = "/assets/image/artikel/default.jpg";
              }}
            />
            <div className="absolute top-3 left-3 bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-[#406386] shadow">
              {formatDate(artikel.created_at)}
            </div>
            {artikel.category && (
              <div className="absolute px-3 py-1 text-xs font-semibold text-blue-700 rounded-full shadow top-3 right-3 bg-blue-50">
                {artikel.category}
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 p-5 md:p-6">
            <h2 className="text-xl font-extrabold mb-2 line-clamp-2 text-[#406386] group-hover:text-blue-700 transition drop-shadow-sm">
              {artikel.judul_halaman}
            </h2>
            <p className="mb-4 text-base leading-relaxed text-gray-700 line-clamp-3">{artikel.deskripsi}</p>
            <a
              href={`/artikel/artikel-detail?id=${artikel.id}`}
              className="mt-auto inline-block font-semibold text-white bg-[#406386] hover:bg-blue-700 px-5 py-2 rounded-full transition shadow group-hover:scale-105"
            >
              Baca Selengkapnya
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

// Tambahkan animasi fadein jika ingin:
// .animate-fadein { animation: fadein 0.7s cubic-bezier(.4,0,.2,1); }
// @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none;} }
