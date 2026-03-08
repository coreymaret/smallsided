import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from "./StatSection.module.scss";

// Animated counter hook
const useCountUp = (end: number, duration: number = 2000, isVisible: boolean) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeInOutQuad = (t: number) => 
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      const currentCount = Math.floor(easeInOutQuad(progress) * (end - startValue) + startValue);
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);
  
  return count;
};

const StatsSection = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);

  const stat1 = useCountUp(10000, 2000, isVisible);
  const stat2 = useCountUp(850, 2000, isVisible);
  const stat3 = useCountUp(47, 2000, isVisible);
  const stat4 = useCountUp(98, 2000, isVisible);

  return (
    <section ref={statsRef} className={styles.statsSection}>
      <div className={styles.statColumn}>
        <div className={styles.statNumber}>{stat1.toLocaleString()}+</div>
        <div className={styles.statLabel}>{t('home.stats.playersLabel')}</div>
      </div>
      <div className={styles.statColumn}>
        <div className={styles.statNumber}>{stat2.toLocaleString()}+</div>
        <div className={styles.statLabel}>{t('home.stats.sessionsLabel')}</div>
      </div>
      <div className={styles.statColumn}>
        <div className={styles.statNumber}>{stat3}+</div>
        <div className={styles.statLabel}>{t('home.stats.academiesLabel')}</div>
      </div>
      <div className={styles.statColumn}>
        <div className={styles.statNumber}>{stat4}%</div>
        <div className={styles.statLabel}>{t('home.stats.satisfactionLabel')}</div>
      </div>
    </section>
  );
};

export default StatsSection;