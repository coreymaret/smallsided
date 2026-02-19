// src/pages/Services/Services.tsx

// Styles
import styles from "./Services.module.scss";

// Navigation
import { useNavigate } from 'react-router-dom';

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

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
 * Service card data for the offerings grid.
 * Each entry maps to a dedicated service detail page.
 */
const services = [
  {
    id: 'field-rentals',
    title: 'Field Rentals',
    description: 'Reserve premium turf fields for your team or group. Flexible booking options available.',
    icon: Calendar,
    path: '/services/field-rental',
    color: '#98ED66',
  },
  {
    id: 'leagues',
    title: 'Leagues',
    description: 'Join competitive adult and youth leagues. Multiple divisions and skill levels available.',
    icon: Trophy,
    path: '/services/leagues',
    color: '#98ED66',
  },
  {
    id: 'pickup',
    title: 'Pickup Games',
    description: 'Drop in and play with other soccer enthusiasts. No commitment required.',
    icon: Zap,
    path: '/services/pickup',
    color: '#98ED66',
  },
  {
    id: 'birthday-parties',
    title: 'Birthday Parties',
    description: 'Host an unforgettable soccer-themed birthday party with professional staff and activities.',
    icon: Cake,
    path: '/services/birthday-parties',
    color: '#98ED66',
  },
  {
    id: 'camps',
    title: 'Soccer Camps',
    description: 'Professional coaching camps for all ages and skill levels. Single day to week-long options.',
    icon: Users,
    path: '/services/camps',
    color: '#98ED66',
  },
  {
    id: 'training',
    title: 'Training Programs',
    description: 'Personalized training sessions focused on skill development and technique improvement.',
    icon: Target,
    path: '/services/training',
    color: '#98ED66',
  },
];

/**
 * Services overview page displaying a grid of clickable
 * service cards, each linking to its detail page.
 */
const Services = () => {
  const seo = getSEOConfig('services');
  const navigate = useNavigate();

  const handleServiceClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* SEO meta tags, OG, Twitter, JSON-LD */}
      <SEO {...seo} />

      <div className={styles.servicesPage}>
        <div className={styles.container}>
          {/* Page header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Our Services</h1>
            <p className={styles.subtitle}>
              Discover all the ways Small Sided can help you play, compete, and develop your soccer skills
            </p>
          </div>

          {/* Service offerings grid */}
          <div className={styles.serviceGrid}>
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  className={styles.serviceCard}
                  onClick={() => handleServiceClick(service.path)}
                >
                  <div className={styles.iconWrapper}>
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