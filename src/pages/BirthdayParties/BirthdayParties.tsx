import styles from "./BirthdayParties.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Cake } from '../../components/Icons/Icons';
import RegisterBirthday from '../../components/Register/components/RegisterBirthday/RegisterBirthday';

const BirthdayParties = () => {
  const seo = getSEOConfig('birthdayParties');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.birthdayPartiesPage}>
        <div className={styles.birthdayHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Cake size={48} />
            </div>
            <h1>Birthday Party Booking</h1>
            <p className={styles.heroSubtitle}>Celebrate With Us</p>
            <p className={styles.heroDescription}>
              Make your child's special day unforgettable with our all-inclusive party packages
            </p>
          </div>
        </div>

        <RegisterBirthday />
      </div>
    </>
  );
};

export default BirthdayParties;