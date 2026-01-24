import styles from "./Training.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import PricingSection from '../../components/PricingSection/PricingSection';

const Training = () => {
  const seo = getSEOConfig('training');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.trainingPage}>
                <PricingSection />
    </div>
    </>
  );
}

export default Training;
