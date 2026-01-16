import { useState } from 'react';
import { Check } from 'lucide-react';
import styles from './PricingSection.module.scss';

const PricingSection = () => {
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);

  const tiers = [
    {
      name: 'Starter',
      price: '$299',
      period: 'per month',
      description: 'Perfect for recreational programs getting started',
      features: [
        'Weekly training sessions',
        'Small-sided games (7v7)',
        'Basic skill development',
        'Parent coaching resources',
        'Monthly progress reports'
      ]
    },
    {
      name: 'Elite',
      price: '$499',
      period: 'per month',
      description: 'Advanced development for competitive players',
      features: [
        'Bi-weekly training sessions',
        'Multiple game formats (5v5, 7v7)',
        'Advanced tactical training',
        'Video analysis sessions',
        'Individual development plans',
        'Tournament preparation'
      ],
      featured: true
    },
    {
      name: 'Academy',
      price: '$799',
      period: 'per month',
      description: 'Complete program for serious youth development',
      features: [
        'Daily training opportunities',
        'All small-sided formats',
        'Elite coaching staff',
        'Full video analysis suite',
        'Personalized training programs',
        'College prep resources',
        'Year-round tournament schedule'
      ]
    }
  ];

  return (
    <section className={styles.pricingSection}>
      <div className={styles.pricingContainer}>
        <div className={styles.pricingHeader}>
          <h2>Training Programs</h2>
          <p>Choose the program that fits your development goals</p>
        </div>

        <div className={styles.pricingTiers}>
          {tiers.map((tier, index) => (
            <div 
              key={index} 
              className={`${styles.pricingTier} ${tier.featured ? styles.featured : ''}`}
            >
              {tier.featured && <div className={styles.featuredBadge}>Most Popular</div>}
              
              <div className={styles.tierHeader}>
                <h3>{tier.name}</h3>
                <div className={styles.price}>
                  <span className={styles.amount}>{tier.price}</span>
                  <span className={styles.period}>{tier.period}</span>
                </div>
                <p className={styles.description}>{tier.description}</p>
              </div>

              <ul className={styles.featuresList}>
                {tier.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={styles.learnMoreBtn}
                onMouseEnter={() => setHoveredButton(index)}
                onMouseLeave={() => setHoveredButton(null)}
                data-hovered={hoveredButton === index}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;