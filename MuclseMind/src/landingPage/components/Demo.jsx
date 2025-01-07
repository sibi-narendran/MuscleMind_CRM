import React, { useState, useEffect, useCallback, memo } from 'react';
import billing from '../landingPageAsset/UIscreenshots/billing.png';
import appointment from '../landingPageAsset/UIscreenshots/appointments.png';
import patient from '../landingPageAsset/UIscreenshots/patients.png';
import prescription from '../landingPageAsset/UIscreenshots/prescription.png';
import management from '../landingPageAsset/UIscreenshots/managements.png';
import operating from '../landingPageAsset/UIscreenshots/operating.png';

// Memoized Image Component
const CarouselImage = memo(({ src, alt, isActive, isMobile }) => (
  <div
    className={
      isMobile
        ? `snap-center shrink-0 w-screen relative flex items-center justify-center`
        : `absolute inset-0 transition-all duration-700 ${
            isActive
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0'
          } flex flex-col items-center gap-4 p-4`
    }
  >
    <div className="w-full flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className={`${
          isMobile
            ? 'w-full h-[500px] object-contain'
            : 'w-full h-full object-contain bg-white p-2'
        }`}
        loading="lazy"
      />
    </div>

    {!isMobile && (
      <div className="w-full text-center space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">{alt}</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {alt === 'Billing Interface' &&
            'Streamline your financial operations with our intuitive billing system. Manage invoices, track payments, and handle insurance claims effortlessly.'}
          {alt === 'Appointment Management' &&
            'Efficiently organize your schedule with our smart appointment system. Handle bookings, reminders, and follow-ups seamlessly.'}
          {alt === 'Patient Records' &&
            'Keep patient information secure and accessible. Manage medical histories, treatment plans, and documentation in one place.'}
          {alt === 'Prescription Management' &&
            'Write and manage prescriptions digitally. Track medication history and ensure accurate drug information.'}
          {alt === 'Practice Management' &&
            'Take control of your practice operations. Monitor performance, manage staff, and optimize workflow efficiency.'}
          {alt === 'Operating Interface' &&
            'User-friendly interface designed for healthcare professionals. Access all tools and features with minimal clicks.'}
        </p>
      </div>
    )}

    {isMobile && (
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
        <p className="text-white text-center text-lg font-medium">{alt}</p>
      </div>
    )}
  </div>
));

// Memoized Navigation Dot Component
const NavigationDot = memo(({ isActive, onClick, isMobile }) =>
  isMobile ? (
    <div
      className={`h-1 rounded-full transition-all duration-300 ${
        isActive ? 'w-4 bg-blue-500' : 'w-1 bg-gray-300'
      }`}
    />
  ) : (
    <button
      onClick={onClick}
      className={`transition-all duration-300 ease-in-out ${
        isActive
          ? 'w-6 h-2 bg-blue-500'
          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
      } rounded-full`}
      aria-label={`Go to slide ${onClick}`}
    />
  )
);

const Demo = () => {
  const images = [
    { src: billing, alt: 'Billing Interface' },
    { src: appointment, alt: 'Appointment Management' },
    { src: patient, alt: 'Patient Records' },
    { src: prescription, alt: 'Prescription Management' },
    { src: management, alt: 'Practice Management' },
    { src: operating, alt: 'Operating Interface' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleDotClick = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const renderCarousel = useCallback(
    (isMobile = false) => (
      <div
        className={
          isMobile
            ? 'relative w-full -mx-4'
            : 'relative w-full bg-gradient-to-b from-gray-50 to-white p-4 rounded-2xl'
        }
      >
        <div
          className={
            isMobile
              ? 'flex overflow-x-auto snap-x snap-mandatory hide-scrollbar'
              : 'relative aspect-auto min-h-[600px] rounded-xl shadow-lg overflow-hidden'
          }
        >
          {isMobile
            ? // Mobile view - horizontal scroll
              images.map((image, index) => (
                <CarouselImage
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  isActive={true}
                  isMobile={true}
                />
              ))
            : // Desktop view - remains the same
              images.map((image, index) => (
                <CarouselImage
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  isActive={index === currentIndex}
                  isMobile={false}
                />
              ))}
        </div>

        {/* Navigation dots - show only for desktop */}
        {!isMobile && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white px-3 py-2 rounded-full shadow-md">
            {images.map((_, index) => (
              <NavigationDot
                key={index}
                isActive={index === currentIndex}
                onClick={() => handleDotClick(index)}
                isMobile={false}
              />
            ))}
          </div>
        )}
      </div>
    ),
    [currentIndex, handleDotClick, images]
  );

  // Add this CSS to your global styles or as a style tag
  const styles = `
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  // Add this to your component, before the return statement
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <section id="demo" className="py-8 md:py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            See it in Action
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Experience our dental practice management solution
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">{renderCarousel(false)}</div>

        {/* Mobile View */}
        <div className="md:hidden">{renderCarousel(true)}</div>
      </div>
    </section>
  );
};

export default memo(Demo);
