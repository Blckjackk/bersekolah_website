import React, { useState, useEffect } from 'react'
import { Accordion, AccordionItem } from "@heroui/react"
import { Loader2 } from "lucide-react"

const Faq = () => {
  const [faqs, setFaqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ Fetch published FAQs
  const fetchFaqs = async () => {
    try {
      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const response = await fetch(`${baseURL}/faqs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        setFaqs(result.data || result || [])
      } else {
        throw new Error('Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      setError('Gagal memuat FAQ')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  // Default FAQs jika belum ada data dari backend
  const defaultFaqs = [
    {
      id: 1,
      pertanyaan: "Bagaimana cara menjadi beswan?",
      jawaban: "Untuk menjadi beswan Bersekolah, Anda perlu mengikuti proses seleksi yang terdiri dari beberapa tahap: pendaftaran online, seleksi administrasi, tes potensi akademik, dan wawancara. Informasi lengkap mengenai jadwal pendaftaran dapat dilihat di menu Program Beasiswa."
    },
    {
      id: 2,
      pertanyaan: "Bagaimana dana donasi disalurkan?",
      jawaban: "Setiap donasi yang diterima akan dialokasikan 100% untuk program beasiswa dan pengembangan beswan. Kami berkomitmen untuk transparansi dengan mempublikasikan laporan penggunaan dana secara berkala di website kami."
    },
    {
      id: 3,
      pertanyaan: "Apakah saya bisa menjadi relawan?",
      jawaban: "Tentu saja! Kami selalu membuka kesempatan bagi siapapun yang ingin berkontribusi sebagai relawan dalam berbagai kegiatan Bersekolah. Silakan menghubungi kami melalui form kontak atau email untuk informasi lebih lanjut."
    },
    {
      id: 4,
      pertanyaan: "Berapa nominal minimum untuk donasi?",
      jawaban: "Tidak ada nominal minimum untuk berdonasi. Semua jumlah donasi akan sangat berarti bagi peningkatan kualitas program kami. Anda dapat berdonasi sesuai dengan kemampuan dan keinginan Anda."
    }
  ]

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs

  return (
    <section className='max-w-screen-xl px-4 py-12 mx-auto md:py-16 sm:px-6 lg:px-8'>
      {/* Judul section untuk mobile - hanya tampil di mobile */}
      <div className='mb-8 md:hidden'>
        <h2 className='text-3xl font-semibold text-center md:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
      </div>
      
      {/* Konten utama dengan flex layout yang berubah di breakpoint berbeda */}
      <div className='flex flex-col-reverse gap-8 md:flex-row md:gap-12'>
        {/* Bagian accordion/FAQ */}
        <div className='flex flex-col justify-center w-full gap-6 md:w-1/2 md:gap-8'>
          {/* Judul section untuk tablet ke atas - tersembunyi di mobile */}
          <h2 className='hidden text-3xl font-semibold md:block lg:text-4xl'>Punya Pertanyaan? Kita Punya Jawaban</h2>
          
          {/* ✅ Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#406386] animate-spin" />
                <span className="text-sm text-gray-600">Memuat FAQ...</span>
              </div>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <p className="mt-2 text-xs text-gray-500">Menampilkan FAQ default</p>
            </div>
          ) : null}
          
          {/* ✅ Dynamic Accordion items */}
          <Accordion variant="splitted" className="w-full">
            {displayFaqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id || index} 
                aria-label={faq.pertanyaan} 
                title={faq.pertanyaan}
              >
                {faq.jawaban}
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* ✅ Show data source indicator */}
          {!isLoading && (
            <div className="text-center">
              <p className="text-xs text-gray-400">
                {faqs.length > 0 ? `${faqs.length} FAQ dari database` : 'FAQ default ditampilkan'}
              </p>
            </div>
          )}
        </div>

        {/* Bagian gambar */}
        <div className='w-full mb-6 md:w-1/2 md:mb-0'>
          <div className="relative w-full aspect-video md:aspect-auto md:h-full">
            <img 
              src="/ImageTemp/FAQ.png" 
              alt="Siswa sedang belajar bersama" 
              className='object-cover w-full h-full shadow-md rounded-xl' 
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Faq