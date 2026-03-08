import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from '../../components/Icons/Icons';
import './ReviewSection.scss';

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  date: string;
}

const ReviewsSection = () => {
  const { t } = useTranslation();

  const reviews: Review[] = t('home.reviews.items', { returnObjects: true }) as Review[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number>();

  // Triple the reviews array for infinite loop
  const extendedReviews = [...reviews, ...reviews, ...reviews];

  const scrollToIndex = (index: number, smooth: boolean = true) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.scrollWidth / extendedReviews.length;
      scrollContainerRef.current.scrollTo({
        left: cardWidth * index,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    scrollToIndex(reviews.length + index, true);
    resetAutoScroll();
  };

  const nextSlide = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.scrollWidth / extendedReviews.length;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const currentPosition = Math.round(currentScroll / cardWidth);
      
      scrollToIndex(currentPosition + 1, true);
      
      const nextIndex = (currentIndex + 1) % reviews.length;
      setCurrentIndex(nextIndex);
    }
  };

  const resetAutoScroll = () => {
    if (autoScrollRef.current) {
      window.clearInterval(autoScrollRef.current);
    }
    autoScrollRef.current = window.setInterval(() => {
      nextSlide();
    }, 3000);
  };

  useEffect(() => {
    scrollToIndex(reviews.length, false);
    resetAutoScroll();

    return () => {
      if (autoScrollRef.current) {
        window.clearInterval(autoScrollRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.scrollWidth / extendedReviews.length;
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const index = Math.round(scrollLeft / cardWidth);
      
      if (index <= 0) {
        setTimeout(() => {
          scrollToIndex(reviews.length, false);
        }, 50);
      } else if (index >= reviews.length * 2) {
        setTimeout(() => {
          scrollToIndex(reviews.length, false);
        }, 50);
      }
      
      const actualIndex = index % reviews.length;
      if (actualIndex !== currentIndex) {
        setCurrentIndex(actualIndex);
      }
    }
  };

  const handleScrollEnd = () => {
    resetAutoScroll();
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    let scrollTimeout: number;
    
    const onScroll = () => {
      handleScroll();
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(handleScrollEnd, 150);
    };
    
    if (container) {
      container.addEventListener('scroll', onScroll);
      return () => {
        container.removeEventListener('scroll', onScroll);
        window.clearTimeout(scrollTimeout);
      };
    }
  }, [currentIndex]);

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <h2>{t('home.reviews.heading')}</h2>
          <p>{t('home.reviews.subheading')}</p>
        </div>

        <div className="reviews-carousel">
          <div 
            ref={scrollContainerRef}
            className="reviews-scroll-container"
          >
            {extendedReviews.map((review, index) => (
              <div key={`${review.id}-${index}`} className="review-card">
                <div className="review-stars">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#98ED66" stroke="#98ED66" />
                  ))}
                </div>
                
                <p className="review-text">{review.text}</p>
                
                <div className="review-footer">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="reviewer-details">
                      <p>{review.name}</p>
                      <span>{review.role}</span>
                    </div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-dots">
            <svg 
              width={reviews.length * 20} 
              height={20}
              style={{ overflow: 'visible' }}
            >
              {reviews.map((_, index) => (
                <circle
                  key={`dot-${index}`}
                  cx={index * 20 + 10}
                  cy={10}
                  r={4}
                  fill="#d3d3d3"
                  opacity={0.6}
                  style={{ cursor: 'pointer' }}
                  onClick={() => goToSlide(index)}
                />
              ))}
              
              <circle
                cx={currentIndex * 20 + 10}
                cy={10}
                r={5}
                fill="#98ED66"
                opacity={1}
                style={{
                  transition: 'cx 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)',
                  pointerEvents: 'none'
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;