import styles from "./FieldRental.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Calendar } from '../../components/Icons/Icons';
import RegisterFieldRental from '../../components/Register/components/RegisterFieldRental/RegisterFieldRental';

const FieldRental = () => {
  const seo = getSEOConfig('fieldRental');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.fieldRentalPage}>
        <div className={styles.fieldRentalHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Calendar size={48} />
            </div>
            <h1>Field Rental</h1>
            <p className={styles.heroSubtitle}>Book Your Perfect Field</p>
            <p className={styles.heroDescription}>
              Book your perfect field for games, practices, or events
            </p>
          </div>
        </div>

        <RegisterFieldRental />
      </div>
    </>
  );
};

export default FieldRental;