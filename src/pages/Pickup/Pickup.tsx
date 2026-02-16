import styles from "./Pickup.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import RegisterPickup from '../../components/Register/components/RegisterPickup/RegisterPickup';

const Pickup = () => {
  const seo = getSEOConfig('pickup');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.pickupPage}>
        <RegisterPickup />
      </div>
    </>
  );
}

export default Pickup;