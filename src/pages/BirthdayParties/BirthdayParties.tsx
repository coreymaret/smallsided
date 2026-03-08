import styles from "./BirthdayParties.module.scss";
import { useTranslation } from 'react-i18next';
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Cake } from '../../components/Icons/Icons';
import RegisterBirthday from '../../components/Register/components/RegisterBirthday/RegisterBirthday';

const BirthdayParties = () => {
  const seo = getSEOConfig('birthdayParties');
  const { t } = useTranslation();

  return (
    <>
      <SEO {...seo} />
      <div className={styles.birthdayPartiesPage}>
        <div className={styles.birthdayHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Cake size={48} />
            </div>
            <h1>{t('birthday.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('birthday.subtitle')}</p>
            <p className={styles.heroDescription}>{t('birthday.description')}</p>
          </div>
        </div>

        <RegisterBirthday />
      </div>
    </>
  );
};

export default BirthdayParties;