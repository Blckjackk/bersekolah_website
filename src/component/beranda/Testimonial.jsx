import React, { useState, useEffect } from 'react'
import { Card, CardBody, Avatar, Button } from "@heroui/react"
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/testimoni') // sesuaikan dengan API Laravel
        const data = await response.json()

        // Filter dan map ke format frontend
        const filtered = data.filter(item => item.status === 'active').map(item => ({
          id: item.id,
          name: item.nama,
          role: item.angkatan_beswan,
          company: item.sekarang_dimana,
          quote: item.isi_testimoni,
          image: `../../ImageTemp/${item.foto_testimoni}`, // pastikan Laravel storage:link sudah dibuat
          rating: '⭐⭐⭐⭐⭐' // tambahkan rating statis atau ambil dari backend kalau ada
        }))

        setTestimonials(filtered)
        setLoading(false)
      } catch (error) {
        console.error('Gagal mengambil testimoni:', error)
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Memuat testimoni...</div>
  }

  if (testimonials.length === 0) {
    return <div className="py-16 text-center text-gray-500">Tidak ada testimoni tersedia.</div>
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="px-4 py-12 md:py-16 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Testimoni Penerima Beasiswa
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Dengarkan cerita inspiratif dari para penerima beasiswa yang telah merasakan dampak nyata program kami
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid items-center grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <div className="relative order-2 hidden lg:order-1 md:block">
              <div className="relative w-full max-w-md mx-auto lg:mx-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial.id}
                    initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative"
                  >
                    <div className="relative z-10 overflow-hidden bg-white rounded-2xl">
                      <img 
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                        className="object-cover w-full h-96"
                      />
                    </div>

                    {/* Dekorasi */}
                    <motion.div 
                      className="absolute w-24 h-24 bg-blue-100 -top-6 -left-6 rounded-2xl"
                      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="absolute w-32 h-32 bg-indigo-100 -bottom-6 -right-6 rounded-2xl"
                      animate={{ rotate: [0, -5, 5, 0], scale: [1, 0.95, 1.05, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Card className="border-0 bg-white/80 backdrop-blur-sm">
                    <CardBody className="p-8">
                      <Quote className="w-12 h-12 mb-6 text-blue-500 opacity-20" />
                      <blockquote className="mb-8 text-xl font-medium leading-relaxed text-gray-800 md:text-2xl">
                        "{currentTestimonial.quote}"
                      </blockquote>
                      <div className="mb-6">
                        <span className="px-3 py-1 text-sm font-medium text-blue-600 rounded-full bg-blue-50">
                          {currentTestimonial.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={currentTestimonial.image}
                          alt={currentTestimonial.name}
                          className="w-12 h-12"
                        />
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{currentTestimonial.name}</h4>
                          <p className="text-sm text-gray-600">{currentTestimonial.role}</p>
                          <p className="text-xs text-gray-500">{currentTestimonial.company}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button isIconOnly variant="flat" className="bg-white/80 backdrop-blur-sm hover:bg-white" onPress={prevTestimonial}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
            <Button isIconOnly variant="flat" className="bg-white/80 backdrop-blur-sm hover:bg-white" onPress={nextTestimonial}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">
              {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
