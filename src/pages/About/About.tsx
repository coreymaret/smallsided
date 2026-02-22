// src/pages/About/About.tsx

// Styles
import styles from "./About.module.scss";

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Icons
import { Trophy } from '../../components/Icons/Icons';

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
        <div className={styles.aboutHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Trophy size={48} />
            </div>
            <h1>Why Small-Sided Soccer Works</h1>
            <p className={styles.heroSubtitle}>The Science Behind Better Player Development</p>
            <p className={styles.heroDescription}>
              Discover the key benefits that make small-sided formats the superior choice for youth development
            </p>
          </div>
        </div>

        {/* Facility features & benefits */}
        <FeaturesSection />
      </div>
    </>
  );
};

export default About;