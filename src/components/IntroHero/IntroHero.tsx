import styles from "./IntroHero.module.scss";
import iso1Image from '../../assets/images/home-sections/iso1.webp'

const IntroHero = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector('#row1');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className={styles.introHero}>
      <div className={styles.imageColumn}>
        <img 
          src={iso1Image}
          alt="Small-sided soccer isometric illustration"
          width="400"
          height="400"
          loading="eager"
        />
      </div>
      <div className={styles.textColumn}>
        <div className={styles.textContent}>
          <h1 className={styles.heroTitle}>The Future of Youth Soccer is Small-Sided</h1>
          <p className={styles.heroSubtitle}>
            More touches. More decisions. More development. Discover why the world's best 
            academies are choosing small-sided formats to develop tomorrow's stars.
          </p>
          <a href="#row1" className={styles.ctaButton} onClick={scrollToSection}>
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default IntroHero;