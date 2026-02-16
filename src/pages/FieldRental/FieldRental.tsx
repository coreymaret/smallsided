import styles from "./FieldRental.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import RegisterFieldRental from '../../components/Register/components/RegisterFieldRental/RegisterFieldRental';

const FieldRental = () => {
  const seo = getSEOConfig('fieldRental');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.aboutPage}>
        <RegisterFieldRental />
      </div>
    </>
  );
}

export default FieldRental;