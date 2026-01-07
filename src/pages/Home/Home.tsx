import styles from "./Home.module.scss";
import Popup from '../../components/Popup/Popup'
import SEO from '../../components/Blog/SEO';
import { getSEOConfig } from '../../config/seo';

const Home = () => {
  const seo = getSEOConfig('home');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.homePage}>
      <section className={styles.homeSection}>
        <h1>Welcome to GreenTech Insights</h1>
        <h2>Innovating for a Sustainable Tomorrow</h2>
        <p>
          GreenTech Insights is your go-to source for the latest in sustainable
          technology and environmental innovation. From cutting-edge renewable
          energy solutions to eco-friendly lifestyle tips, our mission is to
          empower individuals and businesses to make a positive impact on the
          planet.
        </p>
        <h2>Harnessing Renewable Energy</h2>
        <p>
          Renewable energy is no longer a future concept—it’s happening now.
          Solar, wind, and hydro technologies are transforming how we power our
          cities and homes. At GreenTech Insights, we cover the most recent
          breakthroughs, case studies, and practical guides to help you implement
          sustainable energy solutions in your life or business.
        </p>

        <h2>Smart Eco-Friendly Technologies</h2>
        <p>
          From smart home devices that reduce energy waste to sustainable
          transportation innovations, technology is driving the green
          revolution. Our expert team analyzes emerging trends, compares
          products, and provides actionable insights so you can make informed
          choices that benefit both you and the planet.
        </p>
        <h2>Community & Impact</h2>
        <p>
          Change happens when people come together. GreenTech Insights highlights
          stories of communities, startups, and organizations making a real
          difference. Learn how individuals worldwide are reducing carbon
          footprints, adopting circular economy principles, and building a
          healthier, greener future.
        </p>

        <h2>Join the Movement</h2>
        <p>
          Stay connected and informed. Subscribe to our newsletter for exclusive
          updates, tutorials, and inspiring stories. Together, we can create a
          sustainable tomorrow—one innovation at a time.
        </p>
      </section>
      <Popup />
    </div>
    </>
  );
};

export default Home;
