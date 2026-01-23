import styles from "./Pickup.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import PickupReservation from '../../components/PickupReservation/PickupReservation';


const Pickup = () => {
  const seo = getSEOConfig('pickup');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.pickupPage}>
        <PickupReservation />
    </div>
    </>
  );
}

export default Pickup;
