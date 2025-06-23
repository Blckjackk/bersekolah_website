import React from 'react';
import { Linkedin, Twitter, Instagram, Mail, MapPin, Calendar, GraduationCap, Eye, Phone, Award } from 'lucide-react';
import '../../styles/mentor.css';

const MentorCard = ({ mentor }) => {
  return (
    <div className="w-full flip-card-container h-96">
      <div className="flip-card-inner">
        {/* Front Side - Cover */}
        <div className="flip-card-front">
          <div className="relative h-full overflow-hidden bg-white shadow-lg rounded-2xl">
            <div className="relative h-full">
              <img 
                src={`/assets/ImageTemp/${mentor.photo}`}
                alt={mentor.name} 
                className="object-cover w-full h-full"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-bold sm:text-2xl">{mentor.name}</h3>
                  <p className="text-sm font-medium sm:text-base opacity-90">
                    {mentor.position}
                  </p>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center px-3 py-1 mt-3 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Mentor Bersekolah
                  </div>
                </div>
              </div>
              
              {/* Hover Indicator */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - Data Mentor */}
        <div className="flip-card-back">
          <div className="flip-card-back-content bg-gradient-to-br from-[#406386] to-[#2d4a66] text-white shadow-lg rounded-2xl">
            <div className="flex flex-col h-full p-4 text-left sm:p-5">
              {/* Header dengan foto mini */}
              <div className="flex items-center flex-shrink-0 pb-2 mb-3 border-b border-white/20">
                <img 
                  src={`/assets/ImageTemp/${mentor.photo}`}
                  alt={mentor.name} 
                  className="flex-shrink-0 object-cover w-10 h-10 mr-3 border-2 rounded-full border-white/30"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate">{mentor.name}</h3>
                  <p className="text-xs truncate opacity-90">{mentor.position}</p>
                </div>
              </div>
              
              {/* Contact Information - Compact */}
              <div className="flex-shrink-0 mb-3">
                <h4 className="flex items-center mb-1 text-xs font-semibold">
                  Kontak
                </h4>
                
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <Mail className="flex-shrink-0 w-3 h-3 opacity-70" />
                    <span className="text-xs truncate">{mentor.email || 'mentor@bersekolah.org'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="flex-shrink-0 w-3 h-3 opacity-70" />
                    <span className="text-xs truncate">{mentor.location || 'Jakarta'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="flex-shrink-0 w-3 h-3 opacity-70" />
                    <span className="text-xs">Sejak {mentor.joinYear || '2020'}</span>
                  </div>
                </div>
              </div>
              
              {/* Skills - Compact */}
              <div className="flex-shrink-0 mb-3">
                <h4 className="mb-1 text-xs font-semibold">Keahlian:</h4>
                <div className="flex flex-wrap gap-1">
                  {(mentor.skills || ['Mentoring', 'Leadership', 'Education']).slice(0, 3).map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 text-xs bg-white/20 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* About - Scrollable area */}
              <div className="flex-1 mb-3 overflow-hidden">
                <h4 className="mb-1 text-xs font-semibold">Tentang:</h4>
                <p className="text-xs leading-tight opacity-90 line-clamp-3">
                  {mentor.description}
                </p>
              </div>

              
              {/* Social Media Links - Bottom */}
              {mentor.socialLinks && mentor.socialLinks.length > 0 && (
                <div className="flex-shrink-0 pt-2 border-t border-white/20">
                  <div className="flex justify-center space-x-2">
                    {mentor.socialLinks.slice(0, 3).map((social, index) => {
                      const IconComponent = getIconComponent(social.platform);
                      return (
                        <a 
                          key={index}
                          href={social.url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-6 h-6 text-white transition-all duration-300 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110"
                          title={`${mentor.name} di ${social.platform}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconComponent className="w-3 h-3" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getIconComponent = (platform) => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return Linkedin;
    case 'twitter':
      return Twitter;
    case 'instagram':
      return Instagram;
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    default:
      return Linkedin;
  }
};

export default MentorCard;