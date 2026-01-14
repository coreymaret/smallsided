import styles from "./Home.module.scss";
import Popup from '../../components/Popup/Popup'
import SEO from '../../components/Blog/SEO';
import { getSEOConfig } from '../../config/seo';

const Home = () => {
  const seo = getSEOConfig('home');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.homePage}>
      {/* Row 1 */}
      <section className={styles.heroSection}>
        <div className={styles.imageColumn}>
          <img 
            src="/images/soccer-dribbling.jpg" 
            alt="Youth soccer player dribbling a ball in 7v7 format"
            width="400"
            height="400"
            loading="eager"
          />
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h1 className={styles.statHighlight}>50% MORE TOUCHES IN 7V7</h1>
            <p className={styles.description}>Half your team, double the development. Players get 50% more ball touches in 7v7 vs 11v11. Every touch matters when you're building tomorrow's stars.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      {/* Row 2 */}
      <section className={`${styles.heroSection} ${styles.row2}`}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h2 className={styles.statHighlight}>66% LESS STANDING AROUND</h2>
            <p className={styles.description}>The ball is out of play 34% of the time in 11v11, but only 8% in 4v4. That means 66% less time standing around and 66% more time developing skills.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <img 
            src="/images/soccer-running.jpg" 
            alt="Youth soccer player running with the ball"
            width="400"
            height="400"
            loading="lazy"
          />
        </div>
      </section>

      <hr className={styles.separator} />

      {/* Row 3 */}
      <section className={styles.heroSection}>
        <div className={styles.imageColumn}>
          <img 
            src="/images/soccer-shooting.jpg" 
            alt="Youth soccer player shooting at goal"
            width="400"
            height="400"
            loading="lazy"
          />
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h2 className={styles.statHighlight}>2X MORE SCORING OPPORTUNITIES</h2>
            <p className={styles.description}>Goals every 2 minutes in 4v4 vs. every 4 minutes in 7v7. Double the chances to practice finishing, double the confidence, double the joy. This is how you fall in love with the game.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      {/* Row 4 */}
      <section className={`${styles.heroSection} ${styles.row2}`}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h2 className={styles.statHighlight}>3X MORE 1V1 BATTLES</h2>
            <p className={styles.description}>Want your player to develop confidence? Small-sided games create 3X more one-on-one situations in 4v4 (and 2X more in 7v7). Real game scenarios, real skill development.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <img 
            src="/images/soccer-1v1.jpg" 
            alt="Youth soccer player in one-on-one battle with defender"
            width="400"
            height="400"
            loading="lazy"
          />
        </div>
      </section>

      <Popup />
    </div>
    </>
  );
};

export default Home;