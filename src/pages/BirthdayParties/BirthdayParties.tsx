import styles from "./BirthdayParties.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import RegisterBirthday from '../../components/RegisterBirthday/RegisterBirthday'


const BirthdayParties = () => {
  const seo = getSEOConfig('birthdayParties');
  return (
    <>
    <div className={styles.aboutPage}>
        <SEO {...seo} />
        <RegisterBirthday />
      </div>
    </>
  );
}

export default BirthdayParties;