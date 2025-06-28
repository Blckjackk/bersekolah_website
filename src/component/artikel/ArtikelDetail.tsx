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
    console.log("ArtikelDetailComponent id from query:", id);
    if (!id || id.trim() === "") {
      setError("ID artikel tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const url = `${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/artikels/${id}`;
    console.log("Fetching artikel detail from:", url);
    fetch(url)
      .then(res => {
        console.log("API response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("API response data:", data);
        if (data && data.data) {
          setArtikel(data.data);
        } else {
          setError("Artikel tidak ditemukan.");
        }
      })
      .catch((err) => {
        setError("Gagal mengambil data artikel.");
        console.error("Fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-500">Memuat artikel...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!artikel) return null;

  return (
    <article className="max-w-3xl p-6 mx-auto mt-8 mb-16 bg-white shadow rounded-2xl md:p-10">
      <img
        src={artikel.gambar_url || "/assets/image/artikel/default.jpg"}
        alt={artikel.judul_halaman}
        className="object-cover w-full h-64 mb-6 border rounded-xl"
        onError={e => {
          (e.target as HTMLImageElement).src = "/assets/image/artikel/default.jpg";
        }}
      />
      <h1 className="text-3xl font-bold text-[#406386] mb-2">{artikel.judul_halaman}</h1>
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span>{formatDate(artikel.created_at)}</span>
        {artikel.category && <span className="px-2 py-1 text-xs font-semibold text-blue-700 rounded bg-blue-50">{artikel.category}</span>}
        {artikel.status && <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-500">{artikel.status}</span>}
      </div>
      <div className="text-lg leading-relaxed prose text-gray-800 max-w-none" dangerouslySetInnerHTML={{ __html: artikel.deskripsi }} />
    </article>
  );
}