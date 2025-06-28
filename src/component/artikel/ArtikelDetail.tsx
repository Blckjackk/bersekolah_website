"use client";
import { useEffect, useState } from "react";

interface Article {
  id: number;
  gambar: string;
  judul_halaman: string;
  category: string;
  created_at: string;
  author: string;
  deskripsi: string;
}

const ArtikelDetail = ({ articleId }: { articleId: string | null }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/api/konten/${articleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setArticle(data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching article:", error);
        setLoading(false);
      });
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-t-2 border-b-2 border-[#406386] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-xl text-gray-600">Artikel tidak ditemukan</p>
        <a href="/artikel" className="text-[#406386] hover:underline">
          Kembali ke Daftar Artikel
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${article.gambar ? `../ImageTemp/${article.gambar}` : "/assets/image/default-thumbnail.jpg"})`
          }}
        />
        <div className="container relative z-10 px-4 mx-auto text-center text-white">
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium bg-[#406386]/90 rounded-full">
            {article.category}
          </span>
          <h1 className="max-w-4xl mx-auto mb-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {article.judul_halaman}
          </h1>
          <div className="flex items-center justify-center gap-4 text-lg">
            <span>{article.author}</span>
            <span>•</span>
            <time>{new Date(article.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</time>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-gray">
              <p className="text-xl leading-relaxed text-gray-700">
                {article.deskripsi}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ArtikelDetail;