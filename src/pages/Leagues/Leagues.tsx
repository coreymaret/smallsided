import styles from "./Leagues.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';

const Leagues = () => {
  const seo = getSEOConfig('birthday-parties');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.leaguesPage}>
        <h2>Leagues</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    </>
  );
}

export default Leagues;
