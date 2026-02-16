import styles from "./Leagues.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import LeagueTable from '../../components/LeagueTable/LeagueTable';
import Register from '../../components/Register/Register';
import { leagueConfig } from '../../components/Register/configs';

const Leagues = () => {
  const seo = getSEOConfig('fieldRental');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.leaguesPage}>
        <Register config={leagueConfig} />
        <LeagueTable />
      </div>
    </>
  );
}

export default Leagues;