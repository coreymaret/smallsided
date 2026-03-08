import styles from "./Camps.module.scss";
import { useTranslation } from 'react-i18next';
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Smile } from '../../components/Icons/Icons';
import RegisterCamps from '../../components/Register/components/RegisterCamps/RegisterCamps';

const Camps = () => {
  const seo = getSEOConfig('camps');
  const { t } = useTranslation();

  return (
    <>
      <SEO {...seo} />
      <div className={styles.campsPage}>
        <div className={styles.campsHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Smile size={48} />
            </div>
            <h1>{t('camps.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('camps.subtitle')}</p>
            <p className={styles.heroDescription}>{t('camps.description')}</p>
          </div>
        </div>

        <RegisterCamps />
      </div>
    </>
  );
};

export default Camps;