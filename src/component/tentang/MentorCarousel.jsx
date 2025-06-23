import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MentorCard from './MentorCard';

const MentorCarousel = ({ mentors }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update cards per view on resize
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, []);



  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + cardsPerView) % mentors.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) =>
      (prev - cardsPerView + mentors.length) % mentors.length
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index % mentors.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Circular visible mentors
  const getCircularMentors = () => {
    const result = [];
    for (let i = 0; i < cardsPerView; i++) {
      const index = (currentIndex + i) % mentors.length;
      result.push(mentors[index]);
    }
    return result;
  };

  const visibleMentors = getCircularMentors();
  const cardWidth = 100 / cardsPerView;
  const cardHeight = 1000 / 2;

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        disabled={mentors.length <= cardsPerView || isTransitioning}
        className="absolute left-0 z-10 flex items-center justify-center w-12 h-12 transition-colors duration-200 -translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronLeft className="w-6 h-6 text-[#406386]" />
      </button>

      <button
        onClick={nextSlide}
        disabled={mentors.length <= cardsPerView || isTransitioning}
        className="absolute right-0 z-10 flex items-center justify-center w-12 h-12 transition-colors duration-200 translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronRight className="w-6 h-6 text-[#406386]" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${(mentors.length) * (100 / cardsPerView)}%`,
            transform: `translateX(-${(100 / mentors.length) * currentIndex}%)`,
          }}
        >
          {mentors.map((mentor, index) => (
            <div
              key={mentor.id}
              className="px-3 flex-shrink-0"
              style={{
                width: `${100 / mentors.length}%`,
              }}
            >
              <MentorCard mentor={mentor} />
            </div>
          ))}
        </div>
      </div>



      {/* Pagination Dots */}
      {mentors.length > cardsPerView && (
        <div className="flex justify-center mt-8 space-x-2">
          {mentors.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`transition-all duration-200 rounded-full ${
                currentIndex === index
                  ? 'bg-[#406386] w-6 h-2'
                  : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Indicator
      <div className="flex justify-center mt-4">
        <span className="text-sm text-gray-500">
          {visibleMentors.map((_, i) => (currentIndex + i) % mentors.length + 1).join(', ')} dari {mentors.length} mentor
        </span>
      </div> */}
    </div>
  );
};

export default MentorCarousel;
