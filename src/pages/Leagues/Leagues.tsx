import styles from "./Leagues.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import LeagueTable from '../../components/LeagueTable/LeagueTable';
import RegisterLeague from '../../components/RegisterLeague/RegisterLeague';



const Leagues = () => {
  const seo = getSEOConfig('fieldRental');
  return (
    <>
    <SEO {...seo} />
    <div className={styles.leaguesPage}>
      <RegisterLeague />
      <LeagueTable />
    </div>
    </>
  );
}

export default Leagues;
