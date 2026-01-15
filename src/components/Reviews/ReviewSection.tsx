import { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import './ReviewSection.scss';

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Parent & Coach",
    rating: 5,
    text: "Switching to 7v7 format has been transformative for our U10 team. The kids get so many more touches on the ball, and I've noticed significant improvements in their decision-making and confidence.",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Youth Soccer Director",
    rating: 5,
    text: "The data doesn't lie - our players are getting 3x more 1v1 situations in small-sided games. We've seen tremendous development in technical skills and game awareness since making the switch.",
    date: "1 month ago"
  },
  {
    id: 3,
    name: "Jennifer Chang",
    role: "Parent",
    rating: 5,
    text: "My daughter used to spend most of the game standing around. Now she's constantly involved, touching the ball, and having fun. She actually looks forward to practice and games!",
    date: "3 weeks ago"
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Club Administrator",
    rating: 5,
    text: "Implementing small-sided soccer across our club has been one of the best decisions we've made. Parents love it, kids love it, and the development results speak for themselves.",
    date: "2 months ago"
  },
  {
    id: 5,
    name: "Lisa Anderson",
    role: "Coach",
    rating: 5,
    text: "The statistics on increased scoring opportunities are accurate. Our players are more engaged, making better decisions, and developing faster than ever before. Small-sided soccer just makes sense.",
    date: "1 month ago"
  },
  {
    id: 6,
    name: "Robert Kim",
    role: "Parent & Former Pro",
    rating: 5,
    text: "As someone who played professionally, I wish I had access to this format as a kid. The number of meaningful touches and game situations these kids experience is exactly what develops elite players.",
    date: "3 weeks ago"
  }
];

const ReviewsSection = () => {
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
      
      // Move to next position
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
    // Initialize position to middle set
    scrollToIndex(reviews.length, false);
    
    // Start auto scroll
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
      
      // Check if we've scrolled to the first or last set, reset position
      if (index <= 0) {
        setTimeout(() => {
          scrollToIndex(reviews.length, false);
        }, 50);
      } else if (index >= reviews.length * 2) {
        setTimeout(() => {
          scrollToIndex(reviews.length, false);
        }, 50);
      }
      
      // Update current index based on scroll position
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
          <h2>What Coaches & Parents Say</h2>
          <p>Real feedback from clubs and families embracing small-sided soccer</p>
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
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="reviewer-details">
                      <h4>{review.name}</h4>
                      <span>{review.role}</span>
                    </div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-dots">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentIndex === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;