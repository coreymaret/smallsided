import styles from "./Pickup.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';

const Pickup = () => {
  const seo = getSEOConfig('pickup');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.pickupPage}>
        <h2>Pickup</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default Pickup;
