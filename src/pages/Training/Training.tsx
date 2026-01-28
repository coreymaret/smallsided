import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import RegisterTraining from '../../components/RegisterTraining/RegisterTraining';

const Training = () => {
  const seo = getSEOConfig('training');

  return (
    <>
      <SEO {...seo} />
      <div>
        <RegisterTraining />
      </div>
    </>
  );
}

export default Training;