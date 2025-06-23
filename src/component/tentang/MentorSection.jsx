import React, { useState, useEffect } from 'react';
import MentorCarousel from './MentorCarousel';
import { MentorService } from '../../lib/mentor-service-updated';

const MentorSection = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch mentors from API when component mounts
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const data = await MentorService.getAllMentors();
        
        if (!data || data.length === 0) {
          throw new Error("No mentor data available");
        }
        
        // Transform API data to match component requirements
        const formattedMentors = data.map(mentor => ({
          id: mentor.id,
          name: mentor.name,
          position: mentor.position || "Mentor Bersekolah",
          description: mentor.description || "Mentor Bersekolah yang berdedikasi untuk membantu para beswan.",
          image: mentor.photo ? `${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000'}/${mentor.photo}` : "/ImageTemp/default-mentor.png",
          location: mentor.location || "Indonesia",
          joinYear: mentor.created_at ? new Date(mentor.created_at).getFullYear().toString() : "2025",
          email: mentor.email || "mentor@bersekolah.org",
          phone: mentor.phone || "+62 812 3456 7890",
          skills: mentor.skills ? mentor.skills.split(',') : ["Mentoring", "Leadership", "Education"],
          status: mentor.status || "active",
          socialLinks: [
            { platform: "linkedin", url: mentor.linkedin || "https://linkedin.com/" },
            { platform: "instagram", url: mentor.instagram || "https://instagram.com/" }
          ]
        }));
        
        setMentors(formattedMentors);
      } catch (err) {
        console.error("Failed to fetch mentors:", err);
        setError("Failed to load mentor data. Please try again later.");
        // Use fallback data if API call fails
        setMentors(fallbackMentorData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, []);

  return (
    <section id="mentor" className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#406386] mb-4">
            Mentor Kami
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-[#406386] rounded-full mx-auto mb-4 sm:mb-6"></div>
          <p className="max-w-4xl mx-auto text-sm leading-relaxed text-gray-700 sm:text-base lg:text-lg">
            Para mentor di Beasiswa Bersekolah adalah sosok inspiratif yang hadir bukan hanya sebagai pendamping, 
            tapi juga sebagai penyemangat dan sumber motivasi bagi para beswan. Dengan pengalaman dan semangat berbagi, 
            mereka siap menemani setiap langkah, mendukung pengembangan diri, dan menjadi bagian dari perjalanan belajar yang penuh makna.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-blue-500 animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : (
            <MentorCarousel mentors={mentors} />
          )}
        </div>
      </div>
    </section>
  );
};

// Fallback data in case API fails
const fallbackMentorData = [
  {
    id: 1,
    name: "Ahmad Izuddin Azzam",
    position: "Co-Mentor Bersekolah",
    description: "Mahasiswa Jurusan Ilmu Komputer UPI. Wakil Ketua BEM Kemakom dengan passion dalam teknologi dan pengembangan leadership untuk generasi muda.",
    image: "assets/image/Ahmad Izzuddin Azzam_Non Formal.JPG",
    location: "Bandung, Jawa Barat",
    joinYear: "2022",
    email: "ahmad.azzam@bersekolah.org",
    skills: ["Mentoring", "Leadership", "Computer Science"]
  },
  // More fallback mentors...
];

export default MentorSection;