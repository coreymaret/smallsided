import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, ChevronRight, Check, Trophy, Mail, User, Shield, CreditCard, Lock, Target } from '../../../../components/Icons/Icons';
import styles from './RegisterTraining.module.scss';
import { api } from '../../../../services/api';

// Shared hooks for validation and formatting
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';

const RegisterTraining: React.FC = () => {
  const { t } = useTranslation();
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

  const trainingTypes = [
    {
      value: 'individual',
      label: t('register.training.types.individual.label'),
      description: t('register.training.types.individual.description'),
      price: t('register.training.types.individual.price')
    },
    {
      value: 'small-group',
      label: t('register.training.types.smallGroup.label'),
      description: t('register.training.types.smallGroup.description'),
      price: t('register.training.types.smallGroup.price')
    },
    {
      value: 'position-specific',
      label: t('register.training.types.positionSpecific.label'),
      description: t('register.training.types.positionSpecific.description'),
      price: t('register.training.types.positionSpecific.price')
    }
  ];

  const skillLevels = [
    { value: 'beginner', label: t('register.pickup.filters.beginner'), description: t('register.training.skillLevels.beginner') },
    { value: 'intermediate', label: t('register.pickup.filters.intermediate'), description: t('register.training.skillLevels.intermediate') },
    { value: 'advanced', label: t('register.pickup.filters.advanced'), description: t('register.training.skillLevels.advanced') }
  ];

  const focusAreasOptions = [
    { value: 'ball-control', label: t('register.training.focusAreas.ballControl'), icon: Target },
    { value: 'shooting', label: t('register.training.focusAreas.shooting'), icon: Target },
    { value: 'passing', label: t('register.training.focusAreas.passing'), icon: Target },
    { value: 'dribbling', label: t('register.training.focusAreas.dribbling'), icon: Target },
    { value: 'defense', label: t('register.training.focusAreas.defense'), icon: Shield },
    { value: 'fitness', label: t('register.training.focusAreas.fitness'), icon: Trophy }
  ];

  const preferredDaysOptions = [
    { value: 'monday', label: t('register.training.days.monday') },
    { value: 'tuesday', label: t('register.training.days.tuesday') },
    { value: 'wednesday', label: t('register.training.days.wednesday') },
    { value: 'thursday', label: t('register.training.days.thursday') },
    { value: 'friday', label: t('register.training.days.friday') },
    { value: 'saturday', label: t('register.training.days.saturday') },
    { value: 'sunday', label: t('register.training.days.sunday') }
  ];

  const timeSlots = [
    { value: 'morning', label: t('register.training.timeSlots.morning.label'), description: t('register.training.timeSlots.morning.description') },
    { value: 'afternoon', label: t('register.training.timeSlots.afternoon.label'), description: t('register.training.timeSlots.afternoon.description') },
    { value: 'evening', label: t('register.training.timeSlots.evening.label'), description: t('register.training.timeSlots.evening.description') }
  ];

  const handleCloseBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setIsClosing(false);
    }, 400);
  };

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.phone);
    setFormData({ ...formData, phone: formatted });
    if (validation.validatePhone(formatted)) {
      const newErrors = { ...validationErrors };
      delete newErrors.phone;
      setValidationErrors(newErrors);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });
    if (validation.validateCardNumber(formatted)) {
      const newErrors = { ...validationErrors };
      delete newErrors.cardNumber;
      setValidationErrors(newErrors);
    }
  };

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

  const validateStep5Fields = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;
    if (!validation.validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = t('register.fieldRental.errors.invalidCard');
      isValid = false;
    }
    if (!validation.validateCardExpiry(formData.cardExpiry)) {
      errors.cardExpiry = t('register.fieldRental.errors.invalidExpiry');
      isValid = false;
    }
    if (!validation.validateCVV(formData.cardCVV)) {
      errors.cardCVV = t('register.fieldRental.errors.invalidCVV');
      isValid = false;
    }
    if (!validation.validateZipCode(formData.billingZip)) {
      errors.billingZip = t('register.fieldRental.errors.invalidZip');
      isValid = false;
    }
    setValidationErrors(errors);
    return isValid;
  };

  const canProceed = (): boolean => {
    switch(step) {
      case 1: return formData.trainingType !== '';
      case 2: return formData.playerName !== '' && formData.skillLevel !== '' && formData.focusAreas.length > 0;
      case 3: return formData.parentName !== '' && formData.email !== '' && formData.phone !== '' &&
                     formData.preferredDays.length > 0 && formData.preferredTime !== '';
      case 4: return true;
      case 5: return formData.cardNumber !== '' && formData.cardExpiry !== '' && formData.cardCVV !== '' && formData.billingZip !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && !validateStep3Fields()) return;
    if (step === 5 && !validateStep5Fields()) return;
    if (!canProceed()) return;

    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(step);
    setCompletedSteps(newCompletedSteps);

    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep > maxStepReached) setMaxStepReached(nextStep);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep <= maxStepReached) setStep(clickedStep);
  };

  const handleSubmit = async () => {
    if (!validateStep5Fields()) return;
    setIsProcessing(true);

    try {
      const selectedTraining = trainingTypes.find(t => t.value === formData.trainingType);
      // @ts-ignore - API method may not exist yet
      await api.registerTraining({
        training: selectedTraining,
        player: { name: formData.playerName, age: formData.playerAge, skillLevel: formData.skillLevel },
        parent: { name: formData.parentName, email: formData.email, phone: formData.phone },
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
        trainingType: '', playerName: '', playerAge: '', parentName: '',
        email: '', phone: '', skillLevel: '', focusAreas: [],
        preferredDays: [], preferredTime: '', additionalInfo: '',
        cardNumber: '', cardExpiry: '', cardCVV: '', billingZip: ''
      });
      setStep(1);
      setCompletedSteps(new Set());
      setMaxStepReached(1);
    } catch (error) {
      console.error('Registration failed:', error);
      alert(t('register.fieldRental.errors.bookingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedTraining = () => trainingTypes.find(t => t.value === formData.trainingType);
  const getSelectedSkill = () => skillLevels.find(s => s.value === formData.skillLevel);
  const getSelectedTime = () => timeSlots.find(t => t.value === formData.preferredTime);

  const getProgressPercentage = () => ((step - 1) / 4) * 100;

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
                <h2 className={styles.bannerTitle}>{t('register.training.success.title')}</h2>
                <p className={styles.bannerSubtitle}>{t('register.training.success.subtitle')}</p>
              </div>
            </div>

            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Trophy size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.training.success.player')}</span>
                    <span className={styles.detailValue}>{formData.playerName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Target size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.training.success.trainingType')}</span>
                    <span className={styles.detailValue}>{getSelectedTraining()?.label}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.training.success.preferredTime')}</span>
                    <span className={styles.detailValue}>{getSelectedTime()?.label}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.emailNotice}>
              <Mail size={16} />
              <span>{t('register.fieldRental.success.emailNotice', { email: formData.email })}</span>
            </div>
          </div>
        </>
      )}

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
                  {s === 1 && t('register.training.steps.program')}
                  {s === 2 && t('register.training.steps.playerInfo')}
                  {s === 3 && t('register.training.steps.preferences')}
                  {s === 4 && t('register.training.steps.review')}
                  {s === 5 && t('register.training.steps.payment')}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${getProgressPercentage()}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <div className={styles.content}>
          {/* Step 1: Select Training Type */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.training.step1.title')}</h2>
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
              <h2 className={styles.title}>{t('register.training.steps.playerInfo')}</h2>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><User size={20} /></div>
                  {t('register.camps.step2.basicInfo')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input type="text" name="playerName" value={formData.playerName} onChange={handleInputChange} className={styles.input} placeholder=" " />
                      <label className={`${styles.floatingLabel} ${formData.playerName ? styles.active : ''}`}>
                        {t('register.training.step2.playerName')} *
                      </label>
                    </div>
                    <div className={styles.inputGroup}>
                      <input type="number" name="playerAge" value={formData.playerAge} onChange={handleInputChange} className={styles.input} placeholder=" " min="5" max="18" />
                      <label className={`${styles.floatingLabel} ${formData.playerAge ? styles.active : ''}`}>
                        {t('register.camps.step2.age')} *
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Trophy size={20} /></div>
                  {t('register.camps.step2.skillLevel')}
                </h3>
                <div className={styles.preferenceCards}>
                  {skillLevels.map((level) => (
                    <button key={level.value} onClick={() => handleSkillLevelSelect(level.value)} className={`${styles.preferenceCard} ${formData.skillLevel === level.value ? styles.selected : ''}`}>
                      <h4>{level.label}</h4>
                      <p>{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Target size={20} /></div>
                  {t('register.training.step2.focusAreas')}
                </h3>
                <div className={styles.focusAreas}>
                  {focusAreasOptions.map((area) => {
                    const IconComponent = area.icon;
                    return (
                      <div key={area.value} onClick={() => handleFocusAreaToggle(area.value)} className={`${styles.focusAreaChip} ${formData.focusAreas.includes(area.value) ? styles.selected : ''}`}>
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
              <h2 className={styles.title}>{t('register.training.steps.preferences')}</h2>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><User size={20} /></div>
                  {t('register.training.step3.parentContact')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} className={styles.input} placeholder=" " />
                    <label className={`${styles.floatingLabel} ${formData.parentName ? styles.active : ''}`}>
                      {t('register.birthday.step3.parentName')} *
                    </label>
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`} placeholder=" " />
                    <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>
                      {t('register.contact.email')} *
                    </label>
                    {validationErrors.email && <span className={styles.errorMessage}>{validationErrors.email}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} className={`${styles.input} ${validationErrors.phone ? styles.inputError : ''}`} placeholder=" " maxLength={14} />
                    <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>
                      {t('register.contact.phone')} *
                    </label>
                    {validationErrors.phone && <span className={styles.errorMessage}>{validationErrors.phone}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Calendar size={20} /></div>
                  {t('register.training.step3.preferredDays')}
                </h3>
                <div className={styles.daysGrid}>
                  {preferredDaysOptions.map((day) => (
                    <button key={day.value} onClick={() => handleDayToggle(day.value)} className={`${styles.dayChip} ${formData.preferredDays.includes(day.value) ? styles.selected : ''}`}>
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Users size={20} /></div>
                  {t('register.training.step3.preferredTime')}
                </h3>
                <div className={styles.preferenceCards}>
                  {timeSlots.map((slot) => (
                    <button key={slot.value} onClick={() => handleTimeSlotSelect(slot.value)} className={`${styles.preferenceCard} ${formData.preferredTime === slot.value ? styles.selected : ''}`}>
                      <h4>{slot.label}</h4>
                      <p>{slot.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Trophy size={20} /></div>
                  {t('register.training.step3.additionalInfo')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} className={styles.textarea} rows={4} placeholder={t('register.training.step3.additionalInfoPlaceholder')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.training.steps.review')}</h2>
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>{t('register.training.step4.trainingProgram')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Trophy size={18} /></div>
                      <div>
                        <strong>{getSelectedTraining()?.label}</strong>
                        <span>{getSelectedTraining()?.price}</span>
                        <span>{getSelectedTraining()?.description}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <h3>{t('register.training.step4.player')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><User size={18} /></div>
                      <div>
                        <strong>{formData.playerName}</strong>
                        <span>{t('register.camps.step4.age')} {formData.playerAge}</span>
                        <span>{t('register.camps.step4.skillLabel')}: {getSelectedSkill()?.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <h3>{t('register.training.step4.focusAreas')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Target size={18} /></div>
                      <div>
                        <span>{formData.focusAreas.map(area => focusAreasOptions.find(a => a.value === area)?.label).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <h3>{t('register.contact.contactDetails')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Mail size={18} /></div>
                      <div>
                        <strong>{formData.parentName}</strong>
                        <span>{formData.email}</span>
                        <span>{formData.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.summarySection}>
                    <h3>{t('register.training.step4.schedulePreferences')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}><Calendar size={18} /></div>
                      <div>
                        <strong>{t('register.training.step3.preferredDays')}:</strong>
                        <span>{formData.preferredDays.map(day => preferredDaysOptions.find(d => d.value === day)?.label).join(', ')}</span>
                        <strong>{t('register.training.step3.preferredTime')}:</strong>
                        <span>{getSelectedTime()?.label} ({getSelectedTime()?.description})</span>
                      </div>
                    </div>
                  </div>
                  {formData.additionalInfo && (
                    <div className={styles.summarySection}>
                      <h3>{t('register.training.step3.additionalInfo')}</h3>
                      <div className={styles.summaryItem}>
                        <div><span>{formData.additionalInfo}</span></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.terms}>
                  <p>{t('register.training.step4.terms')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.training.steps.payment')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><CreditCard size={20} /></div>
                  {t('register.training.step5.completeRegistration')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleCardNumberChange} placeholder={t('register.payment.cardNumber')} maxLength={19} className={`${styles.input} ${validationErrors.cardNumber ? styles.inputError : ''}`} />
                    <label className={`${styles.floatingLabel} ${formData.cardNumber ? styles.active : ''}`}>{t('register.payment.cardNumber')} *</label>
                    {validationErrors.cardNumber && <span className={styles.errorMessage}>{validationErrors.cardNumber}</span>}
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleCardExpiryChange} placeholder={t('register.payment.expiry')} maxLength={5} className={`${styles.input} ${validationErrors.cardExpiry ? styles.inputError : ''}`} />
                      <label className={`${styles.floatingLabel} ${formData.cardExpiry ? styles.active : ''}`}>{t('register.payment.expiry')} *</label>
                      {validationErrors.cardExpiry && <span className={styles.errorMessage}>{validationErrors.cardExpiry}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                      <input type="text" name="cardCVV" value={formData.cardCVV} onChange={handleInputChange} placeholder={t('register.payment.cvv')} maxLength={3} className={`${styles.input} ${validationErrors.cardCVV ? styles.inputError : ''}`} />
                      <label className={`${styles.floatingLabel} ${formData.cardCVV ? styles.active : ''}`}>{t('register.payment.cvv')} *</label>
                      {validationErrors.cardCVV && <span className={styles.errorMessage}>{validationErrors.cardCVV}</span>}
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="text" name="billingZip" value={formData.billingZip} onChange={handleInputChange} placeholder={t('register.payment.billingZip')} maxLength={10} className={`${styles.input} ${validationErrors.billingZip ? styles.inputError : ''}`} />
                    <label className={`${styles.floatingLabel} ${formData.billingZip ? styles.active : ''}`}>{t('register.payment.billingZip')} *</label>
                    {validationErrors.billingZip && <span className={styles.errorMessage}>{validationErrors.billingZip}</span>}
                  </div>
                  <div className={styles.securityNotice}>
                    <Lock size={16} />
                    <span>{t('register.payment.securityNotice')}</span>
                  </div>
                </div>
                <div className={styles.total}>
                  <div className={styles.totalMain}>
                    <span>{t('register.training.step5.firstSession')}</span>
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
              {t('register.nav.back')}
            </button>
          )}
          {step < 5 ? (
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleNext} disabled={!canProceed()}>
              {t('register.nav.continue')}
              <ChevronRight size={20} />
            </button>
          ) : (
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? t('register.nav.processing') : t('register.training.step5.completeButton')}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterTraining;