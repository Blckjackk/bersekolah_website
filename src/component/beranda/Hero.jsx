import { Button, Link } from '@heroui/react'
import React from 'react'

const Hero = () => {
  return (
    <section className="overflow-hidden relative mx-4 my-4 rounded-2xl sm:my-6 lg:my-8 sm:rounded-3xl lg:rounded-4xl sm:mx-6">
      {/* Background Image */}
      <img 
        src="assets/image/hero/hero.png"
        alt="Siswa bersemangat belajar"
        className="object-cover absolute inset-0 w-full h-full brightness-75"
      />

      {/* Overlay */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20 text-white bg-[#406386]/70 backdrop-blur-md">
        <div className="flex flex-col gap-4 justify-center items-center text-center sm:gap-6 lg:gap-8">
          <h1 className="w-full max-w-xs text-2xl font-semibold tracking-tight leading-tight sm:max-w-lg lg:max-w-2xl sm:text-3xl lg:text-4xl xl:text-6xl">
            Buka Pintu Pendidikan Bersama Kami
          </h1>
          <p className="w-full max-w-sm text-sm leading-relaxed sm:max-w-md lg:max-w-xl sm:text-base lg:text-lg">
            Beasiswa untuk pelajar yang mempunyai semangat dalam menempuh pendidikan. Setiap kontribusi membuka masa depan.
          </p>
          <Button className="px-4 py-2 text-sm bg-white rounded-lg shadow-md transition-all sm:px-6 lg:px-8 sm:py-3 w-fit sm:rounded-xl sm:text-base lg:text-lg">
            <Link href="/company-profile/donasi" className="text-[#406386] font-medium">
              Berikan Donasi!
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
