import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import lottie from 'lottie-web';
import styles from './NotFound.module.scss';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const animationContainer = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadAnimation = async () => {
      if (!animationContainer.current) return;

      try {
        const response = await fetch('/NotFound.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const animationData = await response.json();

        animationInstance.current = lottie.loadAnimation({
          container: animationContainer.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: animationData
        });
      } catch (err) {
        console.error('Failed to load animation:', err);
        setError('Animation failed to load');
      }
    };

    loadAnimation();

    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy();
      }
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.content}>
        <div className={styles.animationWrapper} ref={animationContainer}>
          {error && <div className={styles.error}>{error}</div>}
        </div>
        <h1 className={styles.heading}>Oops!</h1>
        <h2 className={styles.subheading}>Something went wrong</h2>
        <button className={styles.goBackButton} onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;