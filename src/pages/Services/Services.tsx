import styles from "./Services.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';

const Services = () => {
  const seo = getSEOConfig('services');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.servicesPage}>
        <h2>Services</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default Services;
