import styles from "./Leagues.module.scss";
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Trophy } from '../../components/Icons/Icons';
import LeagueTable from '../../components/LeagueTable/LeagueTable';
import RegisterLeague from '../../components/Register/components/RegisterLeague/RegisterLeague';

const Leagues = () => {
  const seo = getSEOConfig('leagues');
  return (
    <>
      <SEO {...seo} />
      <div className={styles.leaguesPage}>
        <div className={styles.leaguesHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Trophy size={48} />
            </div>
            <h1>Register Your Team</h1>
            <p className={styles.heroSubtitle}>Competitive & Recreational Leagues</p>
            <p className={styles.heroDescription}>
              Join one of our competitive leagues in just a few simple steps
            </p>
          </div>
        </div>

        <RegisterLeague />
        <LeagueTable />
      </div>
    </>
  );
};

export default Leagues;