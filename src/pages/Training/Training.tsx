import { useState } from 'react';
import { Check } from 'lucide-react';
import styles from "./Training.module.scss";
import pricingStyles from '../../components/PricingSection/PricingSection.module.scss';
import { getSEOConfig } from '../../config/seo';
import SEO from '../../components/Blog/SEO';
import RegisterTraining from '../../components/RegisterTraining/RegisterTraining';

const Training = () => {
  const seo = getSEOConfig('training');
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);

  const tiers = [
    {
      id: 'individual',
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
      id: 'small-group',
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
      id: 'position-specific',
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

  const handleRegisterClick = (tierId: string) => {
    setSelectedTier(tierId);
    setShowRegistration(true);
  };

  return (
    <>
      <SEO {...seo} />
      <div className={styles.trainingPage}>
        {/* Pricing Section */}
        <section className={pricingStyles.pricingSection}>
          <div className={pricingStyles.pricingContainer}>
            <div className={pricingStyles.pricingHeader}>
              <h2>Training Programs</h2>
              <p>Choose the program that fits your development goals</p>
            </div>

            <div className={pricingStyles.pricingTiers}>
              {tiers.map((tier, index) => (
                <div 
                  key={index} 
                  className={`${pricingStyles.pricingTier} ${tier.featured ? pricingStyles.featured : ''}`}
                >
                  {tier.featured && <div className={pricingStyles.featuredBadge}>Most Popular</div>}
                  
                  <div className={pricingStyles.tierHeader}>
                    <h3>{tier.name}</h3>
                    <div className={pricingStyles.price}>
                      <span className={pricingStyles.amount}>{tier.price}</span>
                      <span className={pricingStyles.period}>{tier.period}</span>
                    </div>
                    <p className={pricingStyles.description}>{tier.description}</p>
                  </div>

                  <ul className={pricingStyles.featuresList}>
                    {tier.features.map((feature, idx) => (
                      <li key={idx}>
                        <Check className={pricingStyles.checkIcon} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={pricingStyles.learnMoreBtn}
                    onClick={() => handleRegisterClick(tier.id)}
                    onMouseEnter={() => setHoveredButton(index)}
                    onMouseLeave={() => setHoveredButton(null)}
                    data-hovered={hoveredButton === index}
                  >
                    Register
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Modal */}
        {showRegistration && (
          <div className={styles.modalOverlay} onClick={() => setShowRegistration(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.closeModal}
                onClick={() => setShowRegistration(false)}
                aria-label="Close registration"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
              <RegisterTraining 
                preSelectedType={selectedTier}
                onClose={() => setShowRegistration(false)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Training;
