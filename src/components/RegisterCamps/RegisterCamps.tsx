import React, { useState } from 'react';
import { Calendar, Clock, Users, ChevronRight, Check, CreditCard, Lock, Trophy, Zap, Sun } from 'lucide-react';
import styles from './RegisterCamps.module.scss';
import { api } from '../../services/api';

const RegisterCamps: React.FC = () => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    campType: '',
    campDate: '',
    childName: '',
    childAge: '',
    skillLevel: '',
    parentName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    shirtSize: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    billingZip: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
    emergencyPhone?: string;
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

    if (!validatePhone(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Emergency phone must be 10 digits';
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

  const campTypes = [
    {
      id: 'single-day',
      name: 'Single Day Camp',
      price: 75,
      duration: '1 day',
      description: 'Perfect for trying out our camps',
      features: ['9 AM - 3 PM', 'Lunch included', 'Professional coaching', 'Skills & drills']
    },
    {
      id: 'weekend',
      name: 'Weekend Camp',
      price: 140,
      duration: '2 days',
      description: 'Saturday & Sunday intensive training',
      features: ['9 AM - 3 PM both days', 'Lunch included', 'Professional coaching', 'Small-sided games', 'Camp t-shirt']
    },
    {
      id: 'week-long',
      name: 'Week-Long Camp',
      price: 350,
      duration: '5 days',
      description: 'Full week of development',
      features: ['Monday - Friday', '9 AM - 3 PM', 'Lunch included', 'Professional coaching', 'Tournament on Friday', 'Camp t-shirt & medal']
    },
    {
      id: 'holiday',
      name: 'Holiday Camp',
      price: 90,
      duration: '1 day',
      description: 'Special themed holiday camps',
      features: ['9 AM - 3 PM', 'Lunch included', 'Holiday activities', 'Professional coaching', 'Special giveaways']
    }
  ];

  const singleDayCamps = [
    { id: 'sd-1', date: 'February 15, 2026', available: true },
    { id: 'sd-2', date: 'February 22, 2026', available: true },
    { id: 'sd-3', date: 'March 1, 2026', available: false },
    { id: 'sd-4', date: 'March 8, 2026', available: true }
  ];

  const weekendCamps = [
    { id: 'we-1', date: 'February 15-16, 2026', available: true },
    { id: 'we-2', date: 'March 1-2, 2026', available: true },
    { id: 'we-3', date: 'March 15-16, 2026', available: false },
    { id: 'we-4', date: 'March 29-30, 2026', available: true }
  ];

  const weekLongCamps = [
    { id: 'wl-1', date: 'June 8-12, 2026', available: true },
    { id: 'wl-2', date: 'June 15-19, 2026', available: true },
    { id: 'wl-3', date: 'June 22-26, 2026', available: true },
    { id: 'wl-4', date: 'July 6-10, 2026', available: false },
    { id: 'wl-5', date: 'July 13-17, 2026', available: true },
    { id: 'wl-6', date: 'July 20-24, 2026', available: true }
  ];

  const holidayCamps = [
    { id: 'hol-1', date: 'Memorial Day - May 25, 2026', available: true },
    { id: 'hol-2', date: 'Independence Day - July 3, 2026', available: true },
    { id: 'hol-3', date: 'Labor Day - September 7, 2026', available: false },
    { id: 'hol-4', date: 'Thanksgiving - November 25, 2026', available: true }
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to soccer or limited experience' },
    { value: 'intermediate', label: 'Intermediate', description: 'Has played before, knows basics' },
    { value: 'advanced', label: 'Advanced', description: 'Competitive player with strong skills' }
  ];

  const shirtSizes = ['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'];

  const getCampDates = () => {
    switch (formData.campType) {
      case 'single-day':
        return singleDayCamps;
      case 'weekend':
        return weekendCamps;
      case 'week-long':
        return weekLongCamps;
      case 'holiday':
        return holidayCamps;
      default:
        return [];
    }
  };

  const handleCampTypeSelect = (campId: string) => {
    setFormData({ ...formData, campType: formData.campType === campId ? '' : campId, campDate: '' });
  };

  const handleCampDateSelect = (dateId: string) => {
    setFormData({ ...formData, campDate: formData.campDate === dateId ? '' : dateId });
  };

  const handleSkillLevelSelect = (level: string) => {
    setFormData({ ...formData, skillLevel: formData.skillLevel === level ? '' : level });
  };

  const handleShirtSizeSelect = (size: string) => {
    setFormData({ ...formData, shirtSize: formData.shirtSize === size ? '' : size });
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
    const { name } = e.target;
    const oldValue = name === 'phone' ? formData.phone : formData.emergencyPhone;
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
      setFormData({ ...formData, [name]: formatted });
      if (validatePhone(formatted)) {
        setValidationErrors(prev => ({ ...prev, [name]: undefined }));
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
    
    setFormData({ ...formData, [name]: formatted });
    if (validatePhone(formatted)) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
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

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.campType !== '' && formData.campDate !== '';
      case 2:
        return formData.childName !== '' && formData.childAge !== '' && 
               formData.parentName !== '' && formData.email !== '' && 
               formData.phone !== '' && formData.emergencyContact !== '' && 
               formData.emergencyPhone !== '';
      case 3:
        return formData.skillLevel !== '' && formData.shirtSize !== '';
      case 4:
        return true; // Review step
      case 5:
        return formData.cardNumber !== '' && formData.cardExpiry !== '' && 
               formData.cardCVV !== '' && formData.billingZip !== '';
      default:
        return false;
    }
  };

  const calculateTotal = () => {
    const camp = campTypes.find(c => c.id === formData.campType);
    return camp ? camp.price : 0;
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
        const container = document.getElementById('camps-container');
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
        const container = document.getElementById('camps-container');
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
        const container = document.getElementById('camps-container');
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
  if (!validateStep4Fields()) {
    return;
  }
  
  setIsProcessing(true);
  
  try {
    const mockPaymentIntent = { id: 'pi_' + Date.now(), status: 'succeeded' };
    
    const selectedCamp = campTypes.find(c => c.id === formData.campType);
    const selectedDate = getCampDates().find(d => d.id === formData.campDate);
    
    const bookingData = {
      booking_type: 'camp' as const,
      customer_name: formData.parentName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      booking_date: selectedDate?.date || '',
      participants: 1,
      total_amount: calculateTotal(),
      stripe_payment_intent_id: mockPaymentIntent.id,
      metadata: {
        camp_type: selectedCamp?.name,
        child_name: formData.childName,
        child_age: formData.childAge,
        skill_level: formData.skillLevel,
        shirt_size: formData.shirtSize,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        medical_info: formData.medicalInfo,
      },
      special_requests: undefined,
    };
    
    const result: any = await api.createBooking(bookingData);
    
    if (result && result.success) {
      setShowSuccessAnimation(true);
    } else {
      throw new Error('Failed to save booking');
    }
  } catch (error) {
    console.error('Booking error:', error);
    alert(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsProcessing(false);
  }
};

  const getSelectedCamp = () => campTypes.find(c => c.id === formData.campType);
  const getSelectedDate = () => {
    const dates = getCampDates();
    return dates.find(d => d.id === formData.campDate);
  };
  const getSelectedSkillLevel = () => skillLevels.find(s => s.value === formData.skillLevel);

  return (
    <div className={styles.camps}>
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
                <p className={styles.bannerSubtitle}>Your camp spot has been successfully reserved</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Trophy className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Camper</span>
                    <span className={styles.detailValue}>{formData.childName} (Age {formData.childAge})</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Zap className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Camp Type</span>
                    <span className={styles.detailValue}>{getSelectedCamp()?.name}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Calendar className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>{getSelectedDate()?.date}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Clock className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Duration</span>
                    <span className={styles.detailValue}>{getSelectedCamp()?.duration}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Skill Level</span>
                    <span className={styles.detailValue}>{getSelectedSkillLevel()?.label}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>T-Shirt Size</span>
                    <span className={styles.detailValue}>{formData.shirtSize}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Sun className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Total Paid</span>
                    <span className={styles.detailValue}>${calculateTotal()}</span>
                  </div>
                </div>
                
                {formData.medicalInfo && (
                  <div className={styles.detailItem}>
                    <Users className={styles.detailIcon} size={20} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Medical Info</span>
                      <span className={styles.detailValue}>{formData.medicalInfo}</span>
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

      <div className={styles.campsHeader}>
        <h2 className={styles.campsTitle}>Register for Soccer Camp</h2>
        <p className={styles.campsSubtitle}>Develop skills and have fun at our professional soccer camps</p>
      </div>

      <div className={styles.container} id="camps-container">
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
                    {s === 1 && 'Camp'}
                    {s === 2 && 'Info'}
                    {s === 3 && 'Details'}
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
          {/* Step 1: Camp Selection */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Choose Your Camp</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Select Camp Type
                </h3>
                <div className={styles.campTypes}>
                  {campTypes.map((camp) => {
                    const isSelected = formData.campType === camp.id;
                    return (
                      <button
                        key={camp.id}
                        className={`${styles.campTypeCard} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleCampTypeSelect(camp.id)}
                      >
                        <div className={styles.campTypeHeader}>
                          <h4 className={styles.campTypeName}>{camp.name}</h4>
                          <div className={styles.campTypePrice}>${camp.price}</div>
                        </div>
                        <p className={styles.campTypeDuration}>{camp.duration}</p>
                        <p className={styles.campTypeDescription}>{camp.description}</p>
                        <ul className={styles.campTypeFeatures}>
                          {camp.features.map((feature, idx) => (
                            <li key={idx}>
                              <Check size={16} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.campType && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}>
                      <Calendar size={20} />
                    </div>
                    Select Date
                  </h3>
                  <div className={styles.campDates}>
                    {getCampDates().map((date) => {
                      const isSelected = formData.campDate === date.id;
                      return (
                        <button
                          key={date.id}
                          className={`${styles.campDate} ${isSelected ? styles.selected : ''} ${!date.available ? styles.unavailable : ''}`}
                          onClick={() => date.available && handleCampDateSelect(date.id)}
                          disabled={!date.available}
                        >
                          <span className={styles.campDateText}>{date.date}</span>
                          {!date.available && <span className={styles.campDateStatus}>Full</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Camper & Parent Information */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Camper Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Camper Details
                </h3>
                
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      placeholder="Child's Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.childName ? styles.active : ''}`}>
                      Child's Full Name *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleInputChange}
                      placeholder="Child's Age"
                      min="5"
                      max="18"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.childAge ? styles.active : ''}`}>
                      Child's Age *
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Users size={20} />
                  </div>
                  Parent/Guardian Contact
                </h3>
                
                <div className={styles.form}>
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

                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Emergency Contact Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.emergencyContact ? styles.active : ''}`}>
                      Emergency Contact Name *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handlePhoneChange}
                      placeholder="Emergency Phone"
                      className={`${styles.input} ${validationErrors.emergencyPhone ? styles.inputError : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.emergencyPhone ? styles.active : ''}`}>
                      Emergency Phone Number *
                    </label>
                    {validationErrors.emergencyPhone && (
                      <span className={styles.errorMessage}>{validationErrors.emergencyPhone}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Additional Details</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Skill Level
                </h3>
                <div className={styles.skillLevels}>
                  {skillLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleSkillLevelSelect(level.value)}
                      className={`${styles.skillLevel} ${formData.skillLevel === level.value ? styles.selected : ''}`}
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
                    <Users size={20} />
                  </div>
                  T-Shirt Size
                </h3>
                <div className={styles.shirtSizes}>
                  {shirtSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleShirtSizeSelect(size)}
                      className={`${styles.shirtSize} ${formData.shirtSize === size ? styles.selected : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Users size={20} />
                  </div>
                  Medical Information (Optional)
                </h3>
                <div className={styles.inputGroup}>
                  <textarea
                    name="medicalInfo"
                    value={formData.medicalInfo}
                    onChange={handleInputChange}
                    placeholder="Please list any allergies, medications, or medical conditions we should be aware of..."
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
              <h2 className={styles.title}>Review Registration</h2>
              
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>Camp Details</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Trophy size={18} />
                      </div>
                      <div>
                        <strong>{getSelectedCamp()?.name}</strong>
                        <span>{getSelectedDate()?.date}</span>
                        <span>{getSelectedCamp()?.duration} • ${getSelectedCamp()?.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Camper Information</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Users size={18} />
                      </div>
                      <div>
                        <strong>{formData.childName}</strong>
                        <span>Age {formData.childAge} • {getSelectedSkillLevel()?.label} level</span>
                        <span>Shirt size: {formData.shirtSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Contact Information</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Users size={18} />
                      </div>
                      <div>
                        <strong>{formData.parentName}</strong>
                        <span>{formData.email}</span>
                        <span>{formData.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Emergency Contact</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Users size={18} />
                      </div>
                      <div>
                        <strong>{formData.emergencyContact}</strong>
                        <span>{formData.emergencyPhone}</span>
                      </div>
                    </div>
                  </div>

                  {formData.medicalInfo && (
                    <div className={styles.summarySection}>
                      <h3>Medical Information</h3>
                      <div className={styles.summaryItem}>
                        <div className={styles.iconCircle}>
                          <Users size={18} />
                        </div>
                        <div>
                          <span>{formData.medicalInfo}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.terms}>
                  <p>By proceeding to payment, you agree to our camp terms and conditions. Full refunds available up to 7 days before camp starts.</p>
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
                  Complete Registration
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
                    <span>Camp Registration</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <div className={styles.totalMain}>
                    <span>Total Amount</span>
                    <strong>${calculateTotal()}</strong>
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

export default RegisterCamps;