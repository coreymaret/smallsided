import styles from "./Pickup.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Users } from '../../components/Icons/Icons';
import RegisterPickup from '../../components/Register/components/RegisterPickup/RegisterPickup';

const Pickup = () => {
  const seo = getSEOConfig('pickup');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.pickupPage}>
        <div className={styles.pickupHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Users size={48} />
            </div>
            <h1>Pickup Games</h1>
            <p className={styles.heroSubtitle}>Drop In & Play</p>
            <p className={styles.heroDescription}>
              Join friendly matches at your skill level. Drop in for a game whenever you're free!
            </p>
          </div>
        </div>

        <RegisterPickup />
      </div>
    </>
  );
};

export default Pickup;