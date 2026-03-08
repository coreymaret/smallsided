import styles from "./FieldRental.module.scss";
import { useTranslation } from 'react-i18next';
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Calendar } from '../../components/Icons/Icons';
import RegisterFieldRental from '../../components/Register/components/RegisterFieldRental/RegisterFieldRental';

const FieldRental = () => {
  const seo = getSEOConfig('fieldRental');
  const { t } = useTranslation();

  return (
    <>
      <SEO {...seo} />
      <div className={styles.fieldRentalPage}>
        <div className={styles.fieldRentalHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Calendar size={48} />
            </div>
            <h1>{t('fieldRental.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('fieldRental.subtitle')}</p>
            <p className={styles.heroDescription}>{t('fieldRental.description')}</p>
          </div>
        </div>

        <RegisterFieldRental />
      </div>
    </>
  );
};

export default FieldRental;