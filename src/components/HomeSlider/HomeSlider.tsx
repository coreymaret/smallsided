import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HomeSlider.module.scss';

interface Slide {
  id: number;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  background: string;
}

const slides: Slide[] = [
  {
    id: 1,
    heading: 'Develop Skills Through Small-Sided Soccer',
    subheading: 'Research-backed training methods that accelerate player development with more touches, faster decisions, and better technique.',
    buttonText: 'Start Training',
    buttonLink: '/pricing',
    background: 'linear-gradient(135deg, #15141a 0%, #2a2930 100%)'
  },
  {
    id: 2,
    heading: 'Book Premium 7v7 Soccer Fields',
    subheading: 'Professional-grade facilities designed specifically for small-sided games. Available for teams, clubs, and training sessions.',
    buttonText: 'View Fields',
    buttonLink: '/booking',
    background: 'linear-gradient(135deg, #1a2820 0%, #15141a 100%)'
  },
  {
    id: 3,
    heading: 'Expert Coaching Resources',
    subheading: 'Access hundreds of training exercises, tactical insights, and proven methodologies from experienced youth soccer coaches.',
    buttonText: 'Explore Resources',
    buttonLink: '/blog',
    background: 'linear-gradient(135deg, #15141a 0%, #1f1e26 100%)'
  }
];

const IntroHero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide) return;
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      handleUserInteraction();
      if (diff > 0) {
        // Swiped left - go to next slide
        nextSlide();
      } else {
        // Swiped right - go to previous slide
        prevSlide();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section 
      className={styles.introHero}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.slidesContainer}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${
              index === currentSlide ? styles.active : ''
            } ${
              index === currentSlide ? styles[direction] : ''
            }`}
            style={{ background: slide.background }}
          >
            <div className={styles.content}>
              <h1 className={styles.heading}>{slide.heading}</h1>
              <p className={styles.subheading}>{slide.subheading}</p>
              <a 
                href={slide.buttonLink} 
                className={styles.ctaButton}
                onClick={handleUserInteraction}
              >
                {slide.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={() => {
          handleUserInteraction();
          prevSlide();
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft />
      </button>

      <button
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={() => {
          handleUserInteraction();
          nextSlide();
        }}
        aria-label="Next slide"
      >
        <ChevronRight />
      </button>

      {/* Liquid Pagination Dots */}
      <div className={styles.pagination}>
        <svg width="80" height="20" viewBox="0 0 80 20">
          <defs>
            <filter id="goo-intro-hero">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
          <g filter="url(#goo-intro-hero)">
            {slides.map((_, index) => {
              const isActive = index === currentSlide;
              const baseX = 16 + index * 24;
              
              return (
                <circle
                  key={index}
                  cx={baseX}
                  cy="10"
                  r={isActive ? 7 : 4}
                  fill={isActive ? '#98ED66' : 'rgba(248, 249, 250, 0.4)'}
                  onClick={() => {
                    handleUserInteraction();
                    goToSlide(index);
                  }}
                  style={{
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            key={currentSlide}
          />
        </div>
      )}
    </section>
  );
};

export default IntroHero;