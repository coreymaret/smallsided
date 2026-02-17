import styles from "./Home.module.scss";
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';
import ReviewSection from '../../components/Reviews/ReviewSection';
import HomeSlider from '../../components/HomeSlider/HomeSlider';
import IntroHero from '../../components/IntroHero/IntroHero';
import StatSection from '../../components/StatSection/StatSection';
import StatRow from '../../components/StatRow/StatRow';

// Stat row data
const statRowsData = [
  {
    id: 'row1',
    stat: '500% MORE TOUCHES IN 7V7',
    description: 'Half your team, double the development. Players get 50% more ball touches in 7v7 vs 11v11. Every touch matters when you\'re building tomorrow\'s stars.',
    imageAlt: 'Youth soccer player dribbling a ball in 7v7 format',
    reversed: false
  },
  {
    stat: '66% LESS STANDING AROUND',
    description: 'The ball is out of play 34% of the time in 11v11, but only 8% in 4v4. That means 66% less time standing around and 66% more time developing skills.',
    imageAlt: 'Youth soccer player running with the ball',
    reversed: true
  },
  {
    stat: '2X MORE SCORING OPPORTUNITIES',
    description: 'Goals every 2 minutes in 4v4 vs. every 4 minutes in 7v7. Double the chances to practice finishing, double the confidence, double the joy. This is how you fall in love with the game.',
    imageAlt: 'Youth soccer player shooting at goal',
    reversed: false
  },
  {
    stat: '3X MORE 1V1 BATTLES',
    description: 'Want your player to develop confidence? Small-sided games create 3X more one-on-one situations in 4v4 (and 2X more in 7v7). Real game scenarios, real skill development.',
    imageAlt: 'Youth soccer player in one-on-one battle with defender',
    reversed: true
  }
];

const Home = () => {
  const seo = getSEOConfig('home');

  return (
    <>
      <SEO {...seo} />
      <div className={styles.homePage}>
        <HomeSlider />
        <IntroHero />
        <StatSection />

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
        
        <ReviewSection />
      </div>
    </>
  );
};

export default Home;