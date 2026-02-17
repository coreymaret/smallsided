import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import Register from '../../components/Register/Register';
import { trainingConfig } from '../../components/Register/configs';

const Training = () => {
  const seo = getSEOConfig('training');

  return (
    <>
      <SEO {...seo} />
      <div>
        <Register config={trainingConfig} />
      </div>
    </>
  );
}

export default Training;