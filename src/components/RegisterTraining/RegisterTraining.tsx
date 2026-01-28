import React, { useState } from 'react';
import { Users, Calendar, ChevronRight, Check, Trophy, Mail, User, Shield, CreditCard, Lock, Target } from 'lucide-react';
import styles from './RegisterTraining.module.scss';
import { api } from '../../services/api';

const RegisterTraining: React.FC = () => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState<{
    trainingType: string;
    playerName: string;
    playerAge: string;
    parentName: string;
    email: string;
    phone: string;
    skillLevel: string;
    focusAreas: string[];
    preferredDays: string[];
    preferredTime: string;
    additionalInfo: string;
    cardNumber: string;
    cardExpiry: string;
    cardCVV: string;
    billingZip: string;
  }>({
    trainingType: '',
    playerName: '',
    playerAge: '',
    parentName: '',
    email: '',
    phone: '',
    skillLevel: '',
    focusAreas: [],
    preferredDays: [],
    preferredTime: '',
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

  const trainingTypes = [
    { 
      value: 'individual', 
      label: 'Individual Training',
      description: '1-on-1 personalized sessions',
      price: '$75/session'
    },
    { 
      value: 'small-group', 
      label: 'Small Group Training',
      description: 'Groups of 2-4 players',
      price: '$50/session'
    },
    { 
      value: 'position-specific', 
      label: 'Position-Specific',
      description: 'Goalkeeper, striker, defender training',
      price: '$60/session'
    }
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to soccer' },
    { value: 'intermediate', label: 'Intermediate', description: 'Playing for 1-2 years' },
    { value: 'advanced', label: 'Advanced', description: 'Competitive experience' }
  ];

  const focusAreasOptions = [
    { value: 'ball-control', label: 'Ball Control', icon: Target },
    { value: 'shooting', label: 'Shooting', icon: Target },
    { value: 'passing', label: 'Passing', icon: Target },
    { value: 'dribbling', label: 'Dribbling', icon: Target },
    { value: 'defense', label: 'Defense', icon: Shield },
    { value: 'fitness', label: 'Fitness', icon: Trophy }
  ];

  const preferredDaysOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning', description: '8AM - 12PM' },
    { value: 'afternoon', label: 'Afternoon', description: '12PM - 5PM' },
    { value: 'evening', label: 'Evening', description: '5PM - 8PM' }
  ];

  const handleTrainingTypeSelect = (type: string) => {
    setFormData({ ...formData, trainingType: formData.trainingType === type ? '' : type });
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

  const handleSkillLevelSelect = (level: string) => {
    setFormData({ ...formData, skillLevel: formData.skillLevel === level ? '' : level });
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const handleTimeSlotSelect = (time: string) => {
    setFormData({ ...formData, preferredTime: formData.preferredTime === time ? '' : time });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 16) {
      value = value.slice(0, 16);
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
    
    if (validateCardNumber(formatted)) {
      setValidationErrors(prev => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    if (input.includes('/')) {
      const parts = input.split('/');
      let month = parts[0].replace(/\D/g, '');
      let year = parts[1] ? parts[1].replace(/\D/g, '') : '';
      
      if (month.length === 1) {
        month = '0' + month;
      }
      
      month = month.slice(0, 2);
      year = year.slice(0, 2);
      
      const formatted = year ? `${month}/${year}` : `${month}/`;
      setFormData({ ...formData, cardExpiry: formatted });
      
      if (validateCardExpiry(formatted)) {
        setValidationErrors(prev => ({ ...prev, cardExpiry: undefined }));
      }
      return;
    }
    
    let value = input.replace(/\D/g, '');
    
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    let formatted = value;
    if (value.length >= 3) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    
    setFormData({ ...formData, cardExpiry: formatted });
    
    if (validateCardExpiry(formatted)) {
      setValidationErrors(prev => ({ ...prev, cardExpiry: undefined }));
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return formData.trainingType !== '';
      case 2:
        return formData.playerName !== '' && formData.playerAge !== '' &&
               formData.parentName !== '' && formData.email !== '' && formData.phone !== '';
      case 3:
        return formData.skillLevel !== '' && formData.focusAreas.length > 0 &&
               formData.preferredDays.length > 0 && formData.preferredTime !== '';
      case 4:
        return true;
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

  const validateStep5Fields = (): boolean => {
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
    
    if (step === 5 && !validateStep5Fields()) {
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

  const handleSubmit = async () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (!validateStep5Fields()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const mockPaymentIntent = { id: 'pi_' + Date.now(), status: 'succeeded' };
      
      const trainingData = {
        training_type: formData.trainingType,
        player_name: formData.playerName,
        player_age: parseInt(formData.playerAge),
        parent_name: formData.parentName,
        parent_email: formData.email,
        parent_phone: formData.phone,
        skill_level: formData.skillLevel,
        focus_areas: formData.focusAreas,
        preferred_days: formData.preferredDays,
        preferred_time: formData.preferredTime,
        additional_info: formData.additionalInfo || null,
        stripe_payment_intent_id: mockPaymentIntent.id,
        total_amount: 75,
      };
      
      // @ts-ignore
      const result: any = await api.createTrainingRegistration(trainingData);
      
      if (result && result.success) {
        setShowSuccessAnimation(true);
      } else {
        throw new Error('Failed to save registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTrainingTypeDetails = () => {
    return trainingTypes.find(t => t.value === formData.trainingType);
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
                <p className={styles.bannerSubtitle}>Training session has been successfully registered</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Trophy className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Training Type</span>
                    <span className={styles.detailValue}>{getTrainingTypeDetails()?.label}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <User className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Player</span>
                    <span className={styles.detailValue}>{formData.playerName} ({formData.playerAge} years old)</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Shield className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Skill Level</span>
                    <span className={styles.detailValue}>
                      {skillLevels.find(s => s.value === formData.skillLevel)?.label}
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Target className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Focus Areas</span>
                    <span className={styles.detailValue}>
                      {formData.focusAreas.map(area => 
                        focusAreasOptions.find(a => a.value === area)?.label
                      ).join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Calendar className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Preferred Days</span>
                    <span className={styles.detailValue}>
                      {formData.preferredDays.map(day => 
                        preferredDaysOptions.find(d => d.value === day)?.label
                      ).join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Parent/Guardian</span>
                    <span className={styles.detailValue}>{formData.parentName}</span>
                  </div>
                </div>
                
                {formData.additionalInfo && (
                  <div className={styles.detailItem}>
                    <Mail className={styles.detailIcon} size={20} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Additional Comments</span>
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
        <h2 className={styles.registerTitle}>Register for Training</h2>
        <p className={styles.registerSubtitle}>Get personalized soccer training tailored to your development goals</p>
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
                    {s === 1 && 'Training Type'}
                    {s === 2 && 'Player Info'}
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
          {/* Step 1: Training Type Selection */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Select Training Type</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Choose Your Training Format
                </h3>
                <div className={styles.trainingTypeCards}>
                  {trainingTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleTrainingTypeSelect(type.value)}
                      className={`${styles.trainingTypeCard} ${formData.trainingType === type.value ? styles.selected : ''}`}
                    >
                      <div className={styles.trainingTypeHeader}>
                        <h4>{type.label}</h4>
                        <span className={styles.price}>{type.price}</span>
                      </div>
                      <p>{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Player Information */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Player Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <User size={20} />
                  </div>
                  Player Details
                </h3>
                
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="playerName"
                      value={formData.playerName}
                      onChange={handleInputChange}
                      placeholder="Player Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.playerName ? styles.active : ''}`}>
                      Player Name *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      name="playerAge"
                      value={formData.playerAge}
                      onChange={handleInputChange}
                      placeholder="Player Age"
                      min="5"
                      max="18"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.playerAge ? styles.active : ''}`}>
                      Player Age *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      placeholder="Parent/Guardian Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.parentName ? styles.active : ''}`}>
                      Parent/Guardian Name *
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
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Training Preferences */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Training Preferences</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Shield size={20} />
                  </div>
                  Skill Level
                </h3>
                <div className={styles.preferenceCards}>
                  {skillLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleSkillLevelSelect(level.value)}
                      className={`${styles.preferenceCard} ${formData.skillLevel === level.value ? styles.selected : ''}`}
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
                    <Target size={20} />
                  </div>
                  Focus Areas (Select all that apply)
                </h3>
                <div className={styles.focusAreas}>
                  {focusAreasOptions.map((area) => (
                    <button
                      key={area.value}
                      onClick={() => handleFocusAreaToggle(area.value)}
                      className={`${styles.focusAreaChip} ${formData.focusAreas.includes(area.value) ? styles.selected : ''}`}
                    >
                      <area.icon size={18} />
                      <span>{area.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Calendar size={20} />
                  </div>
                  Preferred Days (Select all that apply)
                </h3>
                <div className={styles.daysGrid}>
                  {preferredDaysOptions.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => handleDayToggle(day.value)}
                      className={`${styles.dayChip} ${formData.preferredDays.includes(day.value) ? styles.selected : ''}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Calendar size={20} />
                  </div>
                  Preferred Time Slot
                </h3>
                <div className={styles.preferenceCards}>
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => handleTimeSlotSelect(slot.value)}
                      className={`${styles.preferenceCard} ${formData.preferredTime === slot.value ? styles.selected : ''}`}
                    >
                      <h4>{slot.label}</h4>
                      <p>{slot.description}</p>
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
                    placeholder="Any specific goals, concerns, or information we should know..."
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
                    <h3>Training Information</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Trophy size={18} />
                      </div>
                      <div>
                        <strong>{getTrainingTypeDetails()?.label}</strong>
                        <span>{getTrainingTypeDetails()?.description}</span>
                        <span>{getTrainingTypeDetails()?.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Player Details</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <User size={18} />
                      </div>
                      <div>
                        <strong>{formData.playerName}</strong>
                        <span>Age: {formData.playerAge} years old</span>
                        <span>Parent/Guardian: {formData.parentName}</span>
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
                    <h3>Training Preferences</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Shield size={18} />
                      </div>
                      <div>
                        <strong>
                          {skillLevels.find(s => s.value === formData.skillLevel)?.label} Level
                        </strong>
                        <span>
                          Focus: {formData.focusAreas.map(area => 
                            focusAreasOptions.find(a => a.value === area)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Schedule Preferences</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <strong>
                          {timeSlots.find(t => t.value === formData.preferredTime)?.label}
                        </strong>
                        <span>
                          Days: {formData.preferredDays.map(day => 
                            preferredDaysOptions.find(d => d.value === day)?.label
                          ).join(', ')}
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
                  <p>By proceeding to payment, you agree to our training terms and conditions. We will contact you within 24 hours to schedule your first training session.</p>
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
                  Training Fee - {getTrainingTypeDetails()?.price}
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
                    <span>Training Session</span>
                    <span>$75</span>
                  </div>
                  <div className={styles.totalMain}>
                    <span>Total Amount</span>
                    <strong>$75</strong>
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
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Registration'}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterTraining;