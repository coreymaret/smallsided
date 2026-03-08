import styles from "./Leagues.module.scss";
import { useTranslation } from 'react-i18next';
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/SEO/SEO';
import { Trophy } from '../../components/Icons/Icons';
import LeagueTable from '../../components/LeagueTable/LeagueTable';
import RegisterLeague from '../../components/Register/components/RegisterLeague/RegisterLeague';

const Leagues = () => {
  const seo = getSEOConfig('leagues');
  const { t } = useTranslation();

  return (
    <>
      <SEO {...seo} />
      <div className={styles.leaguesPage}>
        <div className={styles.leaguesHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Trophy size={48} />
            </div>
            <h1>{t('leagues.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('leagues.subtitle')}</p>
            <p className={styles.heroDescription}>{t('leagues.description')}</p>
          </div>
        </div>

        <RegisterLeague />
        <LeagueTable />
      </div>
    </>
  );
};

export default Leagues;