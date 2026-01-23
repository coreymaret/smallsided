import styles from "./About.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import FeaturesSection from '../../components/FeaturesSection/FeaturesSection';

const About = () => {
  const seo = getSEOConfig('about');
  return (
    <>
      <div className={styles.aboutPage}>
        <SEO {...seo} />
        <FeaturesSection />
      </div>
    </>
  );
}

export default About;
