// src/pages/Home/Home.tsx

// Styles
import styles from "./Home.module.scss";

// i18n
import { useTranslation } from 'react-i18next';

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Components
import HomeSlider from '../../components/HomeSlider/HomeSlider';
import IntroHero from '../../components/IntroHero/IntroHero';
import StatSection from '../../components/StatSection/StatSection';
import StatRow from '../../components/StatRow/StatRow';
import ReviewSection from '../../components/Reviews/ReviewSection';

/*
 * Home page featuring a hero slider, intro section,
 * stat highlights, and customer reviews.
 */
const Home = () => {
  const seo = getSEOConfig('home');
  const { t } = useTranslation();

  /**
   * Data-driven stat rows highlighting small-sided soccer benefits.
   * Each row alternates layout direction via the `reversed` flag.
   */
  const statRowsData = [
    {
      id: 'row1',
      stat: t('home.statRows.row1.stat'),
      description: t('home.statRows.row1.description'),
      imageAlt: t('home.statRows.row1.imageAlt'),
      reversed: false,
    },
    {
      id: 'row2',
      stat: t('home.statRows.row2.stat'),
      description: t('home.statRows.row2.description'),
      imageAlt: t('home.statRows.row2.imageAlt'),
      reversed: true,
    },
  ];

  return (
    <>
      {/* SEO meta tags, OG, Twitter, JSON-LD */}
      <SEO {...seo} />

      <div className={styles.homePage}>
        {/* Hero carousel */}
        <HomeSlider />

        {/* Mission / intro section */}
        <IntroHero />

        {/* High-level stats overview */}
        <StatSection />

        {/* Detailed stat rows with alternating layouts */}
        {statRowsData.map((row, index) => (
          <StatRow
            key={index}
            id={row.id}
            stat={row.stat}
            description={row.description}
            imageAlt={row.imageAlt}
            reversed={row.reversed}
          />
        ))}

        {/* Customer reviews */}
        <ReviewSection />
      </div>
    </>
  );
};

export default Home;