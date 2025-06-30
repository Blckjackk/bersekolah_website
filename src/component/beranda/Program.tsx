import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Image, Button } from "@heroui/react"
import { GraduationCap, Heart, Users } from "lucide-react"

const Program = () => {
  const programs = [
    {
      id: 1,
      title: "Program Beasiswa",
      description: "Program dukungan pembinaan bagi pelajar SMP dan SMA untuk bisa terus bersemangat bersekolah dan mengembangkan diri.",
      image: "/storage/ProgramBeasiswa.jpg",
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      buttonText: "Lihat Detail",
      href: "/program"
    },
    {
      id: 2,
      title: "Program Donasi", 
      description: "Setiap donasi yang Anda berikan akan membantu kami dalam memberikan beasiswa kepada pelajar yang memiliki semangat.",
      image: "/storage/Donasi.png",
      icon: <Heart className="w-8 h-8 text-red-600" />,
      buttonText: "Donasi Sekarang",
      href: "/donasi"
    },
    {
      id: 3,
      title: "Program Mentoring",
      description: "Program pendampingan bagi pelajar yang ingin mengembangkan diri dan mendapatkan bimbingan dari mentor berpengalaman.",
      image: "/storage/Mentor.png",
      icon: <Users className="w-8 h-8 text-green-600" />,
      buttonText: "Kenali Mentor Kami", 
      href: "/tentang"
    }
  ]

  return (
    <section className="px-4 py-12 md:py-16 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Program Kami
          </h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-teal-400"></div>
          <p className="max-w-2xl mx-auto text-gray-600">
            Berbagai program yang kami tawarkan untuk mendukung pendidikan dan pengembangan diri pelajar Indonesia
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card 
              key={program.id} 
              className="transition-all duration-300 group hover:scale-105 border border-gray-200 hover:border-[#406386] hover:shadow-lg"
              isPressable
            >
            {/* Card Image */}
              <CardHeader className="p-0 bg-white">
                <div className="relative w-full overflow-hidden rounded-t-lg h-52">
                  <Image
                    alt={program.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    src={program.image}
                    width="100%"
                  />
                </div>
              </CardHeader>


              {/* Card Content */}
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[#406386]">
                    {program.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#406386]">
                    {program.title}
                  </h3>
                </div>
                <p className="leading-relaxed text-gray-600">
                  {program.description}
                </p>
              </CardBody>

              {/* Card Footer */}
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full bg-[#406386] hover:bg-[#345064] text-white transition-colors duration-300"
                  as="a"
                  href={program.href}
                >
                  {program.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Program