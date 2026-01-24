import React, { useState } from 'react';
import { Users, Calendar, ChevronRight, Check, Trophy, Mail, User, Shield, CreditCard, Lock } from 'lucide-react';
import styles from './RegisterLeague.module.scss';

const RegisterLeague: React.FC = () => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  
  const [formData, setFormData] = useState<{
    category: string;
    league: string;
    youthGender: string;
    teamName: string;
    captainName: string;
    email: string;
    phone: string;
    playerCount: number;
    experienceLevel: string;
    preferredDay: string;
    additionalInfo: string;
    cardNumber: string;
    cardExpiry: string;
    cardCVV: string;
    billingZip: string;
  }>({
    category: '', // 'Adult' or 'Youth'
    league: '',
    youthGender: '', // 'Male' or 'Female' for youth leagues
    teamName: '',
    captainName: '',
    email: '',
    phone: '',
    playerCount: 10,
    experienceLevel: '',
    preferredDay: '',
    additionalInfo: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    billingZip: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCVV?: string;
    billingZip?: string;
  }>({});

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setIsClosing(false);
    }, 400);
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  const validateCardNumber = (cardNumber: string): boolean => {
    const digitsOnly = cardNumber.replace(/\D/g, '');
    return digitsOnly.length === 16;
  };

  const validateCardExpiry = (expiry: string): boolean => {
    const digitsOnly = expiry.replace(/\D/g, '');
    if (digitsOnly.length !== 4) return false;
    
    const month = parseInt(digitsOnly.slice(0, 2));
    const year = parseInt(digitsOnly.slice(2, 4));
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  const validateZipCode = (zip: string): boolean => {
    const digitsOnly = zip.replace(/\D/g, '');
    return digitsOnly.length === 5;
  };

  const validateCVV = (cvv: string): boolean => {
    const digitsOnly = cvv.replace(/\D/g, '');
    return digitsOnly.length === 3;
  };

  const adultLeagues = ['Men', 'Women', 'Coed', 'Over 40', 'Over 50'];
  const youthLeagues = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18'];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to organized soccer' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience playing' },
    { value: 'advanced', label: 'Advanced', description: 'Competitive experience' }
  ];

  const preferredDays = [
    { value: 'weekday-evening', label: 'Weekday Evenings', description: 'Mon-Thu after 6 PM' },
    { value: 'friday', label: 'Friday Nights', description: 'Friday after 6 PM' },
    { value: 'saturday', label: 'Saturday', description: 'Saturday any time' },
    { value: 'sunday', label: 'Sunday', description: 'Sunday any time' }
  ];

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
    
    if (name === 'email' && validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
    
    if (name === 'cardCVV' && validateCVV(value)) {
      setValidationErrors(prev => ({ ...prev, cardCVV: undefined }));
    }
    
    if (name === 'billingZip' && validateZipCode(value)) {
      setValidationErrors(prev => ({ ...prev, billingZip: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const oldValue = formData.phone;
    const newValue = e.target.value;
    
    if (newValue.length < oldValue.length) {
      let digitsOnly = newValue.replace(/\D/g, '');
      let formatted = digitsOnly;
      if (digitsOnly.length >= 1) {
        if (digitsOnly.length <= 3) {
          formatted = digitsOnly;
        } else if (digitsOnly.length <= 6) {
          formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
        } else {
          formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
        }
      }
      setFormData({ ...formData, phone: formatted });
      if (validatePhone(formatted)) {
        setValidationErrors(prev => ({ ...prev, phone: undefined }));
      }
      return;
    }
    
    let value = newValue.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    let formatted = value;
    if (value.length >= 1) {
      if (value.length <= 3) {
        formatted = value;
      } else if (value.length <= 6) {
        formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`;
      } else {
        formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
      }
    }
    
    setFormData({ ...formData, phone: formatted });
    if (validatePhone(formatted)) {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleExperienceSelect = (level: string) => {
    setFormData({ ...formData, experienceLevel: formData.experienceLevel === level ? '' : level });
  };

  const handleDaySelect = (day: string) => {
    setFormData({ ...formData, preferredDay: formData.preferredDay === day ? '' : day });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length > 16) {
      value = value.slice(0, 16); // Limit to 16 digits
    }
    
    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0, 4)}-`;
      if (value.length > 8) {
        formatted += `${value.slice(4, 8)}-`;
        if (value.length > 12) {
          formatted += `${value.slice(8, 12)}-${value.slice(12)}`;
        } else {
          formatted += value.slice(8);
        }
      } else {
        formatted += value.slice(4);
      }
    }
    
    setFormData({ ...formData, cardNumber: formatted });
    
    // Clear validation error if card number is now valid
    if (validateCardNumber(formatted)) {
      setValidationErrors(prev => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // If user manually types a slash after single digit (e.g., "3/")
    if (input.includes('/')) {
      const parts = input.split('/');
      let month = parts[0].replace(/\D/g, '');
      let year = parts[1] ? parts[1].replace(/\D/g, '') : '';
      
      // Add leading zero to single digit month
      if (month.length === 1) {
        month = '0' + month;
      }
      
      // Limit month to 2 digits and year to 2 digits
      month = month.slice(0, 2);
      year = year.slice(0, 2);
      
      const formatted = year ? `${month}/${year}` : `${month}/`;
      setFormData({ ...formData, cardExpiry: formatted });
      
      // Clear validation error if format is now valid
      if (validateCardExpiry(formatted)) {
        setValidationErrors(prev => ({ ...prev, cardExpiry: undefined }));
      }
      return;
    }
    
    // Normal flow - no slash yet
    let value = input.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length > 4) {
      value = value.slice(0, 4); // Limit to 4 digits (MMYY)
    }
    
    let formatted = value;
    if (value.length >= 3) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`; // Add slash after MM
    }
    
    setFormData({ ...formData, cardExpiry: formatted });
    
    // Clear validation error if format is now valid
    if (validateCardExpiry(formatted)) {
      setValidationErrors(prev => ({ ...prev, cardExpiry: undefined }));
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        if (formData.category === 'Youth') {
          return formData.youthGender !== '' && formData.league !== '';
        }
        return formData.category !== '' && formData.league !== '';
      case 2:
        return formData.teamName !== '' && formData.captainName !== '' && 
               formData.email !== '' && formData.phone !== '';
      case 3:
        return formData.experienceLevel !== '' && formData.preferredDay !== '';
      case 4:
        return true; // Review step - always can proceed
      case 5:
        return formData.cardNumber !== '' && formData.cardExpiry !== '' && 
               formData.cardCVV !== '' && formData.billingZip !== '';
      default:
        return false;
    }
  };

  const validateStep2Fields = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!validatePhone(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const validateStep4Fields = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = 'Card number must be 16 digits';
      isValid = false;
    }

    if (!validateCardExpiry(formData.cardExpiry)) {
      errors.cardExpiry = 'Invalid expiry date (MM/YY)';
      isValid = false;
    }

    if (!validateCVV(formData.cardCVV)) {
      errors.cardCVV = 'CVV must be 3 digits';
      isValid = false;
    }

    if (!validateZipCode(formData.billingZip)) {
      errors.billingZip = 'ZIP code must be 5 digits';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    setValidationErrors({});
    
    if (step === 2 && !validateStep2Fields()) {
      return;
    }
    
    if (step === 5 && !validateStep4Fields()) {
      return;
    }
    
    if (canProceed() && step < 5) {
      setCompletedSteps(prev => new Set([...prev, step]));
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
      
      setTimeout(() => {
        const container = document.getElementById('register-container');
        if (container) {
          const yOffset = -20;
          const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
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
          const yOffset = -20;
          const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
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
          const yOffset = -20;
          const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleSubmit = () => {
    // Validate Step 4 fields before allowing submission
    if (!validateStep4Fields()) {
      return; // Don't submit if validation fails
    }
    
    setShowSuccessAnimation(true);
    console.log('Registration submitted:', formData);
  };

  const getLeagueDisplayName = () => {
    if (formData.category === 'Youth' && formData.youthGender) {
      return `${formData.youthGender} ${formData.league}`;
    }
    return formData.league;
  };

  return (
    <div className={styles.register}>
      {/* Success Banner */}
      {showSuccessAnimation && (
        <>
          <div 
            className={`${styles.bannerBackdrop} ${isClosing ? styles.backdropClosing : ''}`}
            onClick={handleCloseBanner}
          ></div>
          
          <div 
            className={`${styles.successBanner} ${isClosing ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.closeButton}
              onClick={handleCloseBanner}
              aria-label="Close notification"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
            
            <div className={styles.bannerHeader}>
              <div className={styles.bannerIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/>
                  <path 
                    d="M9 12l2 2 4-4"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.bannerText}>
                <h3 className={styles.bannerTitle}>Registration Complete!</h3>
                <p className={styles.bannerSubtitle}>Your team has been successfully registered</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Trophy className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Team Name</span>
                    <span className={styles.detailValue}>{formData.teamName}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>League</span>
                    <span className={styles.detailValue}>{formData.category} - {getLeagueDisplayName()}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <User className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Captain</span>
                    <span className={styles.detailValue}>{formData.captainName}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Calendar className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Preferred Day</span>
                    <span className={styles.detailValue}>
                      {preferredDays.find(d => d.value === formData.preferredDay)?.label}
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Shield className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Experience Level</span>
                    <span className={styles.detailValue}>
                      {experienceLevels.find(e => e.value === formData.experienceLevel)?.label}
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Team Size</span>
                    <span className={styles.detailValue}>{formData.playerCount} players</span>
                  </div>
                </div>
                
                {formData.additionalInfo && (
                  <div className={styles.detailItem}>
                    <Mail className={styles.detailIcon} size={20} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Additional Info</span>
                      <span className={styles.detailValue}>{formData.additionalInfo}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.emailNotice}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>Confirmation email sent to {formData.email}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.registerHeader}>
        <h2 className={styles.registerTitle}>Register Your Team</h2>
        <p className={styles.registerSubtitle}>Join one of our competitive leagues in just a few simple steps</p>
      </div>

      <div className={styles.container} id="register-container">
        {/* Progress Bar */}
        <div className={styles.progress}>
          <div className={styles.progressSteps}>
            {[1, 2, 3, 4, 5].map((s) => {
              const isClickable = s <= maxStepReached;
              const isCompleted = completedSteps.has(s) || step > s;
              return (
                <div
                  key={s}
                  onClick={() => isClickable && handleStepClick(s)}
                  className={`${styles.progressStep} ${isClickable ? styles.clickable : ''} ${isCompleted ? styles.completed : ''} ${step === s ? styles.active : ''}`}
                >
                  <div className={styles.progressCircle}>
                    {isCompleted ? <Check size={16} /> : s}
                  </div>
                  <span className={styles.progressLabel}>
                    {s === 1 && 'League'}
                    {s === 2 && 'Team Info'}
                    {s === 3 && 'Preferences'}
                    {s === 4 && 'Review'}
                    {s === 5 && 'Payment'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <div className={styles.content}>
          {/* Step 1: League Selection */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Select Your League</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Users size={20} />
                  </div>
                  Choose Category
                </h3>
                <div className={styles.categoryCards}>
                  <button
                    onClick={() => handleCategorySelect('Adult')}
                    className={`${styles.categoryCard} ${formData.category === 'Adult' ? styles.selected : ''}`}
                  >
                    <div className={styles.categoryTitle}>Adult Leagues</div>
                    <div className={styles.categorySubtitle}>Men • Women • Coed • Over 40 • Over 50</div>
                  </button>
                  <button
                    onClick={() => handleCategorySelect('Youth')}
                    className={`${styles.categoryCard} ${formData.category === 'Youth' ? styles.selected : ''}`}
                  >
                    <div className={styles.categoryTitle}>Youth Leagues</div>
                    <div className={styles.categorySubtitle}>U8 • U10 • U12 • U14 • U16 • U18</div>
                  </button>
                </div>
              </div>

              {formData.category === 'Youth' && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}>
                      <Users size={20} />
                    </div>
                    Choose Gender
                  </h3>
                  <div className={styles.genderTabs}>
                    <button
                      onClick={() => handleYouthGenderSelect('Male')}
                      className={`${styles.genderTab} ${formData.youthGender === 'Male' ? styles.selected : ''}`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => handleYouthGenderSelect('Female')}
                      className={`${styles.genderTab} ${formData.youthGender === 'Female' ? styles.selected : ''}`}
                    >
                      Female
                    </button>
                  </div>
                </div>
              )}

              {formData.category && (formData.category === 'Adult' || formData.youthGender) && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}>
                      <Trophy size={20} />
                    </div>
                    Choose Your Division
                  </h3>
                  <div className={styles.leagueOptions}>
                    {(formData.category === 'Adult' ? adultLeagues : youthLeagues).map((league) => (
                      <button
                        key={league}
                        onClick={() => handleLeagueSelect(league)}
                        className={`${styles.leagueOption} ${formData.league === league ? styles.selected : ''}`}
                      >
                        <Trophy size={24} />
                        <span>{league}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Team Information */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Team Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Team Details
                </h3>
                
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleInputChange}
                      placeholder="Team Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.teamName ? styles.active : ''}`}>
                      Team Name *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="captainName"
                      value={formData.captainName}
                      onChange={handleInputChange}
                      placeholder="Team Captain Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.captainName ? styles.active : ''}`}>
                      Team Captain Name *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>
                      Email Address *
                    </label>
                    {validationErrors.email && (
                      <span className={styles.errorMessage}>{validationErrors.email}</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Phone Number"
                      className={`${styles.input} ${validationErrors.phone ? styles.inputError : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>
                      Phone Number *
                    </label>
                    {validationErrors.phone && (
                      <span className={styles.errorMessage}>{validationErrors.phone}</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      name="playerCount"
                      value={formData.playerCount}
                      onChange={handleInputChange}
                      placeholder="Number of Players"
                      min="8"
                      max="20"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${styles.active}`}>
                      Expected Number of Players
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Team Preferences</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Shield size={20} />
                  </div>
                  Experience Level
                </h3>
                <div className={styles.preferenceCards}>
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleExperienceSelect(level.value)}
                      className={`${styles.preferenceCard} ${formData.experienceLevel === level.value ? styles.selected : ''}`}
                    >
                      <h4>{level.label}</h4>
                      <p>{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Calendar size={20} />
                  </div>
                  Preferred Game Day
                </h3>
                <div className={styles.preferenceCards}>
                  {preferredDays.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => handleDaySelect(day.value)}
                      className={`${styles.preferenceCard} ${formData.preferredDay === day.value ? styles.selected : ''}`}
                    >
                      <h4>{day.label}</h4>
                      <p>{day.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Mail size={20} />
                  </div>
                  Additional Information (Optional)
                </h3>
                <div className={styles.inputGroup}>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any additional information or special requests..."
                    className={styles.textarea}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Review & Confirm</h2>
              
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>League Information</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Trophy size={18} />
                      </div>
                      <div>
                        <strong>{formData.category} League</strong>
                        <span>{getLeagueDisplayName()} Division</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Team Details</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Users size={18} />
                      </div>
                      <div>
                        <strong>{formData.teamName}</strong>
                        <span>Captain: {formData.captainName}</span>
                        <span>{formData.playerCount} expected players</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Contact Information</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <strong>{formData.email}</strong>
                        <span>{formData.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Preferences</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <strong>
                          {experienceLevels.find(e => e.value === formData.experienceLevel)?.label} Level
                        </strong>
                        <span>
                          Preferred: {preferredDays.find(d => d.value === formData.preferredDay)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.additionalInfo && (
                    <div className={styles.summarySection}>
                      <h3>Additional Information</h3>
                      <div className={styles.summaryItem}>
                        <div className={styles.iconCircle}>
                          <Mail size={18} />
                        </div>
                        <div>
                          <span>{formData.additionalInfo}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.terms}>
                  <p>By proceeding to payment, you agree to our league terms and conditions. You will be contacted within 48 hours regarding team placement and next steps.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Payment Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <CreditCard size={20} />
                  </div>
                  Registration Fee - $150
                </h3>

                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="Card Number"
                      maxLength={19}
                      className={`${styles.input} ${validationErrors.cardNumber ? styles.inputError : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.cardNumber ? styles.active : ''}`}>
                      Card Number *
                    </label>
                    {validationErrors.cardNumber && (
                      <span className={styles.errorMessage}>{validationErrors.cardNumber}</span>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleCardExpiryChange}
                        placeholder="Expiry Date"
                        maxLength={5}
                        className={`${styles.input} ${validationErrors.cardExpiry ? styles.inputError : ''}`}
                      />
                      <label className={`${styles.floatingLabel} ${formData.cardExpiry ? styles.active : ''}`}>
                        Expiry (MM/YY) *
                      </label>
                      {validationErrors.cardExpiry && (
                        <span className={styles.errorMessage}>{validationErrors.cardExpiry}</span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="cardCVV"
                        value={formData.cardCVV}
                        onChange={handleInputChange}
                        placeholder="CVV"
                        maxLength={3}
                        className={`${styles.input} ${validationErrors.cardCVV ? styles.inputError : ''}`}
                      />
                      <label className={`${styles.floatingLabel} ${formData.cardCVV ? styles.active : ''}`}>
                        CVV *
                      </label>
                      {validationErrors.cardCVV && (
                        <span className={styles.errorMessage}>{validationErrors.cardCVV}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="billingZip"
                      value={formData.billingZip}
                      onChange={handleInputChange}
                      placeholder="Billing ZIP Code"
                      maxLength={10}
                      className={`${styles.input} ${validationErrors.billingZip ? styles.inputError : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.billingZip ? styles.active : ''}`}>
                      Billing ZIP Code *
                    </label>
                    {validationErrors.billingZip && (
                      <span className={styles.errorMessage}>{validationErrors.billingZip}</span>
                    )}
                  </div>

                  <div className={styles.securityNotice}>
                    <Lock size={16} />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </div>

                <div className={styles.total}>
                  <div className={styles.totalRow}>
                    <span>Registration Fee</span>
                    <span>$150</span>
                  </div>
                  <div className={styles.totalMain}>
                    <span>Total Amount</span>
                    <strong>$150</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className={styles.actions}>
          {step > 1 && (
            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleBack}>
              Back
            </button>
          )}
          
          {step < 5 ? (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleSubmit}
            >
              Submit Registration
              <Check size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterLeague;