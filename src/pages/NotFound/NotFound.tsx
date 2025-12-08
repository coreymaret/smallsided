// Import React and necessary hooks
import React, { useEffect, useRef, useState } from 'react';
// Import navigation hook from react-router
import { useNavigate } from 'react-router-dom';
// Import Lottie for loading animations
import lottie from 'lottie-web';
// Import component-specific styles
import styles from './NotFound.module.scss';

// Define the NotFound component using React.FC
const NotFound: React.FC = () => {
  // Used to navigate programmatically (back, home, etc.)
  const navigate = useNavigate();
  // Ref for the div that will contain the Lottie animation
  const animationContainer = useRef<HTMLDivElement>(null);
  // Ref to store the Lottie animation instance so it can be destroyed
  const animationInstance = useRef<any>(null);
  // Error state to show if animation fails to load
  const [error, setError] = useState<string>('');

  // useEffect runs once on mount (empty dependency array)
  useEffect(() => {
    // Define async function to load the Lottie animation
    const loadAnimation = async () => {
      // If container doesn't exist yet, exit early
      if (!animationContainer.current) return;

      try {
        // Fetch the animation JSON file from the public folder
        const response = await fetch('/NotFound.json');
        // Throw error if response is not OK (HTTP error)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON content of the animation
        const animationData = await response.json();

        // 🔥 FIX: destroy any existing animation to prevent duplicates
        if (animationInstance.current) {
          animationInstance.current.destroy();
        }

        // Load and start the Lottie animation
        animationInstance.current = lottie.loadAnimation({
          container: animationContainer.current, // Target container
          renderer: 'svg', // Render animation as SVG
          loop: true, // Loop forever
          autoplay: true, // Start automatically
          animationData: animationData // Animation JSON
        });
      } catch (err) {
        // Log the error and show a user-friendly message
        console.error('Failed to load animation:', err);
        setError('Animation failed to load');
      }
    };

    // Call the animation loader
    loadAnimation();

    // Cleanup function runs on unmount
    return () => {
      // Destroy animation instance to prevent memory leaks
      if (animationInstance.current) {
        animationInstance.current.destroy();
      }
    };
  }, []); // Empty array ensures this runs only once

  // Navigates back one page in browser history
  const handleGoBack = () => {
    navigate(-1);
  };

  // Navigates to the home route
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    // Main container styled from SCSS
    <div className={styles.notFoundContainer}>
      <div className={styles.content}>
        {/* Lottie animation wrapper with ref applied */}
        <div className={styles.animationWrapper} ref={animationContainer}>
          {/* Display error message if animation fails */}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {/* Main heading */}
        <h1 className={styles.heading}>Oops!</h1>

        {/* Subheading text */}
        <h2 className={styles.subheading}>Something went wrong</h2>

        {/* ⭐ Two buttons side by side */}
        <div className={styles.buttonRow}>
          {/* Go Back button */}
          <button className={styles.goBackButton} onClick={handleGoBack}>
            Go Back
          </button>

          {/* Go Home button */}
          <button className={styles.goBackButton} onClick={handleGoHome}>
            Go Home
          </button>
        </div>

      </div>
    </div>
  );
};

// Export the component
export default NotFound;
