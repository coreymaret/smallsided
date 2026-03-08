// src/pages/Services/Services.tsx

// Styles
import styles from "./Services.module.scss";

// Navigation
import { useNavigate } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Context
import { useLanguage } from '../../contexts/LanguageContext';
import { routePairs } from '../../constants/routePairs';

// Icons
import {
  Calendar,
  Users,
  Zap,
  Cake,
  Trophy,
  Target,
  ArrowDownRight,
} from '../../components/Icons/Icons';

/**
 * Services overview page displaying a grid of clickable
 * service cards, each linking to its detail page.
 */
const Services = () => {
  const seo = getSEOConfig('services');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSpanish } = useLanguage();

  const lp = (enPath: string) => isSpanish ? (routePairs[enPath] ?? enPath) : enPath;

  const services = [
    {
      id: 'field-rentals',
      title: t('services.fieldRentals.title'),
      description: t('services.page.fieldRentals.description'),
      icon: Calendar,
      path: '/services/field-rental',
    },
    {
      id: 'leagues',
      title: t('services.leagues.title'),
      description: t('services.page.leagues.description'),
      icon: Trophy,
      path: '/services/leagues',
    },
    {
      id: 'pickup',
      title: t('services.page.pickup.title'),
      description: t('services.page.pickup.description'),
      icon: Zap,
      path: '/services/pickup',
    },
    {
      id: 'birthday-parties',
      title: t('services.birthdayParties.title'),
      description: t('services.page.birthdayParties.description'),
      icon: Cake,
      path: '/services/birthday-parties',
    },
    {
      id: 'camps',
      title: t('services.page.camps.title'),
      description: t('services.page.camps.description'),
      icon: Users,
      path: '/services/camps',
    },
    {
      id: 'training',
      title: t('services.page.training.title'),
      description: t('services.page.training.description'),
      icon: Target,
      path: '/services/training',
    },
  ];

  const handleServiceClick = (path: string) => {
    navigate(lp(path));
  };

  return (
    <>
      {/* SEO meta tags, OG, Twitter, JSON-LD */}
      <SEO {...seo} />

      <div className={styles.servicesPage}>
        <div className={styles.servicesHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <Zap size={48} />
            </div>
            <h1>{t('services.page.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('services.page.subtitle')}</p>
            <p className={styles.heroDescription}>{t('services.page.description')}</p>
          </div>
        </div>

        {/* Service offerings grid */}
        <div className={styles.serviceContent}>
          <div className={styles.serviceGrid}>
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  className={styles.serviceCard}
                  onClick={() => handleServiceClick(service.path)}
                >
                  <div className={styles.cardIconWrapper}>
                    <Icon size={32} className={styles.icon} />
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <div className={styles.cardArrow}>
                    <ArrowDownRight size={20} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;