import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, BookOpen, Users, Award, Star, ArrowRight, Sparkles, MessageCircle } from "lucide-react";



const KontakPage = () => {

  
  const handleWhatsAppClick = () => {
    const phoneNumber = "6281906698736"
    const message = encodeURIComponent(
      "Halo kak, aku tertarik buat ikut berdonasi di program Beasiswa Bersekolah. Boleh minta info selengkapnya?"
    )
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

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

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Terhubung
              <span className="block mt-2 text-transparent bg-gradient-to-r from-blue-200 to-white bg-clip-text">
                Bersama Kami 
              </span>
            </h1>
            
            <p className="max-w-3xl px-4 mx-auto mb-8 text-lg leading-relaxed text-blue-100 sm:text-xl lg:text-2xl">
              Kontak kami untuk mendapatkan informasi lebih lanjut tentang program Beasiswa Bersekolah. Kami siap membantu Anda dengan segala pertanyaan dan kebutuhan informasi.
            </p>

            {/* CTA Button dengan efek hover menarik */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                // onClick={handleDonateClick}
                className="group relative px-8 py-4 bg-white text-[#406386] rounded-full font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  <span className="text-base">Hubungi Kami</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="mb-3 text-3xl font-bold text-[#406386]">Kirim Pesan</h2>
                  <p className="text-gray-600 text-lg">
                    Ceritakan kepada kami bagaimana kami bisa membantu Anda
                  </p>
                </div>
                <form method="POST" action="#">
                  <div className="space-y-6">
                    <Input type="text" placeholder="Nama Anda" name="name" required />
                    <Input type="email" placeholder="Email Anda" name="email" required />
                    <Textarea placeholder="Tulis pesan Anda di sini..." name="message" rows={6} required />
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-[#406386] hover:bg-[#365677] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                        Kirim Pesan
                      </Button>
                      <Button
                        type="button"
                        onClick={handleWhatsAppClick}
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

export default KontakPage
