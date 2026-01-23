import styles from "./FieldRental.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import Booking from '../../components/Booking/Booking';


const FieldRental = () => {
  const seo = getSEOConfig('fieldRental');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.aboutPage}>
      <Booking />
    </div>
    </>
  );
}

export default FieldRental;
