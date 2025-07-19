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
      <section className="relative bg-gradient-to-br from-[#406386] via-[#2d4a67] to-[#1a3447] py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-12 h-12 rounded-full left-6 top-12 animate-bounce bg-white/10 sm:w-16 sm:h-16 sm:left-8 sm:top-16 lg:w-20 lg:h-20 lg:left-10 lg:top-20" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute w-10 h-10 rounded-full right-12 top-24 animate-bounce bg-blue-200/20 sm:w-12 sm:h-12 sm:right-16 sm:top-32 lg:w-16 lg:h-16 lg:right-20 lg:top-40" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute w-8 h-8 rounded-full bottom-20 left-1/4 animate-bounce bg-white/15 sm:w-10 sm:h-10 sm:bottom-24 lg:w-12 lg:h-12 lg:bottom-32" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute w-6 h-6 rounded-full top-1/3 right-1/3 animate-bounce bg-blue-100/25 sm:w-8 sm:h-8" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
        </div>

        <div className="container relative px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full backdrop-blur-sm bg-white/20 sm:px-4 sm:py-2 sm:mb-6">
              <Sparkles className="w-3 h-3 text-blue-200 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium text-white sm:text-sm">Mengubah Hidup Melalui Pendidikan</span>
            </div>

            <h1 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl xl:text-5xl sm:mb-6">
              Wujudkan Mimpi
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white sm:mt-2">
                Anak Indonesia
              </span>
            </h1>
            
            <p className="max-w-3xl px-2 mx-auto mb-6 text-sm leading-relaxed text-blue-100 sm:text-base lg:text-lg xl:text-xl sm:mb-8">
              Setiap kontribusi Anda adalah investasi untuk masa depan Indonesia yang lebih cerah. 
              Mari bersama membuka pintu kesempatan bagi generasi penerus bangsa.
            </p>

            {/* CTA Button dengan efek hover menarik */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <button
                onClick={handleDonateClick}
                className="group relative px-6 py-3 bg-white text-[#406386] rounded-full font-bold text-sm hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-base lg:text-lg"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <Heart className="w-4 h-4 text-red-500 group-hover:animate-pulse sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  Mulai Berdonasi Sekarang
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5" />
                </span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section dengan animasi counter */}
      <section className="py-8 bg-white sm:py-12 lg:py-16">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-2 text-[#406386] group-hover:scale-110 transition-transform duration-300 sm:mb-3 lg:mb-4">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-xl font-bold text-[#406386] mb-1 sm:text-2xl lg:text-3xl xl:text-4xl sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs font-medium text-gray-600 sm:text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50 sm:py-12 lg:py-16">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-bold text-[#406386] mb-4 sm:text-2xl lg:text-3xl xl:text-4xl sm:mb-6">
              Dampak Nyata Donasi Anda
            </h2>
            <div className="w-12 h-1 bg-[#406386] mx-auto mb-6 rounded-full sm:w-16 sm:mb-8 lg:w-20"></div>
            
            <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-3">
              <div className="p-4 transition-shadow duration-300 bg-white shadow-lg rounded-xl sm:p-6 sm:rounded-2xl hover:shadow-xl">
                <div className="w-12 h-12 bg-[#406386] rounded-full flex items-center justify-center mx-auto mb-3 sm:w-14 sm:h-14 sm:mb-4 lg:w-16 lg:h-16">
                  <BookOpen className="w-6 h-6 text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-base font-semibold text-[#406386] mb-2 sm:text-lg lg:text-xl sm:mb-3">Akses Pendidikan</h3>
                <p className="text-xs text-gray-600 sm:text-sm lg:text-base">Memberikan kesempatan belajar bagi anak-anak kurang mampu untuk meraih pendidikan berkualitas</p>
              </div>
              
              <div className="p-4 transition-shadow duration-300 bg-white shadow-lg rounded-xl sm:p-6 sm:rounded-2xl hover:shadow-xl">
                <div className="w-12 h-12 bg-[#406386] rounded-full flex items-center justify-center mx-auto mb-3 sm:w-14 sm:h-14 sm:mb-4 lg:w-16 lg:h-16">
                  <Users className="w-6 h-6 text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-base font-semibold text-[#406386] mb-2 sm:text-lg lg:text-xl sm:mb-3">Masa Depan Cerah</h3>
                <p className="text-xs text-gray-600 sm:text-sm lg:text-base">Membantu membangun generasi yang kompeten dan siap menghadapi tantangan masa depan</p>
              </div>
              
              <div className="p-4 transition-shadow duration-300 bg-white shadow-lg rounded-xl sm:p-6 sm:rounded-2xl hover:shadow-xl">
                <div className="w-12 h-12 bg-[#406386] rounded-full flex items-center justify-center mx-auto mb-3 sm:w-14 sm:h-14 sm:mb-4 lg:w-16 lg:h-16">
                  <Heart className="w-6 h-6 text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-base font-semibold text-[#406386] mb-2 sm:text-lg lg:text-xl sm:mb-3">Perubahan Hidup</h3>
                <p className="text-xs text-gray-600 sm:text-sm lg:text-base">Mengubah kehidupan keluarga dan menciptakan siklus positif di masyarakat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100 sm:py-16 lg:py-20">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-100 rounded-full sm:px-4 sm:py-2 sm:mb-6">
              <Star className="w-3 h-3 text-blue-600 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium text-blue-800 sm:text-sm">Saatnya Berbagi Kebaikan</span>
            </div>
            
            <h2 className="text-2xl font-bold text-[#406386] mb-4 sm:text-3xl lg:text-4xl xl:text-5xl sm:mb-6">
              Jadilah Bagian dari Perubahan
            </h2>
            
            <p className="mb-6 text-sm leading-relaxed text-gray-700 sm:text-base lg:text-lg xl:text-xl sm:mb-8">
              Setiap rupiah yang Anda berikan memiliki kekuatan untuk mengubah hidup seseorang. 
              Mari bersama-sama membangun Indonesia melalui pendidikan.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleDonateClick}
                className="group bg-[#406386] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#2d4a67] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-base lg:px-10 lg:py-5 lg:text-lg xl:text-xl"
              >
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  <Heart className="w-4 h-4 text-blue-200 group-hover:animate-pulse sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  Mulai Donasi via WhatsApp
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </span>
              </button>
              </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DonasiPage;