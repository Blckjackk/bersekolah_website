import React from 'react';
import { GraduationCap } from 'lucide-react';

const MentorCard = ({ mentor }) => {
  // Helper function to determine the correct image source
  const getImageSrc = () => {
    if (!mentor) return '/storage/mentor/default.jpg';
    
    // If image property is set, use it directly 
    if (mentor.image) {
      return mentor.image;
    }
    
    // If photo_url is available (from API), use it
    if (mentor.photo_url) {
      return mentor.photo_url;
    }
    
    // Fallback to photo property if available
    if (mentor.photo) {
      return `/storage/mentor/${mentor.photo}`;
    }
    
    // Final fallback
    return '/storage/mentor/default.jpg';
  };
  
  return (
    <div className="w-full h-96">
      <div className="relative h-full overflow-hidden bg-white shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-full">
          <img 
            src={getImageSrc()}
            alt={mentor.name} 
            className="object-cover w-full h-full"
            onError={e => { e.target.src = '/storage/mentor/default.jpg'; }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold sm:text-2xl">{mentor.name}</h3>
              
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 mt-3 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm">
                <GraduationCap className="w-3 h-3 mr-1" />
                Mentor Bersekolah
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorCard;