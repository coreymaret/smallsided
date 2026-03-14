import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, ChevronRight, Check, Trophy, Mail, User, Shield, CreditCard, Lock } from '../../../../components/Icons/Icons';
import styles from './RegisterLeague.module.scss';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../../../../services/api';
import { useSendEmail } from '../../../../hooks/useSendEmail';
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STRIPE_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#15141a',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

const RegisterLeagueInner: React.FC = () => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { sendEmail } = useSendEmail();
  const validation = useValidation();
  const formatters = useFormFormatters();
  const [cardError, setCardError] = useState<string | null>(null);
  const [stripeFocused, setStripeFocused] = useState({ cardNumber: false, cardExpiry: false, cardCvc: false });

  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '',
    league: '',
    youthGender: '',
    teamName: '',
    captainName: '',
    email: '',
    phone: '',
    playerCount: 10,
    experienceLevel: '',
    preferredDay: '',
    additionalInfo: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const adultLeagues = ['Men', 'Women', 'Coed', 'Over 40', 'Over 50'];
  const youthLeagues = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18'];

  const experienceLevels = [
    { value: 'beginner', label: t('register.pickup.filters.beginner'), description: t('register.leagues.experienceLevels.beginner') },
    { value: 'intermediate', label: t('register.pickup.filters.intermediate'), description: t('register.leagues.experienceLevels.intermediate') },
    { value: 'advanced', label: t('register.pickup.filters.advanced'), description: t('register.leagues.experienceLevels.advanced') }
  ];

  const preferredDays = [
    { value: 'weekday-evening', label: t('register.leagues.days.weekdayEvening'), description: t('register.leagues.days.weekdayEveningDesc') },
    { value: 'friday', label: t('register.leagues.days.friday'), description: t('register.leagues.days.fridayDesc') },
    { value: 'saturday', label: t('register.leagues.days.saturday'), description: t('register.leagues.days.saturdayDesc') },
    { value: 'sunday', label: t('register.leagues.days.sunday'), description: t('register.leagues.days.sundayDesc') }
  ];

  const handleCloseBanner = () => {
    setIsClosing(true);
    setTimeout(() => { setShowSuccessAnimation(false); setIsClosing(false); }, 400);
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category, league: '', youthGender: '' });
  };

  const handleYouthGenderSelect = (gender: string) => {
    setFormData({ ...formData, youthGender: gender, league: '' });
  };

  const handleLeagueSelect = (league: string) => {
    setFormData({ ...formData, league: formData.league === league ? '' : league });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email' && validation.validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.phone);
    setFormData({ ...formData, phone: formatted });
    if (validation.validatePhone(formatted)) {
      const newErrors = { ...validationErrors };
      delete newErrors.phone;
      setValidationErrors(newErrors);
    }
  };

  const handleExperienceSelect = (level: string) => {
    setFormData({ ...formData, experienceLevel: formData.experienceLevel === level ? '' : level });
  };

  const handleDaySelect = (day: string) => {
    setFormData({ ...formData, preferredDay: formData.preferredDay === day ? '' : day });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        if (formData.category === 'Youth') return formData.youthGender !== '' && formData.league !== '';
        return formData.category !== '' && formData.league !== '';
      case 2:
        return formData.teamName !== '' && formData.captainName !== '' &&
               formData.email !== '' && formData.phone !== '';
      case 3: return formData.experienceLevel !== '' && formData.preferredDay !== '';
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const validateStep2Fields = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;
    if (!validation.validateEmail(formData.email)) {
      errors.email = t('register.fieldRental.errors.invalidEmail');
      isValid = false;
    }
    if (!validation.validatePhone(formData.phone)) {
      errors.phone = t('register.fieldRental.errors.invalidPhone');
      isValid = false;
    }
    setValidationErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    setValidationErrors({});
    if (step === 2 && !validateStep2Fields()) return;
    if (canProceed() && step < 5) {
      setCompletedSteps(prev => new Set([...prev, step]));
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxStepReached) setMaxStepReached(nextStep);
      setTimeout(() => {
        const container = document.getElementById('register-container');
        if (container) {
          const y = container.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setTimeout(() => {
        const container = document.getElementById('register-container');
        if (container) {
          const y = container.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep <= maxStepReached) {
      setStep(clickedStep);
      setTimeout(() => {
        const container = document.getElementById('register-container');
        if (container) {
          const y = container.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    const cardNumberEl = elements.getElement(CardNumberElement);
    if (!cardNumberEl) return;

    setIsProcessing(true);
    setCardError(null);

    try {
      const total = 150;
      const MENS_LEAGUE_ID = '639f41d3-0abb-44c9-8e2f-a51fc7aeb185';

      const { clientSecret } = await api.createPaymentIntent(
        total * 100,
        `League Registration - ${formData.teamName}`
      );

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberEl,
          billing_details: { name: formData.captainName, email: formData.email, phone: formData.phone },
        },
      });

      if (stripeError) { setCardError(stripeError.message ?? 'Payment failed.'); return; }
      if (paymentIntent?.status !== 'succeeded') { setCardError('Payment not completed.'); return; }

      const registrationData = {
        league_id: MENS_LEAGUE_ID,
        team_name: formData.teamName,
        team_experience: formData.experienceLevel,
        captain_name: formData.captainName,
        captain_email: formData.email,
        captain_phone: formData.phone,
        age_division: formData.league,
        skill_level: formData.experienceLevel,
        players: [{ name: formData.captainName }],
        total_amount: total,
        stripe_payment_intent_id: paymentIntent.id,
        waiver_signed: true,
        hear_about_us: formData.additionalInfo || undefined,
        additional_notes: undefined,
      };

      const result = await api.createLeagueRegistration(registrationData) as any;
      if (!result || !result.success) throw new Error('Failed to save registration');

      await sendEmail({
        type: 'confirmation',
        booking: {
          id: paymentIntent.id,
          customerName: formData.captainName,
          customerEmail: formData.email,
          service: 'league',
          bookingDate: new Date().toISOString().split('T')[0],
          totalAmount: total,
          metadata: { team_name: formData.teamName, league: formData.league },
        },
      });

      setShowSuccessAnimation(true);
      cardNumberEl.clear();
    } catch (error: any) {
      console.error('Registration error:', error);
      setCardError(error?.message ?? t('register.fieldRental.errors.bookingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const getLeagueDisplayName = () => {
    if (formData.category === 'Youth' && formData.youthGender) {
      return `${formData.youthGender} ${formData.league}`;
    }
    return formData.league;
  };

  return (
    <div className={styles.register}>
      {showSuccessAnimation && (
        <>
          <div
            className={`${styles.bannerBackdrop} ${isClosing ? styles.backdropClosing : ''}`}
            onClick={handleCloseBanner}
          />
          <div
            className={`${styles.successBanner} ${isClosing ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={handleCloseBanner} aria-label="Close notification">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
            <div className={styles.bannerHeader}>
              <div className={styles.bannerIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.bannerText}>
                <h3 className={styles.bannerTitle}>{t('register.leagues.success.title')}</h3>
                <p className={styles.bannerSubtitle}>{t('register.leagues.success.subtitle')}</p>
              </div>
            </div>
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Trophy className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.leagues.success.teamName')}</span>
                    <span className={styles.detailValue}>{formData.teamName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.leagues.success.league')}</span>
                    <span className={styles.detailValue}>{formData.category} - {getLeagueDisplayName()}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <User className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.leagues.success.captain')}</span>
                    <span className={styles.detailValue}>{formData.captainName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.leagues.success.preferredDay')}</span>
                    <span className={styles.detailValue}>{preferredDays.find(d => d.value === formData.preferredDay)?.label}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Shield className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.leagues.success.experienceLevel')}</span>
                    <span className={styles.detailValue}>{experienceLevels.find(e => e.value === formData.experienceLevel)?.label}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.leagues.success.teamSize')}</span>
                    <span className={styles.detailValue}>{formData.playerCount} {t('register.leagues.success.players')}</span>
                  </div>
                </div>
                {formData.additionalInfo && (
                  <div className={styles.detailItem}>
                    <Mail className={styles.detailIcon} size={20} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>{t('register.leagues.success.additionalInfo')}</span>
                      <span className={styles.detailValue}>{formData.additionalInfo}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.emailNotice}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>{t('register.fieldRental.success.emailNotice', { email: formData.email })}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.container} id="register-container">
        <div className={styles.progress}>
          <div className={styles.progressSteps}>
            {[1, 2, 3, 4, 5].map((s) => {
              const isClickable = s <= maxStepReached;
              const isCompleted = completedSteps.has(s) || step > s;
              return (
                <div key={s} onClick={() => isClickable && handleStepClick(s)}
                  className={`${styles.progressStep} ${isClickable ? styles.clickable : ''} ${isCompleted ? styles.completed : ''} ${step === s ? styles.active : ''}`}>
                  <div className={styles.progressCircle}>{isCompleted ? <Check size={16} /> : s}</div>
                  <span className={styles.progressLabel}>
                    {s === 1 && t('register.leagues.steps.league')}
                    {s === 2 && t('register.leagues.steps.teamInfo')}
                    {s === 3 && t('register.leagues.steps.preferences')}
                    {s === 4 && t('register.leagues.steps.review')}
                    {s === 5 && t('register.leagues.steps.payment')}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        <div className={styles.content}>
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.leagues.step1.title')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Users size={20} /></div>
                  {t('register.leagues.step1.chooseCategory')}
                </h3>
                <div className={styles.categoryCards}>
                  <button onClick={() => handleCategorySelect('Adult')} className={`${styles.categoryCard} ${formData.category === 'Adult' ? styles.selected : ''}`}>
                    <div className={styles.categoryTitle}>{t('register.leagues.step1.adultLeagues')}</div>
                    <div className={styles.categorySubtitle}>Men • Women • Coed • Over 40 • Over 50</div>
                  </button>
                  <button onClick={() => handleCategorySelect('Youth')} className={`${styles.categoryCard} ${formData.category === 'Youth' ? styles.selected : ''}`}>
                    <div className={styles.categoryTitle}>{t('register.leagues.step1.youthLeagues')}</div>
                    <div className={styles.categorySubtitle}>U8 • U10 • U12 • U14 • U16 • U18</div>
                  </button>
                </div>
              </div>
              {formData.category === 'Youth' && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}><Users size={20} /></div>
                    {t('register.leagues.step1.chooseGender')}
                  </h3>
                  <div className={styles.genderTabs}>
                    <button onClick={() => handleYouthGenderSelect('Male')} className={`${styles.genderTab} ${formData.youthGender === 'Male' ? styles.selected : ''}`}>{t('register.camps.step2.male')}</button>
                    <button onClick={() => handleYouthGenderSelect('Female')} className={`${styles.genderTab} ${formData.youthGender === 'Female' ? styles.selected : ''}`}>{t('register.camps.step2.female')}</button>
                  </div>
                </div>
              )}
              {formData.category && (formData.category === 'Adult' || formData.youthGender) && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}><Trophy size={20} /></div>
                    {t('register.leagues.step1.chooseDivision')}
                  </h3>
                  <div className={styles.leagueOptions}>
                    {(formData.category === 'Adult' ? adultLeagues : youthLeagues).map((league) => (
                      <button key={league} onClick={() => handleLeagueSelect(league)} className={`${styles.leagueOption} ${formData.league === league ? styles.selected : ''}`}>
                        <Trophy size={24} /><span>{league}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.leagues.steps.teamInfo')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Trophy size={20} /></div>
                  {t('register.leagues.step2.teamDetails')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input type="text" name="teamName" value={formData.teamName} onChange={handleInputChange} placeholder={t('register.leagues.step2.teamName')} className={styles.input} />
                    <label className={`${styles.floatingLabel} ${formData.teamName ? styles.active : ''}`}>{t('register.leagues.step2.teamName')} *</label>
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="text" name="captainName" value={formData.captainName} onChange={handleInputChange} placeholder={t('register.leagues.step2.captainName')} className={styles.input} />
                    <label className={`${styles.floatingLabel} ${formData.captainName ? styles.active : ''}`}>{t('register.leagues.step2.captainName')} *</label>
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('register.contact.email')} className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`} />
                    <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>{t('register.contact.email')} *</label>
                    {validationErrors.email && <span className={styles.errorMessage}>{validationErrors.email}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} placeholder={t('register.contact.phone')} className={`${styles.input} ${validationErrors.phone ? styles.inputError : ''}`} />
                    <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>{t('register.contact.phone')} *</label>
                    {validationErrors.phone && <span className={styles.errorMessage}>{validationErrors.phone}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="number" name="playerCount" value={formData.playerCount} onChange={handleInputChange} placeholder={t('register.leagues.step2.playerCount')} min="8" max="20" className={styles.input} />
                    <label className={`${styles.floatingLabel} ${styles.active}`}>{t('register.leagues.step2.playerCount')}</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.leagues.steps.preferences')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Shield size={20} /></div>
                  {t('register.leagues.step3.experienceLevel')}
                </h3>
                <div className={styles.preferenceCards}>
                  {experienceLevels.map((level) => (
                    <button key={level.value} onClick={() => handleExperienceSelect(level.value)} className={`${styles.preferenceCard} ${formData.experienceLevel === level.value ? styles.selected : ''}`}>
                      <h4>{level.label}</h4><p>{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Calendar size={20} /></div>
                  {t('register.leagues.step3.preferredDay')}
                </h3>
                <div className={styles.preferenceCards}>
                  {preferredDays.map((day) => (
                    <button key={day.value} onClick={() => handleDaySelect(day.value)} className={`${styles.preferenceCard} ${formData.preferredDay === day.value ? styles.selected : ''}`}>
                      <h4>{day.label}</h4><p>{day.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Mail size={20} /></div>
                  {t('register.training.step3.additionalInfo')}
                </h3>
                <div className={styles.inputGroup}>
                  <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} placeholder={t('register.leagues.step3.additionalInfoPlaceholder')} className={styles.textarea} rows={4} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.leagues.step4.title')}</h2>
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>{t('register.leagues.step4.leagueInfo')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Trophy size={18} /></div>
                      <div>
                        <strong>{formData.category} {t('register.leagues.step4.league')}</strong>
                        <span>{getLeagueDisplayName()} {t('register.leagues.step4.division')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <h3>{t('register.leagues.step4.teamDetails')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Users size={18} /></div>
                      <div>
                        <strong>{formData.teamName}</strong>
                        <span>{t('register.leagues.step4.captain')}: {formData.captainName}</span>
                        <span>{formData.playerCount} {t('register.leagues.step4.expectedPlayers')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <h3>{t('register.contact.contactDetails')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Mail size={18} /></div>
                      <div><strong>{formData.email}</strong><span>{formData.phone}</span></div>
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <h3>{t('register.leagues.steps.preferences')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Calendar size={18} /></div>
                      <div>
                        <strong>{experienceLevels.find(e => e.value === formData.experienceLevel)?.label} {t('register.leagues.step4.level')}</strong>
                        <span>{t('register.leagues.step4.preferred')}: {preferredDays.find(d => d.value === formData.preferredDay)?.label}</span>
                      </div>
                    </div>
                  </div>
                  {formData.additionalInfo && (
                    <div className={styles.summarySection}>
                      <h3>{t('register.training.step3.additionalInfo')}</h3>
                      <div className={styles.summaryItem}>
                        <div className={styles.iconCircle}><Mail size={18} /></div>
                        <div><span>{formData.additionalInfo}</span></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.terms}><p>{t('register.leagues.step4.terms')}</p></div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.leagues.steps.payment')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><CreditCard size={20} /></div>
                  {t('register.leagues.step5.registrationFee')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <div className={`${styles.stripeInput} ${stripeFocused.cardNumber ? styles.stripeInputFocused : ''}`}>
                      <CardNumberElement options={STRIPE_STYLE} onFocus={() => setStripeFocused(s => ({...s, cardNumber: true}))} onBlur={() => setStripeFocused(s => ({...s, cardNumber: false}))} />
                    </div>
                    <label className={`${styles.floatingLabel} ${styles.active}`}>{t('register.payment.cardNumber')} *</label>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <div className={`${styles.stripeInput} ${stripeFocused.cardExpiry ? styles.stripeInputFocused : ''}`}>
                        <CardExpiryElement options={STRIPE_STYLE} onFocus={() => setStripeFocused(s => ({...s, cardExpiry: true}))} onBlur={() => setStripeFocused(s => ({...s, cardExpiry: false}))} />
                      </div>
                      <label className={`${styles.floatingLabel} ${styles.active}`}>{t('register.payment.expiry')} *</label>
                    </div>
                    <div className={styles.inputGroup}>
                      <div className={`${styles.stripeInput} ${stripeFocused.cardCvc ? styles.stripeInputFocused : ''}`}>
                        <CardCvcElement options={STRIPE_STYLE} onFocus={() => setStripeFocused(s => ({...s, cardCvc: true}))} onBlur={() => setStripeFocused(s => ({...s, cardCvc: false}))} />
                      </div>
                      <label className={`${styles.floatingLabel} ${styles.active}`}>{t('register.payment.cvv')} *</label>
                    </div>
                  </div>
                  {cardError && <span className={styles.errorMessage}>{cardError}</span>}
                  <div className={styles.securityNotice}>
                    <Lock size={16} />
                    <span>{t('register.payment.securityNotice')}</span>
                  </div>
                </div>
                <div className={styles.total}>
                  <div className={styles.totalRow}>
                    <span>{t('register.leagues.step5.registrationFeeLabel')}</span>
                    <span>$150</span>
                  </div>
                  <div className={styles.totalMain}>
                    <span>{t('register.payment.total')}</span>
                    <strong>$150</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {step > 1 && (
            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleBack}>
              {t('register.nav.back')}
            </button>
          )}
          {step < 5 ? (
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleNext} disabled={!canProceed()}>
              {t('register.nav.continue')}<ChevronRight size={20} />
            </button>
          ) : (
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? t('register.nav.processing') : t('register.nav.confirmBooking')}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const RegisterLeague: React.FC = () => (
  <Elements stripe={stripePromise}>
    <RegisterLeagueInner />
  </Elements>
);

export default RegisterLeague;