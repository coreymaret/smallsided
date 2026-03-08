// src/pages/About/About.tsx

// Styles
import styles from "./About.module.scss";

// i18n
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
            <h1>{t('about.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('about.subtitle')}</p>
            <p className={styles.heroDescription}>{t('about.description')}</p>
          </div>
        </div>

        {/* Facility features & benefits */}
        <FeaturesSection />
      </div>
    </>
  );
};

export default About;