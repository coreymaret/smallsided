import { useTranslation } from 'react-i18next';
import styles from "./IntroHero.module.scss";
import iso1Image from '/images/iso1.webp'

const IntroHero = () => {
  const { t } = useTranslation();

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
          alt={t('home.intro.imageAlt')}
          width="400"
          height="400"
          loading="eager"
          {...{ fetchpriority: "high" }}
        />
      </div>
      <div className={styles.textColumn}>
        <div className={styles.textContent}>
          <h1 className={styles.heroTitle}>{t('home.intro.heading')}</h1>
          <p className={styles.heroSubtitle}>{t('home.intro.subtitle')}</p>
          <a href="#row1" className={styles.ctaButton} onClick={scrollToSection}>
            {t('home.intro.cta')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default IntroHero;