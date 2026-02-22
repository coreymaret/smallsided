import styles from "./Training.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { ChartNoAxesCombined } from '../../components/Icons/Icons';
import RegisterTraining from '../../components/Register/components/RegisterTraining/RegisterTraining';

const Training = () => {
  const seo = getSEOConfig('training');

  return (
    <>
      <SEO {...seo} />
      <div className={styles.trainingPage}>
        <div className={styles.trainingHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <ChartNoAxesCombined size={48} />
            </div>
            <h1>Training Program Registration</h1>
            <p className={styles.heroSubtitle}>Elevate Your Game</p>
            <p className={styles.heroDescription}>
              Personalized soccer training to elevate your game
            </p>
          </div>
        </div>

        <RegisterTraining />
      </div>
    </>
  );
};

export default Training;