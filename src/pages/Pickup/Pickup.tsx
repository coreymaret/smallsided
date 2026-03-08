import styles from "./Pickup.module.scss";
import { useTranslation } from 'react-i18next';
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Users } from '../../components/Icons/Icons';
import RegisterPickup from '../../components/Register/components/RegisterPickup/RegisterPickup';

const Pickup = () => {
  const seo = getSEOConfig('pickup');
  const { t } = useTranslation();

  return (
    <>
      <SEO {...seo} />
      <div className={styles.pickupPage}>
        <div className={styles.pickupHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Users size={48} />
            </div>
            <h1>{t('pickup.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('pickup.subtitle')}</p>
            <p className={styles.heroDescription}>{t('pickup.description')}</p>
          </div>
        </div>

        <RegisterPickup />
      </div>
    </>
  );
};

export default Pickup;