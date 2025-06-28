"use client";
import React, { useEffect, useState } from "react";

interface Artikel {
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

export default function ArtikelDetailComponent() {
  const [artikel, setArtikel] = useState<Artikel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let id = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      id = params.get("id") || "";
    }
    if (!id || id.trim() === "") {
      setError("ID artikel tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const url = `${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/artikels/${id}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setArtikel(data.data);
        } else {
          setError("Artikel tidak ditemukan.");
        }
      })
      .catch(() => setError("Gagal mengambil data artikel."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-500">Memuat artikel...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!artikel) return null;

  return (
    <article className="max-w-3xl mx-auto mt-10 mb-20 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadein">
      <div className="relative">
        <img
          src={artikel.gambar_url || "/assets/image/artikel/default.jpg"}
          alt={artikel.judul_halaman}
          className="object-cover w-full h-64 md:h-80 lg:h-96 border-b border-slate-100"
          onError={e => {
            (e.target as HTMLImageElement).src = "/assets/image/artikel/default.jpg";
          }}
        />
        <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-[#406386] shadow">
          {formatDate(artikel.created_at)}
        </div>
        {artikel.category && (
          <div className="absolute top-4 right-4 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 shadow">
            {artikel.category}
          </div>
        )}
      </div>
      <div className="p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#406386] mb-4 leading-tight drop-shadow-sm">
          {artikel.judul_halaman}
        </h1>
        {artikel.status && (
          <span className="inline-block mb-4 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">
            {artikel.status}
          </span>
        )}
        <div className="prose max-w-none text-lg text-gray-800 leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: artikel.deskripsi }} />
      </div>
    </article>
  );
}

// Tambahkan animasi fadein jika ingin:
// .animate-fadein { animation: fadein 0.7s cubic-bezier(.4,0,.2,1); }
// @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none;} }