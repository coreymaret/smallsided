import styles from "./Camps.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';

const Camps = () => {
  const seo = getSEOConfig('camps');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.campsPage}>
        <h2>Camps</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default Camps;
