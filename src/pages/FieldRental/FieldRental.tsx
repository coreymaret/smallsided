import styles from "./FieldRental.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';

const FieldRental = () => {
  const seo = getSEOConfig('fieldRental');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.fieldRentalPage}>
        <h2>Field Rental</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default FieldRental;
