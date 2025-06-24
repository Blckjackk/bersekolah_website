import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, BookOpen, Users, Award, Star, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { useState } from "react";
// Import alert component instead of toast for simplicity
import * as React from "react";

const KontakPage = () => {
  const [formState, setFormState] = useState({
    nama: '',
    email: '',
    pesan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hide any existing notification
    setNotification({ ...notification, show: false });
    
    // Validate form (basic validation)
    if (!formState.nama || !formState.email || !formState.pesan) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Mohon isi semua field yang diperlukan.'
      });
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/kirim-pesan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        setNotification({
          show: true,
          type: 'success',
          message: 'Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.'
        });
        
        // Reset form
        setFormState({
          nama: '',
          email: '',
          pesan: ''
        });
      } else {
        throw new Error(data.message || 'Terjadi kesalahan saat mengirim pesan');
      }
    } catch (error) {
      // Show error message
      setNotification({
        show: true,
        type: 'error',
        message: error instanceof Error 
          ? error.message 
          : "Terjadi kesalahan. Silakan coba lagi nanti."
      });
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
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
          <div className="absolute w-20 h-20 rounded-full top-20 left-10 bg-white/10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute w-16 h-16 rounded-full top-40 right-20 bg-blue-200/20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute w-12 h-12 rounded-full bottom-32 left-1/4 bg-white/15 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute w-8 h-8 rounded-full top-1/3 right-1/3 bg-blue-100/25 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
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
              <CardContent className="p-8">            <div className="mb-8">
                  <h2 className="mb-3 text-3xl font-bold text-[#406386]">Kirim Pesan</h2>
                  <p className="text-lg text-gray-600">
                    Ceritakan kepada kami bagaimana kami bisa membantu Anda
                  </p>
                  
                  {/* Notification Alert */}
                  {notification.show && (
                    <div className={`mt-4 p-4 rounded-md ${
                      notification.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {notification.type === 'success' ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{notification.message}</p>
                        </div>
                        <div className="pl-3 ml-auto">
                          <div className="-mx-1.5 -my-1.5">
                            <button
                              type="button"
                              className={`inline-flex rounded-md p-1.5 ${
                                notification.type === 'success' 
                                  ? 'text-green-600 hover:bg-green-100' 
                                  : 'text-red-600 hover:bg-red-100'
                              }`}
                              onClick={() => setNotification({ ...notification, show: false })}
                            >
                              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div><form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <Input 
                      type="text" 
                      placeholder="Nama Anda" 
                      name="nama" 
                      value={formState.nama}
                      onChange={handleInputChange}
                      required 
                    />
                    <Input 
                      type="email" 
                      placeholder="Email Anda" 
                      name="email" 
                      value={formState.email}
                      onChange={handleInputChange}
                      required 
                    />
                    <Textarea 
                      placeholder="Tulis pesan Anda di sini..." 
                      name="pesan" 
                      value={formState.pesan}
                      onChange={handleInputChange}
                      rows={6} 
                      required 
                    />
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-[#406386] hover:bg-[#365677] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengirim...
                          </div>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                            Kirim Pesan
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleWhatsAppClick}
                        className="flex-1 h-12 font-semibold text-white transition-all duration-300 bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-xl"
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
