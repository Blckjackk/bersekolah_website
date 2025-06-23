import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Heart, BookOpen, Users, Award, Star, ArrowRight, Sparkles } from "lucide-react";

const DonasiPage = () => {
  const [animatedNumber, setAnimatedNumber] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedNumber(prev => {
        if (prev < 1250) return prev + 25;
        return 1250;
      });
    }, 50);
    
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % 3);
    }, 4000);
    
    return () => {
      clearInterval(timer);
      clearInterval(testimonialTimer);
    };
  }, []);

  const handleDonateClick = () => {
    const phoneNumber = "6281906698736";
    const message = encodeURIComponent(
      "Halo kak, aku tertarik buat ikut berdonasi di program Beasiswa Bersekolah. Boleh minta info selengkapnya?"
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const stats = [
    { number: `${animatedNumber}+`, label: "Pelajar Terbantu", icon: <Users className="w-8 h-8" /> },
    { number: "50+", label: "Sekolah Mitra", icon: <BookOpen className="w-8 h-8" /> },
    { number: "98%", label: "Tingkat Kelulusan", icon: <Award className="w-8 h-8" /> },
    { number: "5", label: "Tahun Berpengalaman", icon: <Star className="w-8 h-8" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Putri",
      role: "Mahasiswa Universitas Indonesia",
      text: "Berkat program beasiswa ini, saya bisa melanjutkan kuliah dan meraih cita-cita menjadi dokter.",
      image: "👩‍🎓"
    },
    {
      name: "Ahmad Rizki", 
      role: "Siswa SMA Negeri 1 Jakarta",
      text: "Dukungan dari program ini sangat membantu saya fokus belajar tanpa khawatir biaya sekolah.",
      image: "👨‍🎓"
    },
    {
      name: "Siti Nurhaliza",
      role: "Lulusan SMK Terbaik",
      text: "Alhamdulillah sekarang saya sudah bekerja dan bisa membantu keluarga berkat beasiswa ini.",
      image: "👩‍💼"
    }
  ];

  return (
    <>
      {/* Hero Section dengan animasi floating */}
      <section className="relative bg-gradient-to-br from-[#406386] via-[#2d4a67] to-[#1a3447] py-20 sm:py-24 lg:py-32 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-blue-100/25 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
        </div>

        <div className="container relative px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-medium text-white">Mengubah Hidup Melalui Pendidikan</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Wujudkan Mimpi
              <span className="block mt-2 text-transparent bg-gradient-to-r from-blue-200 to-white bg-clip-text">
                Anak Indonesia
              </span>
            </h1>
            
            <p className="max-w-3xl px-4 mx-auto mb-8 text-lg leading-relaxed text-blue-100 sm:text-xl lg:text-2xl">
              Setiap kontribusi Anda adalah investasi untuk masa depan Indonesia yang lebih cerah. 
              Mari bersama membuka pintu kesempatan bagi generasi penerus bangsa.
            </p>

            {/* CTA Button dengan efek hover menarik */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleDonateClick}
                className="group relative px-8 py-4 bg-white text-[#406386] rounded-full font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500 group-hover:animate-pulse" />
                  Mulai Berdonasi Sekarang
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>

            <p className="mt-4 text-sm text-blue-200">
              💬 Langsung terhubung ke WhatsApp untuk konsultasi gratis
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section dengan animasi counter */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4 text-[#406386] group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#406386] mb-2 lg:text-4xl">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-600 lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#406386] mb-6 lg:text-4xl">
              Dampak Nyata Donasi Anda
            </h2>
            <div className="w-20 h-1 bg-[#406386] mx-auto mb-8 rounded-full"></div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#406386] rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#406386] mb-3">Akses Pendidikan</h3>
                <p className="text-gray-600">Memberikan kesempatan belajar bagi anak-anak kurang mampu untuk meraih pendidikan berkualitas</p>
              </div>
              
              <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#406386] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#406386] mb-3">Masa Depan Cerah</h3>
                <p className="text-gray-600">Membantu membangun generasi yang kompeten dan siap menghadapi tantangan masa depan</p>
              </div>
              
              <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#406386] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#406386] mb-3">Perubahan Hidup</h3>
                <p className="text-gray-600">Mengubah kehidupan keluarga dan menciptakan siklus positif di masyarakat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 rounded-full">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Saatnya Berbagi Kebaikan</span>
            </div>
            
            <h2 className="text-4xl font-bold text-[#406386] mb-6 lg:text-5xl">
              Jadilah Bagian dari Perubahan
            </h2>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Setiap rupiah yang Anda berikan memiliki kekuatan untuk mengubah hidup seseorang. 
              Mari bersama-sama membangun Indonesia melalui pendidikan.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleDonateClick}
                className="group bg-[#406386] text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-[#2d4a67] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center justify-center gap-3">
                  <Heart className="w-6 h-6 text-blue-200 group-hover:animate-pulse" />
                  Mulai Donasi via WhatsApp
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              
              <p className="text-sm text-gray-600">
                Konsultasi gratis • Proses mudah • Transparan 100%
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DonasiPage;