import { useState, useRef, useEffect } from 'react';
import './Carousel.scss';

interface Card {
  id: number;
  color: string;
}

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const cards: Card[] = [
    { id: 1, color: '#FF6B6B' },
    { id: 2, color: '#4ECDC4' },
    { id: 3, color: '#45B7D1' },
    { id: 4, color: '#FFA07A' },
    { id: 5, color: '#98D8C8' },
    { id: 6, color: '#F7DC6F' },
    { id: 7, color: '#BB8FCE' },
    { id: 8, color: '#85C1E2' },
  ];

  // Create extended array with clones for infinite loop
  const extendedCards = [cards[cards.length - 1], ...cards, cards[0]];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStart - touchEnd;
    
    if (swipeDistance > 50) {
      goToNext();
    } else if (swipeDistance < -50) {
      goToPrev();
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1);
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(calc(-${currentIndex} * (70vw + 1rem)))`;
    }
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(cards.length);
      }, 500);
    } else if (currentIndex === extendedCards.length - 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 500);
    } else {
      setIsTransitioning(true);
    }
  }, [currentIndex, cards.length, extendedCards.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getDisplayIndex = () => {
    if (currentIndex === 0) return cards.length - 1;
    if (currentIndex === extendedCards.length - 1) return 0;
    return currentIndex - 1;
  };

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <div
          className="carousel"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            transition: isTransitioning 
              ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
              : 'none' 
          }}
        >
          {extendedCards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className={`carousel-card ${index === currentIndex ? 'active' : ''}`}
              style={{ backgroundColor: card.color }}
            >
              <div className="card-content">
                <h2>Card {card.id}</h2>
                <p>Slide {card.id} of {cards.length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-dots">
        {cards.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === getDisplayIndex() ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}