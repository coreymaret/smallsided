import styles from "./Camps.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import Register from '../../components/Register/Register';
import { campsConfig } from '../../components/Register/configs';

const Camps = () => {
  const seo = getSEOConfig('camps');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.campsPage}>
        <Register config={campsConfig} />
      </div>
    </>
  );
}

export default Camps;