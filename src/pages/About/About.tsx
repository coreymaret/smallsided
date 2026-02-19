// src/pages/About/About.tsx

// Styles
import styles from "./About.module.scss";

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Components
import FeaturesSection from '../../components/FeaturesSection/FeaturesSection';

/**
 * About page showcasing facility features
 * and the benefits of small-sided soccer.
 */
const About = () => {
  const seo = getSEOConfig('about');

  return (
    <>
      {/* SEO meta tags, OG, Twitter, JSON-LD */}
      <SEO {...seo} />

      <div className={styles.aboutPage}>
        {/* Facility features & benefits */}
        <FeaturesSection />
      </div>
    </>
  );
};

export default About;