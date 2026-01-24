import styles from "./Camps.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import RegisterCamps from '../../components/RegisterCamps/RegisterCamps';

const Camps = () => {
  const seo = getSEOConfig('camps');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.campsPage}>
        <RegisterCamps />
    </div>
    </>
  );
}

export default Camps;
