import styles from "./About.module.scss";
import SEO from '../../components/Blog/SEO';
import { getSEOConfig } from '../../config/seo';

const About = () => {
  const seo = getSEOConfig('about');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.aboutPage}>
    <h2>About</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default About;
