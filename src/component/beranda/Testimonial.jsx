import React, { useState, useEffect } from 'react'
import { Card, CardBody, Avatar, Button } from "@heroui/react"
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/testimoni') // sesuaikan dengan API Laravel
        const data = await response.json()
        const arr = Array.isArray(data.data) ? data.data : [];

        // Filter dan map ke format frontend
        const filtered = arr.filter(item => item.status === 'active').map(item => ({
          id: item.id,
          name: item.nama,
          role: item.angkatan_beswan,
          company: item.sekarang_dimana,
          quote: item.isi_testimoni,
          image: item.foto_testimoni_url || '/storage/testimoni/default.jpg'
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

  // Auto-advance testimonials
  useEffect(() => {
    if (testimonials.length > 0 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
      }, 5000) // Change every 5 seconds
      
      return () => clearInterval(interval)
    }
  }, [testimonials.length, isPaused])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 3000) // Resume after 3 seconds
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 3000) // Resume after 3 seconds
  }

  // Handle touch events for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextTestimonial()
    } else if (isRightSwipe) {
      prevTestimonial()
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Memuat testimoni...</div>
  }

  if (testimonials.length === 0) {
    return <div className="py-16 text-center text-gray-500">Tidak ada testimoni tersedia.</div>
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="px-4 py-12 bg-gradient-to-br to-blue-50 md:py-16 sm:px-6 lg:px-8 from-slate-50">
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
          <div 
            className="grid items-center grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 touch-pan-x select-none overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ 
              touchAction: 'pan-x',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none'
            }}
          >
            <div className="relative order-2 hidden lg:order-1 md:block">
              <div className="relative w-full max-w-md mx-auto lg:mx-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.23, 1, 0.32, 1],
                      type: "tween"
                    }}
                    className="relative"
                    layoutId="testimonial-image"
                  >
                    <div className="relative z-10 overflow-hidden bg-white rounded-2xl">
                      <img 
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                        className="object-cover w-full h-96"
                        onError={e => { e.target.src = '/storage/testimoni/default.jpg'; }}
                      />
                    </div>

                    {/* Dekorasi */}
                    <motion.div 
                      className="absolute w-24 h-24 bg-blue-100 -top-6 -left-6 rounded-2xl opacity-60"
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="absolute w-32 h-32 bg-indigo-100 -right-6 -bottom-6 rounded-2xl opacity-50"
                      animate={{ rotate: [0, -2, 2, 0] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.23, 1, 0.32, 1],
                      type: "tween"
                    }}
                    layoutId="testimonial-content"
                  >
                  <Card className="border-0 backdrop-blur-sm bg-white/80">
                    <CardBody className="p-8">
                      <Quote className="w-12 h-12 mb-6 text-blue-500 opacity-20" />
                      <blockquote className="mb-8 text-xl font-medium leading-relaxed text-gray-800 md:text-2xl">
                        "{currentTestimonial.quote}"
                      </blockquote>
                      
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={currentTestimonial.image}
                          alt={currentTestimonial.name}
                          className="w-12 h-12"
                          onError={e => { e.target.src = '/storage/testimoni/default.jpg'; }}
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
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button 
              isIconOnly 
              variant="flat" 
              className="backdrop-blur-sm bg-white/80 hover:bg-white transition-all duration-200" 
              onPress={prevTestimonial}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsPaused(true)
                    setTimeout(() => setIsPaused(false), 3000)
                  }}
                  className={`relative w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
                >
                  {index === currentIndex && !isPaused && (
                    <div className="absolute inset-0 w-full h-full bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            <Button 
              isIconOnly 
              variant="flat" 
              className="backdrop-blur-sm bg-white/80 hover:bg-white transition-all duration-200" 
              onPress={nextTestimonial}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">
              {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>z
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
