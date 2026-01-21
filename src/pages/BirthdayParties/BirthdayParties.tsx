import styles from "./BirthdayParties.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';

const BirthdayParties = () => {
  const seo = getSEOConfig('birthdayParties');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.birthdayPartiesPage}>
        <h2>Birthday Parties</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default BirthdayParties;
