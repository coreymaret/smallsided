import styles from "./BirthdayParties.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import Register from '../../components/Register/Register';
import { birthdayConfig } from '../../components/Register/configs';

const BirthdayParties = () => {
  const seo = getSEOConfig('birthdayParties');
  return (
    <>
      <div className={styles.aboutPage}>
        <SEO {...seo} />
        <Register config={birthdayConfig} />
      </div>
    </>
  );
}

export default BirthdayParties;