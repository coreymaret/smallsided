import { useTranslation } from 'react-i18next';
import styles from "./FeaturesSection.module.scss";
import { Trophy, Target, Users, Lightbulb, TrendingUp, Award, ArrowDownRight } from '../../components/Icons/Icons';

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Trophy,
      heading: t('about.features.championship.heading'),
      subheading: t('about.features.championship.subheading'),
      items: t('about.features.championship.items', { returnObjects: true }) as string[],
    },
    {
      icon: Target,
      heading: t('about.features.precision.heading'),
      subheading: t('about.features.precision.subheading'),
      items: t('about.features.precision.items', { returnObjects: true }) as string[],
    },
    {
      icon: Users,
      heading: t('about.features.teamChemistry.heading'),
      subheading: t('about.features.teamChemistry.subheading'),
      items: t('about.features.teamChemistry.items', { returnObjects: true }) as string[],
    },
    {
      icon: Lightbulb,
      heading: t('about.features.tactical.heading'),
      subheading: t('about.features.tactical.subheading'),
      items: t('about.features.tactical.items', { returnObjects: true }) as string[],
    },
    {
      icon: TrendingUp,
      heading: t('about.features.growth.heading'),
      subheading: t('about.features.growth.subheading'),
      items: t('about.features.growth.items', { returnObjects: true }) as string[],
    },
    {
      icon: Award,
      heading: t('about.features.elite.heading'),
      subheading: t('about.features.elite.subheading'),
      items: t('about.features.elite.items', { returnObjects: true }) as string[],
    },
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.heading} className={styles.featureItem}>
              <div className={styles.featureIconWrapper}>
                <Icon className={styles.featureIcon} size={32} />
              </div>
              <h3 className={styles.featureHeading}>{feature.heading}</h3>
              <p className={styles.featureSubheading}>{feature.subheading}</p>
              <ul className={styles.featureList}>
                {feature.items.map((item) => (
                  <li key={item}><ArrowDownRight size={16} /> {item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;