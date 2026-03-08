import styles from "./Training.module.scss";
import { useTranslation } from 'react-i18next';
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { ChartNoAxesCombined } from '../../components/Icons/Icons';
import RegisterTraining from '../../components/Register/components/RegisterTraining/RegisterTraining';

const Training = () => {
  const seo = getSEOConfig('training');
  const { t } = useTranslation();

  return (
    <>
      <SEO {...seo} />
      <div className={styles.trainingPage}>
        <div className={styles.trainingHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <ChartNoAxesCombined size={48} />
            </div>
            <h1>{t('training.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('training.subtitle')}</p>
            <p className={styles.heroDescription}>{t('training.description')}</p>
          </div>
        </div>

        <RegisterTraining />
      </div>
    </>
  );
};

export default Training;