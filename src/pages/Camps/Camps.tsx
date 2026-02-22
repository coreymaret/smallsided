import styles from "./Camps.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Smile } from '../../components/Icons/Icons';
import RegisterCamps from '../../components/Register/components/RegisterCamps/RegisterCamps';

const Camps = () => {
  const seo = getSEOConfig('camps');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.campsPage}>
        <div className={styles.campsHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Smile size={48} />
            </div>
            <h1>Soccer Camp Registration</h1>
            <p className={styles.heroSubtitle}>Skills, Fun & Development</p>
            <p className={styles.heroDescription}>
              Join us for an unforgettable week of soccer, fun, and skill development
            </p>
          </div>
        </div>

        <RegisterCamps />
      </div>
    </>
  );
};

export default Camps;