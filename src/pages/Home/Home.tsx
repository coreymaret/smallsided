// src/pages/Home/Home.tsx

// Styles
import styles from "./Home.module.scss";

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Components
import HomeSlider from '../../components/HomeSlider/HomeSlider';
import IntroHero from '../../components/IntroHero/IntroHero';
import StatSection from '../../components/StatSection/StatSection';
import StatRow from '../../components/StatRow/StatRow';
import ReviewSection from '../../components/Reviews/ReviewSection';

/**
 * Data-driven stat rows highlighting small-sided soccer benefits.
 * Each row alternates layout direction via the `reversed` flag.
 */
const statRowsData = [
  {
    id: 'row1',
    stat: '500% MORE TOUCHES IN 7V7',
    description:
      'Half your team, double the development. Players get 50% more ball touches in 7v7 vs 11v11. Every touch matters when you\'re building tomorrow\'s stars.',
    imageAlt: 'Youth soccer player dribbling a ball in 7v7 format',
    reversed: false,
  },
  {
    id: 'row2',
    stat: '66% LESS STANDING AROUND',
    description:
      'The ball is out of play 34% of the time in 11v11, but only 8% in 4v4. That means 66% less time standing around and 66% more time developing skills.',
    imageAlt: 'Youth soccer player running with the ball',
    reversed: true,
  },
];

/*
 * Home page featuring a hero slider, intro section,
 * stat highlights, and customer reviews.
 */
const Home = () => {
  const seo = getSEOConfig('home');

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