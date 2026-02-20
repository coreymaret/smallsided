import React, { useState } from 'react';
import { Users, Calendar, ChevronRight, Check, Trophy, Mail, User, Shield, CreditCard, Lock, Target } from '../../../../components/Icons/Icons';
import styles from './RegisterTraining.module.scss';
import { api } from '../../../../services/api';

// Shared hooks for validation and formatting
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';

const RegisterTraining: React.FC = () => {
  // Use shared validation and formatting hooks
  const validation = useValidation();
  const formatters = useFormFormatters();
  
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

  // Removed 40 lines of duplicate validation code - now using shared hooks

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

  const handleSkillLevelSelect = (level: string) => {
    setFormData({ ...formData, skillLevel: formData.skillLevel === level ? '' : level });
  };

  const handleTimeSlotSelect = (time: string) => {
    setFormData({ ...formData, preferredTime: formData.preferredTime === time ? '' : time });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'email' && validation.validateEmail(value)) {
      const newErrors = { ...validationErrors };
      delete newErrors.email;
      setValidationErrors(newErrors);
    }
    
    if (name === 'cardCVV' && validation.validateCVV(value)) {
      const newErrors = { ...validationErrors };
      delete newErrors.cardCVV;
      setValidationErrors(newErrors);
    }
    
    if (name === 'billingZip' && validation.validateZipCode(value)) {
      const newErrors = { ...validationErrors };
      delete newErrors.billingZip;
      setValidationErrors(newErrors);
    }
  };

  // Using shared formatters for phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.phone);
    setFormData({ ...formData, phone: formatted });
    
    if (validation.validatePhone(formatted)) {
      const newErrors = { ...validationErrors };
      delete newErrors.phone;
      setValidationErrors(newErrors);
    }
  };

  // Using shared formatters for card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });
    
    if (validation.validateCardNumber(formatted)) {
      const newErrors = { ...validationErrors };
      delete newErrors.cardNumber;
      setValidationErrors(newErrors);
    }
  };

  // Using shared formatters for card expiry
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatCardExpiry(e.target.value);
    setFormData({ ...formData, cardExpiry: formatted });
    
    if (validation.validateCardExpiry(formatted)) {
      const newErrors = { ...validationErrors };
      delete newErrors.cardExpiry;
      setValidationErrors(newErrors);
    }
  };

  const handleFocusAreaToggle = (area: string) => {
    const newFocusAreas = formData.focusAreas.includes(area)
      ? formData.focusAreas.filter(a => a !== area)
      : [...formData.focusAreas, area];
    setFormData({ ...formData, focusAreas: newFocusAreas });
  };

  const handleDayToggle = (day: string) => {
    const newDays = formData.preferredDays.includes(day)
      ? formData.preferredDays.filter(d => d !== day)
      : [...formData.preferredDays, day];
    setFormData({ ...formData, preferredDays: newDays });
  };

  const validateStep3Fields = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!validation.validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!validation.validatePhone(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const validateStep5Fields = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!validation.validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = 'Card number must be 16 digits';
      isValid = false;
    }

    if (!validation.validateCardExpiry(formData.cardExpiry)) {
      errors.cardExpiry = 'Invalid expiry date (MM/YY)';
      isValid = false;
    }

    if (!validation.validateCVV(formData.cardCVV)) {
      errors.cardCVV = 'CVV must be 3 digits';
      isValid = false;
    }

    if (!validation.validateZipCode(formData.billingZip)) {
      errors.billingZip = 'ZIP code must be 5 digits';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const canProceed = (): boolean => {
    switch(step) {
      case 1:
        return formData.trainingType !== '';
      case 2:
        return formData.playerName !== '' && formData.skillLevel !== '' && formData.focusAreas.length > 0;
      case 3:
        return formData.parentName !== '' && formData.email !== '' && formData.phone !== '' && 
               formData.preferredDays.length > 0 && formData.preferredTime !== '';
      case 4:
        return true;
      case 5:
        return formData.cardNumber !== '' && formData.cardExpiry !== '' && formData.cardCVV !== '' && formData.billingZip !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && !validateStep3Fields()) {
      return;
    }
    
    if (step === 5 && !validateStep5Fields()) {
      return;
    }

    if (!canProceed()) return;

    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(step);
    setCompletedSteps(newCompletedSteps);

    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep <= maxStepReached) {
      setStep(clickedStep);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep5Fields()) return;

    setIsProcessing(true);

    try {
      const selectedTraining = trainingTypes.find(t => t.value === formData.trainingType);
      
      // @ts-ignore - API method may not exist yet
      await api.registerTraining({
        training: selectedTraining,
        player: {
          name: formData.playerName,
          age: formData.playerAge,
          skillLevel: formData.skillLevel,
        },
        parent: {
          name: formData.parentName,
          email: formData.email,
          phone: formData.phone,
        },
        preferences: {
          focusAreas: formData.focusAreas,
          preferredDays: formData.preferredDays,
          preferredTime: formData.preferredTime,
          additionalInfo: formData.additionalInfo,
        },
        payment: {
          cardNumber: formData.cardNumber,
          cardExpiry: formData.cardExpiry,
          cardCVV: formData.cardCVV,
          billingZip: formData.billingZip,
        }
      });

      setShowSuccessAnimation(true);
      
      setFormData({
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
      
      setStep(1);
      setCompletedSteps(new Set());
      setMaxStepReached(1);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to complete registration. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedTraining = () => trainingTypes.find(t => t.value === formData.trainingType);
  const getSelectedSkill = () => skillLevels.find(s => s.value === formData.skillLevel);
  const getSelectedTime = () => timeSlots.find(t => t.value === formData.preferredTime);

  const getProgressPercentage = () => {
    return ((step - 1) / 4) * 100;
  };

  return (
    <div className={styles.register}>
      {/* Success Banner */}
      {showSuccessAnimation && (
        <>
          <div 
            className={`${styles.bannerBackdrop} ${isClosing ? styles.backdropClosing : ''}`}
            onClick={handleCloseBanner}
          />
          <div className={`${styles.successBanner} ${isClosing ? styles.closing : ''}`}>
            <button className={styles.closeButton} onClick={handleCloseBanner}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            
            <div className={styles.bannerHeader}>
              <div className={styles.bannerIcon}>
                <Check size={32} strokeWidth={3} color="#15141a" />
              </div>
              <div className={styles.bannerText}>
                <h2 className={styles.bannerTitle}>Registration Complete!</h2>
                <p className={styles.bannerSubtitle}>Training session scheduled successfully</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Trophy size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Player</span>
                    <span className={styles.detailValue}>{formData.playerName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Target size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Training Type</span>
                    <span className={styles.detailValue}>{getSelectedTraining()?.label}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Preferred Time</span>
                    <span className={styles.detailValue}>{getSelectedTime()?.label}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.emailNotice}>
              <Mail size={16} />
              <span>Confirmation email sent to {formData.email}</span>
            </div>
          </div>
        </>
      )}

      <div className={styles.registerHeader}>
        <h1 className={styles.registerTitle}>Training Program Registration</h1>
        <p className={styles.registerSubtitle}>Personalized soccer training to elevate your game</p>
      </div>

      <div className={styles.container}>
        {/* Progress Bar */}
        <div className={styles.progress}>
          <div className={styles.progressSteps}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`${styles.progressStep} ${s === step ? styles.active : ''} ${
                  completedSteps.has(s) ? styles.completed : ''
                } ${s <= maxStepReached ? styles.clickable : ''}`}
                onClick={() => handleStepClick(s)}
              >
                <div className={styles.progressCircle}>
                  {completedSteps.has(s) ? <Check size={16} /> : s}
                </div>
                <span className={styles.progressLabel}>
                  {s === 1 && 'Program'}
                  {s === 2 && 'Player Info'}
                  {s === 3 && 'Preferences'}
                  {s === 4 && 'Review'}
                  {s === 5 && 'Payment'}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className={styles.content}>
          {/* Step 1: Select Training Type */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Select Training Program</h2>
              
              <div className={styles.section}>
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
                  Basic Information
                </h3>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="playerName"
                        value={formData.playerName}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder=" "
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
                        className={styles.input}
                        placeholder=" "
                        min="5"
                        max="18"
                      />
                      <label className={`${styles.floatingLabel} ${formData.playerAge ? styles.active : ''}`}>
                        Age *
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
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
                  {focusAreasOptions.map((area) => {
                    const IconComponent = area.icon;
                    return (
                      <div
                        key={area.value}
                        onClick={() => handleFocusAreaToggle(area.value)}
                        className={`${styles.focusAreaChip} ${formData.focusAreas.includes(area.value) ? styles.selected : ''}`}
                      >
                        <IconComponent size={18} />
                        <span>{area.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences & Contact */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Preferences & Contact</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <User size={20} />
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
                      className={styles.input}
                      placeholder=" "
                    />
                    <label className={`${styles.floatingLabel} ${formData.parentName ? styles.active : ''}`}>
                      Parent Name *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                      placeholder=" "
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
                      className={`${styles.input} ${validationErrors.phone ? styles.inputError : ''}`}
                      placeholder=" "
                      maxLength={14}
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
                    <Users size={20} />
                  </div>
                  Preferred Time of Day
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
                    <Trophy size={20} />
                  </div>
                  Additional Information (Optional)
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={4}
                      placeholder="Any specific goals, concerns, or information we should know?"
                    />
                  </div>
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
                    <h3>Training Program</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Trophy size={18} />
                      </div>
                      <div>
                        <strong>{getSelectedTraining()?.label}</strong>
                        <span>{getSelectedTraining()?.price}</span>
                        <span>{getSelectedTraining()?.description}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Player</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <User size={18} />
                      </div>
                      <div>
                        <strong>{formData.playerName}</strong>
                        <span>Age {formData.playerAge}</span>
                        <span>Skill Level: {getSelectedSkill()?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Focus Areas</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Target size={18} />
                      </div>
                      <div>
                        <span>
                          {formData.focusAreas.map(area => 
                            focusAreasOptions.find(a => a.value === area)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Contact</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <strong>{formData.parentName}</strong>
                        <span>{formData.email}</span>
                        <span>{formData.phone}</span>
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
                        <strong>Preferred Days:</strong>
                        <span>
                          {formData.preferredDays.map(day => 
                            preferredDaysOptions.find(d => d.value === day)?.label
                          ).join(', ')}
                        </span>
                        <strong>Preferred Time:</strong>
                        <span>{getSelectedTime()?.label} ({getSelectedTime()?.description})</span>
                      </div>
                    </div>
                  </div>

                  {formData.additionalInfo && (
                    <div className={styles.summarySection}>
                      <h3>Additional Information</h3>
                      <div className={styles.summaryItem}>
                        <div>
                          <span>{formData.additionalInfo}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.terms}>
                  <p>By proceeding to payment, you agree to our training terms and cancellation policy. A coach will contact you within 48 hours to schedule your first session.</p>
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
                  <div className={styles.totalMain}>
                    <span>First Session</span>
                    <strong>{getSelectedTraining()?.price}</strong>
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
              {isProcessing ? 'Processing...' : 'Complete Registration'}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterTraining;