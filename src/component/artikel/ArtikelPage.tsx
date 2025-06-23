"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Image
} from "@heroui/react";
import { Button } from "@/components/ui/button";


interface Article {
  id: number;
  gambar: string;
  judul_halaman: string;
  category: string;
  created_at: string;
  author: string;
  deskripsi: string;
}

const ArtikelPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/konten")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setArticles(data.data);
        } else {
          console.error("Format data tidak sesuai");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setLoading(false);
      });
  }, []);

  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-[#406386]/90 to-[#406386]/85"></div>
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-30"
          style={{ backgroundImage: "url('/assets/image/graduation-cap-sits-top-stack-books.jpg')" }}
        ></div>
        <div className="container relative z-10 px-4 mx-auto text-center text-white sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl sm:mb-6">
              Artikel & Berita
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">
                Seputar Pendidikan
              </span>
            </h1>
            <p className="max-w-4xl mx-auto mb-6 text-base font-light leading-relaxed sm:text-lg md:text-xl lg:text-2xl opacity-90 sm:mb-8">
              Temukan artikel informatif dan inspiratif seputar pendidikan, beasiswa, dan pengembangan diri.
            </p>
          </div>
        </div>
      </section>

      {/* Artikel Terbaru Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#406386] mb-4">
              Artikel Terbaru
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#406386] to-blue-400 mx-auto mb-6"></div>
            <p className="max-w-2xl mx-auto text-gray-600">
              Dapatkan informasi terkini seputar pendidikan dan program beasiswa dari tim Bersekolah
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="w-12 h-12 border-t-2 border-b-2 border-[#406386] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid gap-6 mx-auto md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
              {articles.map((article, index) => (
                <Card
                  key={index}
                  className="overflow-hidden transition-all duration-300 rounded-lg shadow-sm group bg-card text-card-foreground hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={article.gambar ? `../ImageTemp/${article.gambar}` : "/assets/image/default-thumbnail.jpg"}
                      alt={article.judul_halaman}
                      width={400}
                      height={225}
                      className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:opacity-100" />
                    <span className="absolute top-4 left-4 bg-[#406386]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      {article.category}
                    </span>
                  </div>

                  <div className="flex flex-col h-[280px] p-6">
                    <div className="flex items-center mb-3 space-x-2 text-sm text-muted-foreground">
                      <time className="font-medium">{formatTanggal(article.created_at)}</time>
                      <span>•</span>
                      <span className="text-[#406386] font-medium">{article.author}</span>
                    </div>
                    <h3 className="font-semibold text-xl leading-tight group-hover:text-[#406386] transition-colors duration-300 line-clamp-2 mb-3">
                      {article.judul_halaman}
                    </h3>
                    <p className="mb-auto text-muted-foreground line-clamp-3">
                      {article.deskripsi || "Deskripsi tidak tersedia."}
                    </p>
                    <Button
                      asChild
                      className="w-full bg-white text-[#406386] border-2 border-[#406386] hover:bg-[#406386] hover:text-white transition-all duration-300 rounded-lg flex items-center justify-center group mt-4"
                    >
                      <a href={`/artikel-detail?id=${article.id}`}>
                        <span>Baca Selengkapnya</span>
                        <svg
                          className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </Button>

                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Kategori Artikel Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#406386] mb-4">
              Kategori Artikel
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#406386] to-blue-400 mx-auto mb-6"></div>
            <div className="grid max-w-4xl grid-cols-2 gap-4 mx-auto mb-10 md:grid-cols-4">
              {["Pendidikan", "Beasiswa", "Inspirasi", "Tips & Trik"].map((category, index) => (
                <Button
                  key={index}
                  className="bg-white border-2 border-[#406386] text-[#406386] hover:bg-[#406386] hover:text-white transition-all duration-300"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="w-12 h-12 border-t-2 border-b-2 border-[#406386] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid gap-6 mx-auto md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
              {articles.map((article, index) => (
                <Card
                  key={index}
                  className="overflow-hidden transition-all duration-300 rounded-lg shadow-sm group bg-card text-card-foreground hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={article.gambar ? `../ImageTemp/${article.gambar}` : "/assets/image/default-thumbnail.jpg"}
                      alt={article.judul_halaman}
                      width={400}
                      height={225}
                      className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:opacity-100" />
                    <span className="absolute top-4 left-4 bg-[#406386]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      {article.category}
                    </span>
                  </div>

                  <div className="flex flex-col h-[280px] p-6">
                    <div className="flex items-center mb-3 space-x-2 text-sm text-muted-foreground">
                      <time className="font-medium">{formatTanggal(article.created_at)}</time>
                      <span>•</span>
                      <span className="text-[#406386] font-medium">{article.author}</span>
                    </div>
                    <h3 className="font-semibold text-xl leading-tight group-hover:text-[#406386] transition-colors duration-300 line-clamp-2 mb-3">
                      {article.judul_halaman}
                    </h3>
                    <p className="mb-auto text-muted-foreground line-clamp-3">
                      {article.deskripsi || "Deskripsi tidak tersedia."}
                    </p>                    <a 
                      href={`/artikel-detail?id=${article.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-white text-[#406386] border-2 border-[#406386] hover:bg-[#406386] hover:text-white transition-all duration-300 rounded-lg group mt-4"
                    >
                      <span>Baca Selengkapnya</span>
                      <svg
                        className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ArtikelPage;
