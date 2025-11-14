import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import lottie from 'lottie-web';
import styles from './NotFound.module.scss';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const animationContainer = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<any>(null);

  useEffect(() => {
    if (animationContainer.current) {
      // Load your Lottie animation
      animationInstance.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        // Replace this path with your actual Lottie JSON file
        path: '../../public/NotFound.json'
      });
    }

    // Cleanup animation on unmount
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
        <div className={styles.animationWrapper} ref={animationContainer} />
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