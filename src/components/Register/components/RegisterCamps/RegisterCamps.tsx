import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Clock, MapPin, Trophy, Mail, Phone, User, CreditCard, Lock, Heart, Check } from '../../../../components/Icons/Icons';
import styles from './RegisterCamps.module.scss';
import { api } from '../../../../services/api';

// Shared hooks for validation and formatting
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';

interface CampOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  ageRange: string;
  price: number;
  features: string[];
}

const RegisterCamps: React.FC = () => {
  const { t } = useTranslation();
  const validation = useValidation();
  const formatters = useFormFormatters();

  const CAMP_OPTIONS: CampOption[] = [
    {
      id: 'summer-intensive',
      name: t('register.camps.options.summerIntensive.name'),
      description: t('register.camps.options.summerIntensive.description'),
      duration: t('register.camps.options.summerIntensive.duration'),
      ageRange: '8-14',
      price: 399,
      features: t('register.camps.options.summerIntensive.features', { returnObjects: true }) as string[]
    },
    {
      id: 'goalkeeper',
      name: t('register.camps.options.goalkeeper.name'),
      description: t('register.camps.options.goalkeeper.description'),
      duration: t('register.camps.options.goalkeeper.duration'),
      ageRange: '10-16',
      price: 299,
      features: t('register.camps.options.goalkeeper.features', { returnObjects: true }) as string[]
    },
    {
      id: 'elite',
      name: t('register.camps.options.elite.name'),
      description: t('register.camps.options.elite.description'),
      duration: t('register.camps.options.elite.duration'),
      ageRange: '12-17',
      price: 499,
      features: t('register.camps.options.elite.features', { returnObjects: true }) as string[]
    }
  ];

  const availableWeeks = [
    { id: 'week1', label: t('register.camps.weeks.week1'), available: true },
    { id: 'week2', label: t('register.camps.weeks.week2'), available: true },
    { id: 'week3', label: t('register.camps.weeks.week3'), available: false },
    { id: 'week4', label: t('register.camps.weeks.week4'), available: true },
  ];

  const tshirtSizes = ['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'];

  const skillLevels = [
    { value: 'beginner', label: t('register.pickup.filters.beginner'), description: t('register.camps.skillLevels.beginner') },
    { value: 'intermediate', label: t('register.pickup.filters.intermediate'), description: t('register.camps.skillLevels.intermediate') },
    { value: 'advanced', label: t('register.pickup.filters.advanced'), description: t('register.camps.skillLevels.advanced') }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const [selectedCamp, setSelectedCamp] = useState<CampOption | null>(null);
  const [selectedWeek, setSelectedWeek] = useState('');
  
  const [formData, setFormData] = useState({
    camperFirstName: '',
    camperLastName: '',
    camperAge: '',
    camperGender: '',
    tshirtSize: '',
    skillLevel: '',
    parentFirstName: '',
    parentLastName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    allergies: '',
    medications: '',
    specialNeeds: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    billingZip: ''
  });

  const [errors, setErrors] = useState<{
    camperFirstName?: string;
    camperLastName?: string;
    camperAge?: string;
    parentFirstName?: string;
    parentLastName?: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCVV?: string;
    billingZip?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof typeof errors]) {
      const newErrors = { ...errors };
      delete newErrors[name as keyof typeof errors];
      setErrors(newErrors);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.phone);
    setFormData({ ...formData, phone: formatted });
    if (validation.validatePhone(formatted)) {
      const newErrors = { ...errors };
      delete newErrors.phone;
      setErrors(newErrors);
    }
  };

  const handleEmergencyPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.emergencyPhone);
    setFormData({ ...formData, emergencyPhone: formatted });
    if (validation.validatePhone(formatted)) {
      const newErrors = { ...errors };
      delete newErrors.emergencyPhone;
      setErrors(newErrors);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });
    if (validation.validateCardNumber(formatted)) {
      const newErrors = { ...errors };
      delete newErrors.cardNumber;
      setErrors(newErrors);
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatCardExpiry(e.target.value);
    setFormData({ ...formData, cardExpiry: formatted });
    if (validation.validateCardExpiry(formatted)) {
      const newErrors = { ...errors };
      delete newErrors.cardExpiry;
      setErrors(newErrors);
    }
  };

  const validateStep3 = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.parentFirstName.trim()) newErrors.parentFirstName = t('register.camps.errors.firstNameRequired');
    if (!formData.parentLastName.trim()) newErrors.parentLastName = t('register.camps.errors.lastNameRequired');
    
    if (!formData.email.trim()) {
      newErrors.email = t('register.pickup.errors.emailRequired');
    } else if (!validation.validateEmail(formData.email)) {
      newErrors.email = t('register.fieldRental.errors.invalidEmail');
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('register.pickup.errors.phoneRequired');
    } else if (!validation.validatePhone(formData.phone)) {
      newErrors.phone = t('register.fieldRental.errors.invalidPhone');
    }
    
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = t('register.camps.errors.emergencyContactRequired');
    }
    
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = t('register.camps.errors.emergencyPhoneRequired');
    } else if (!validation.validatePhone(formData.emergencyPhone)) {
      newErrors.emergencyPhone = t('register.fieldRental.errors.invalidPhone');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.cardNumber.trim() || !validation.validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = t('register.fieldRental.errors.invalidCard');
    }
    if (!formData.cardExpiry.trim() || !validation.validateCardExpiry(formData.cardExpiry)) {
      newErrors.cardExpiry = t('register.fieldRental.errors.invalidExpiry');
    }
    if (!formData.cardCVV.trim() || !validation.validateCVV(formData.cardCVV)) {
      newErrors.cardCVV = t('register.fieldRental.errors.invalidCVV');
    }
    if (!formData.billingZip.trim() || !validation.validateZipCode(formData.billingZip)) {
      newErrors.billingZip = t('register.fieldRental.errors.invalidZip');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = (): boolean => {
    if (currentStep === 1) return selectedCamp !== null && selectedWeek !== '';
    if (currentStep === 2) return (
      formData.camperFirstName !== '' &&
      formData.camperLastName !== '' &&
      formData.camperAge !== '' &&
      formData.tshirtSize !== '' &&
      formData.skillLevel !== ''
    );
    if (currentStep === 3) return (
      formData.parentFirstName !== '' &&
      formData.parentLastName !== '' &&
      formData.email !== '' &&
      formData.phone !== '' &&
      formData.emergencyContact !== '' &&
      formData.emergencyPhone !== ''
    );
    if (currentStep === 4) return true;
    if (currentStep === 5) return (
      formData.cardNumber !== '' &&
      formData.cardExpiry !== '' &&
      formData.cardCVV !== '' &&
      formData.billingZip !== ''
    );
    return false;
  };

  const handleNext = () => {
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 5 && !validateStep5()) return;
    if (!canProceed()) return;

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (nextStep > maxStepReached) setMaxStepReached(nextStep);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step <= maxStepReached) setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!validateStep5() || !selectedCamp) return;
    
    setIsSubmitting(true);
    
    try {
      // @ts-ignore - API method may not exist yet
      await api.registerCamp({
        camp: selectedCamp,
        week: selectedWeek,
        camper: {
          firstName: formData.camperFirstName,
          lastName: formData.camperLastName,
          age: formData.camperAge,
          gender: formData.camperGender,
          tshirtSize: formData.tshirtSize,
          skillLevel: formData.skillLevel,
        },
        parent: {
          firstName: formData.parentFirstName,
          lastName: formData.parentLastName,
          email: formData.email,
          phone: formData.phone,
        },
        emergency: {
          contact: formData.emergencyContact,
          phone: formData.emergencyPhone,
        },
        medical: {
          conditions: formData.medicalConditions,
          allergies: formData.allergies,
          medications: formData.medications,
          specialNeeds: formData.specialNeeds,
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
        camperFirstName: '', camperLastName: '', camperAge: '', camperGender: '',
        tshirtSize: '', skillLevel: '', parentFirstName: '', parentLastName: '',
        email: '', phone: '', emergencyContact: '', emergencyPhone: '',
        medicalConditions: '', allergies: '', medications: '', specialNeeds: '',
        cardNumber: '', cardExpiry: '', cardCVV: '', billingZip: ''
      });
      setSelectedCamp(null);
      setSelectedWeek('');
    } catch (error) {
      console.error('Registration failed:', error);
      alert(t('register.fieldRental.errors.bookingFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setIsClosing(false);
      setCurrentStep(1);
      setCompletedSteps([]);
      setMaxStepReached(1);
    }, 400);
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  };

  return (
    <div className={styles.camps}>
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
                <h2 className={styles.bannerTitle}>{t('register.camps.success.title')}</h2>
                <p className={styles.bannerSubtitle}>{t('register.camps.success.subtitle')}</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Heart size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.camps.success.camper')}</span>
                    <span className={styles.detailValue}>{formData.camperFirstName} {formData.camperLastName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Trophy size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.camps.success.camp')}</span>
                    <span className={styles.detailValue}>{selectedCamp?.name}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.camps.success.week')}</span>
                    <span className={styles.detailValue}>{availableWeeks.find(w => w.id === selectedWeek)?.label.split(':')[1]}</span>
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
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`${styles.progressStep} ${step === currentStep ? styles.active : ''} ${
                  completedSteps.includes(step) ? styles.completed : ''
                } ${step <= maxStepReached ? styles.clickable : ''}`}
                onClick={() => handleStepClick(step)}
              >
                <div className={styles.progressCircle}>
                  {completedSteps.includes(step) ? <Check size={16} /> : step}
                </div>
                <span className={styles.progressLabel}>
                  {step === 1 && t('register.camps.steps.selectCamp')}
                  {step === 2 && t('register.camps.steps.camperInfo')}
                  {step === 3 && t('register.camps.steps.parentInfo')}
                  {step === 4 && t('register.camps.steps.review')}
                  {step === 5 && t('register.camps.steps.payment')}
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
          {/* Step 1: Select Camp */}
          {currentStep === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.camps.steps.selectCamp')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  {t('register.camps.step1.chooseProgram')}
                </h3>
                <div className={styles.campTypes}>
                  {CAMP_OPTIONS.map((camp) => (
                    <div
                      key={camp.id}
                      onClick={() => setSelectedCamp(camp)}
                      className={`${styles.campTypeCard} ${selectedCamp?.id === camp.id ? styles.selected : ''}`}
                    >
                      <div className={styles.campTypeHeader}>
                        <h4 className={styles.campTypeName}>{camp.name}</h4>
                        <span className={styles.campTypePrice}>${camp.price}</span>
                      </div>
                      <p className={styles.campTypeDuration}>{camp.duration} • {t('register.camps.step1.ages')} {camp.ageRange}</p>
                      <p className={styles.campTypeDescription}>{camp.description}</p>
                      <ul className={styles.campTypeFeatures}>
                        {camp.features.map((feature, idx) => (
                          <li key={idx}>
                            <Check size={16} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCamp && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}>
                      <Calendar size={20} />
                    </div>
                    {t('register.camps.step1.selectWeek')}
                  </h3>
                  <div className={styles.campDates}>
                    {availableWeeks.map((week) => (
                      <div
                        key={week.id}
                        onClick={() => week.available && setSelectedWeek(week.id)}
                        className={`${styles.campDate} ${selectedWeek === week.id ? styles.selected : ''} ${
                          !week.available ? styles.unavailable : ''
                        }`}
                      >
                        <span className={styles.campDateText}>{week.label}</span>
                        {!week.available && <span className={styles.campDateStatus}>{t('register.camps.step1.full')}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Camper Information */}
          {currentStep === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.camps.steps.camperInfo')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <User size={20} />
                  </div>
                  {t('register.camps.step2.basicInfo')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="camperFirstName"
                        value={formData.camperFirstName}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.camperFirstName ? styles.inputError : ''}`}
                        placeholder=" "
                      />
                      <label className={`${styles.floatingLabel} ${formData.camperFirstName ? styles.active : ''}`}>
                        {t('register.contact.fullName').split(' ')[0]} *
                      </label>
                      {errors.camperFirstName && <span className={styles.errorMessage}>{errors.camperFirstName}</span>}
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="camperLastName"
                        value={formData.camperLastName}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.camperLastName ? styles.inputError : ''}`}
                        placeholder=" "
                      />
                      <label className={`${styles.floatingLabel} ${formData.camperLastName ? styles.active : ''}`}>
                        {t('register.camps.step2.lastName')} *
                      </label>
                      {errors.camperLastName && <span className={styles.errorMessage}>{errors.camperLastName}</span>}
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input
                        type="number"
                        name="camperAge"
                        value={formData.camperAge}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.camperAge ? styles.inputError : ''}`}
                        placeholder=" "
                        min="5"
                        max="18"
                      />
                      <label className={`${styles.floatingLabel} ${formData.camperAge ? styles.active : ''}`}>
                        {t('register.camps.step2.age')} *
                      </label>
                      {errors.camperAge && <span className={styles.errorMessage}>{errors.camperAge}</span>}
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <select
                        name="camperGender"
                        value={formData.camperGender}
                        onChange={handleInputChange}
                        className={styles.input}
                      >
                        <option value="">{t('register.camps.step2.selectGender')}</option>
                        <option value="male">{t('register.camps.step2.male')}</option>
                        <option value="female">{t('register.camps.step2.female')}</option>
                        <option value="other">{t('register.camps.step2.other')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  {t('register.camps.step2.campDetails')}
                </h3>
                
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#15141a' }}>
                      {t('register.camps.step2.tshirtSize')} *
                    </label>
                    <div className={styles.shirtSizes}>
                      {tshirtSizes.map((size) => (
                        <div
                          key={size}
                          onClick={() => setFormData({ ...formData, tshirtSize: size })}
                          className={`${styles.shirtSize} ${formData.tshirtSize === size ? styles.selected : ''}`}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#15141a' }}>
                      {t('register.camps.step2.skillLevel')} *
                    </label>
                    <div className={styles.skillLevels}>
                      {skillLevels.map((level) => (
                        <div
                          key={level.value}
                          onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                          className={`${styles.skillLevel} ${formData.skillLevel === level.value ? styles.selected : ''}`}
                        >
                          <h4>{level.label}</h4>
                          <p>{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Parent/Guardian Information */}
          {currentStep === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.camps.steps.parentInfo')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <User size={20} />
                  </div>
                  {t('register.camps.step3.yourInfo')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="parentFirstName"
                        value={formData.parentFirstName}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.parentFirstName ? styles.inputError : ''}`}
                        placeholder=" "
                      />
                      <label className={`${styles.floatingLabel} ${formData.parentFirstName ? styles.active : ''}`}>
                        {t('register.camps.step2.firstName')} *
                      </label>
                      {errors.parentFirstName && <span className={styles.errorMessage}>{errors.parentFirstName}</span>}
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="parentLastName"
                        value={formData.parentLastName}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.parentLastName ? styles.inputError : ''}`}
                        placeholder=" "
                      />
                      <label className={`${styles.floatingLabel} ${formData.parentLastName ? styles.active : ''}`}>
                        {t('register.camps.step2.lastName')} *
                      </label>
                      {errors.parentLastName && <span className={styles.errorMessage}>{errors.parentLastName}</span>}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      placeholder=" "
                    />
                    <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>
                      {t('register.contact.email')} *
                    </label>
                    {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                      placeholder=" "
                      maxLength={14}
                    />
                    <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>
                      {t('register.contact.phone')} *
                    </label>
                    {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Phone size={20} />
                  </div>
                  {t('register.camps.step3.emergencyContact')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.emergencyContact ? styles.inputError : ''}`}
                      placeholder=" "
                    />
                    <label className={`${styles.floatingLabel} ${formData.emergencyContact ? styles.active : ''}`}>
                      {t('register.camps.step3.emergencyContactName')} *
                    </label>
                    {errors.emergencyContact && <span className={styles.errorMessage}>{errors.emergencyContact}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleEmergencyPhoneChange}
                      className={`${styles.input} ${errors.emergencyPhone ? styles.inputError : ''}`}
                      placeholder=" "
                      maxLength={14}
                    />
                    <label className={`${styles.floatingLabel} ${formData.emergencyPhone ? styles.active : ''}`}>
                      {t('register.camps.step3.emergencyPhone')} *
                    </label>
                    {errors.emergencyPhone && <span className={styles.errorMessage}>{errors.emergencyPhone}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Heart size={20} />
                  </div>
                  {t('register.camps.step3.medicalInfo')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <textarea
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={3}
                      placeholder={t('register.camps.step3.medicalConditionsPlaceholder')}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={2}
                      placeholder={t('register.camps.step3.allergiesPlaceholder')}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <textarea
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={2}
                      placeholder={t('register.camps.step3.medicationsPlaceholder')}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <textarea
                      name="specialNeeds"
                      value={formData.specialNeeds}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={2}
                      placeholder={t('register.camps.step3.specialNeedsPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && selectedCamp && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.camps.steps.review')}</h2>
              
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>{t('register.camps.step4.campDetails')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Trophy size={18} />
                      </div>
                      <div>
                        <strong>{selectedCamp.name}</strong>
                        <span>{selectedCamp.duration} • {t('register.camps.step1.ages')} {selectedCamp.ageRange}</span>
                        <span>{availableWeeks.find(w => w.id === selectedWeek)?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>{t('register.camps.step4.camper')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <User size={18} />
                      </div>
                      <div>
                        <strong>{formData.camperFirstName} {formData.camperLastName}</strong>
                        <span>{t('register.camps.step4.age')} {formData.camperAge} • {formData.camperGender}</span>
                        <span>{t('register.camps.step4.skillLabel')}: {formData.skillLevel}</span>
                        <span>{t('register.camps.step4.tshirt')}: {formData.tshirtSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>{t('register.camps.steps.parentInfo')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <strong>{formData.parentFirstName} {formData.parentLastName}</strong>
                        <span>{formData.email}</span>
                        <span>{formData.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>{t('register.camps.step3.emergencyContact')}</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <strong>{formData.emergencyContact}</strong>
                        <span>{formData.emergencyPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.total}>
                  <div className={styles.totalMain}>
                    <span>{t('register.payment.total')}</span>
                    <strong>${selectedCamp.price}</strong>
                  </div>
                </div>

                <div className={styles.terms}>
                  <p>{t('register.camps.step4.terms')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && selectedCamp && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.camps.steps.payment')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <CreditCard size={20} />
                  </div>
                  {t('register.pickup.payment.cardDetails')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      className={`${styles.input} ${errors.cardNumber ? styles.inputError : ''}`}
                      placeholder=" "
                      maxLength={19}
                    />
                    <label className={`${styles.floatingLabel} ${formData.cardNumber ? styles.active : ''}`}>
                      {t('register.payment.cardNumber')} *
                    </label>
                    {errors.cardNumber && <span className={styles.errorMessage}>{errors.cardNumber}</span>}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleCardExpiryChange}
                        className={`${styles.input} ${errors.cardExpiry ? styles.inputError : ''}`}
                        placeholder=" "
                        maxLength={5}
                      />
                      <label className={`${styles.floatingLabel} ${formData.cardExpiry ? styles.active : ''}`}>
                        {t('register.payment.expiry')} *
                      </label>
                      {errors.cardExpiry && <span className={styles.errorMessage}>{errors.cardExpiry}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="cardCVV"
                        value={formData.cardCVV}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.cardCVV ? styles.inputError : ''}`}
                        placeholder=" "
                        maxLength={3}
                      />
                      <label className={`${styles.floatingLabel} ${formData.cardCVV ? styles.active : ''}`}>
                        {t('register.payment.cvv')} *
                      </label>
                      {errors.cardCVV && <span className={styles.errorMessage}>{errors.cardCVV}</span>}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="billingZip"
                      value={formData.billingZip}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.billingZip ? styles.inputError : ''}`}
                      placeholder=" "
                      maxLength={5}
                    />
                    <label className={`${styles.floatingLabel} ${formData.billingZip ? styles.active : ''}`}>
                      {t('register.payment.billingZip')} *
                    </label>
                    {errors.billingZip && <span className={styles.errorMessage}>{errors.billingZip}</span>}
                  </div>
                </div>

                <div className={styles.securityNotice}>
                  <Lock size={16} />
                  <span>{t('register.payment.securityNotice')}</span>
                </div>
              </div>

              <div className={styles.total}>
                <div className={styles.totalMain}>
                  <span>{t('register.camps.step5.totalDue')}</span>
                  <strong>${selectedCamp.price}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {currentStep > 1 && (
            <button 
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleBack}
            >
              {t('register.nav.back')}
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {t('register.nav.continue')}
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('register.nav.processing') : t('register.camps.step5.completeRegistration', { price: selectedCamp?.price })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterCamps;