import styles from "./Training.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';

const Training = () => {
  const seo = getSEOConfig('training');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.trainingPage}>
        <h2>Training</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default Training;
