import { Link } from '@heroui/react'
import React, { useRef, useState, useEffect } from 'react'

const About = () => {
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (imageContainerRef.current && isHovered) {
        const rect = imageContainerRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        // Calculate mouse position relative to center, with reduced sensitivity
        const x = (e.clientX - centerX) * 0.03
        const y = (e.clientY - centerY) * 0.03
        
        setMousePosition({ x, y })
      }
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      setMousePosition({ x: 0, y: 0 })
    }

    const container = imageContainerRef.current
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isHovered])

  return (
    <section className='px-4 py-12 md:py-16 sm:px-6 lg:px-8 bg-slate-50'>
      <div className='max-w-screen-xl mx-auto'>
        <h2 className='text-3xl md:text-4xl font-bold text-[#406386] mb-12 text-center'>
          Tentang Bersekolah
        </h2>

        <div className='flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12'>
          {/* Image container with mouse tracking */}
          <div 
            ref={imageContainerRef}
            className='relative w-3/4 mt-10 mb-10 ml-10 mr-10 cursor-pointer md:w-2/5 md:mt-16 md:ml-16'
            style={{
              transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`,
              transition: isHovered ? 'none' : 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
            }}
          >
            <img 
              src="assets/image/IMG_3694.jpg" 
              alt="Siswa Bersekolah" 
              className='relative z-10 object-cover w-full rounded-xl aspect-video brightness-105'
              style={{
                transform: `rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
              }}
            />

            {/* Decorative elements with parallax effect */}
            <div 
              className='bg-slate-950 aspect-square absolute w-[100px] sm:w-[120px] md:w-[150px] -top-10 -left-10 -z-0 rounded-3xl -rotate-12'
              style={{
                transform: `translateX(${mousePosition.x * -0.5}px) translateY(${mousePosition.y * -0.5}px)`,
                transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
              }}
            />

            <div 
              className='bg-indigo-950 aspect-square absolute w-[100px] sm:w-[120px] md:w-[150px] -bottom-10 -right-10 -z-0 rounded-3xl rotate-12'
              style={{
                transform: `translateX(${mousePosition.x * -0.3}px) translateY(${mousePosition.y * -0.3}px)`,
                transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
              }}
            />
          </div>

          {/* Content container */}
          <div className='w-full md:w-3/5'>
            <h3 className='text-xl md:text-2xl font-bold text-[#406386] mb-4'>
              Apa itu Beasiswa Bersekolah?
            </h3>
            <p className='mb-6 text-base leading-relaxed text-gray-700 md:text-lg'>
              Bersekolah adalah bentuk nyata dari kepedulian terhadap masa depan pendidikan Indonesia. Lebih dari sekadar bantuan finansial, program ini hadir untuk menyalakan semangat belajar siswa di seluruh penjuru negeri. Melalui dukungan rutin berupa uang pembinaan dan pendampingan inspiratif, Beasiswa Bersekolah menjadi teman tumbuh bagi para pelajar agar terus melangkah maju, percaya diri, dan penuh harapan.
            </p>
            <Link 
              href="/tentang" 
              className='text-[#406386] font-medium hover:underline inline-flex items-center gap-2 transition-all hover:gap-3'
            >
              Pelajari lebih lanjut
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About