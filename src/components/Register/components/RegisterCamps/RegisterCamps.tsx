import React, { useState } from 'react';
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

const CAMP_OPTIONS: CampOption[] = [
  {
    id: 'summer-intensive',
    name: 'Summer Intensive',
    description: 'Full-day camp focused on skill development',
    duration: '5 days',
    ageRange: '8-14',
    price: 399,
    features: ['Daily training sessions', 'Lunch included', 'Camp t-shirt', 'Skills competition']
  },
  {
    id: 'goalkeeper',
    name: 'Goalkeeper Academy',
    description: 'Specialized training for aspiring goalkeepers',
    duration: '3 days',
    ageRange: '10-16',
    price: 299,
    features: ['Expert GK coaching', 'Video analysis', 'Equipment provided', 'Certificate']
  },
  {
    id: 'elite',
    name: 'Elite Development',
    description: 'Advanced camp for competitive players',
    duration: '5 days',
    ageRange: '12-17',
    price: 499,
    features: ['College prep', 'Recruiting guidance', 'Advanced tactics', 'Tournament play']
  }
];

const RegisterCamps: React.FC = () => {
  // Use shared validation and formatting hooks
  const validation = useValidation();
  const formatters = useFormFormatters();
  
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

  const availableWeeks = [
    { id: 'week1', label: 'Week 1: June 10-14, 2024', available: true },
    { id: 'week2', label: 'Week 2: June 17-21, 2024', available: true },
    { id: 'week3', label: 'Week 3: June 24-28, 2024', available: false },
    { id: 'week4', label: 'Week 4: July 1-5, 2024', available: true },
  ];

  const tshirtSizes = ['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'];
  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to soccer or learning basics' },
    { value: 'intermediate', label: 'Intermediate', description: 'Plays recreationally, knows fundamentals' },
    { value: 'advanced', label: 'Advanced', description: 'Competitive player, strong technical skills' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
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
    
    if (!formData.parentFirstName.trim()) newErrors.parentFirstName = 'First name is required';
    if (!formData.parentLastName.trim()) newErrors.parentLastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validation.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validation.validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }
    
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency phone is required';
    } else if (!validation.validatePhone(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validation.validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = 'Expiry date is required';
    } else if (!validation.validateCardExpiry(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Please enter a valid expiry date';
    }
    
    if (!formData.cardCVV.trim()) {
      newErrors.cardCVV = 'CVV is required';
    } else if (!validation.validateCVV(formData.cardCVV)) {
      newErrors.cardCVV = 'Please enter a valid 3-digit CVV';
    }
    
    if (!formData.billingZip.trim()) {
      newErrors.billingZip = 'ZIP code is required';
    } else if (!validation.validateZipCode(formData.billingZip)) {
      newErrors.billingZip = 'Please enter a valid 5-digit ZIP code';
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
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= maxStepReached) {
      setCurrentStep(step);
    }
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
      
      // Reset form
      setFormData({
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
      setSelectedCamp(null);
      setSelectedWeek('');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to complete registration. Please try again.');
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
                <h2 className={styles.bannerTitle}>Registration Complete!</h2>
                <p className={styles.bannerSubtitle}>Your camper is all set for an amazing week</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Heart size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Camper</span>
                    <span className={styles.detailValue}>{formData.camperFirstName} {formData.camperLastName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Trophy size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Camp</span>
                    <span className={styles.detailValue}>{selectedCamp?.name}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Week</span>
                    <span className={styles.detailValue}>{availableWeeks.find(w => w.id === selectedWeek)?.label.split(':')[1]}</span>
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

      <div className={styles.container}>
        <div className={styles.campsHeader}>
          <h1 className={styles.campsTitle}>Soccer Camp Registration</h1>
          <p className={styles.campsSubtitle}>Join us for an unforgettable week of soccer, fun, and skill development</p>
        </div>

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
                  {step === 1 && 'Select Camp'}
                  {step === 2 && 'Camper Info'}
                  {step === 3 && 'Parent Info'}
                  {step === 4 && 'Review'}
                  {step === 5 && 'Payment'}
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
              <h2 className={styles.title}>Select Your Camp</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Choose a Program
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
                      <p className={styles.campTypeDuration}>{camp.duration} • Ages {camp.ageRange}</p>
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
                    Select Week
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
                        {!week.available && <span className={styles.campDateStatus}>Full</span>}
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
              <h2 className={styles.title}>Camper Information</h2>
              
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
                        name="camperFirstName"
                        value={formData.camperFirstName}
                        onChange={handleInputChange}
                        className={`${styles.input} ${errors.camperFirstName ? styles.inputError : ''}`}
                        placeholder=" "
                      />
                      <label className={`${styles.floatingLabel} ${formData.camperFirstName ? styles.active : ''}`}>
                        First Name *
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
                        Last Name *
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
                        Age *
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
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
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
                  Camp Details
                </h3>
                
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#15141a' }}>
                      T-Shirt Size *
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
                      Skill Level *
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
              <h2 className={styles.title}>Parent/Guardian Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <User size={20} />
                  </div>
                  Your Information
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
                        First Name *
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
                        Last Name *
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
                      Email Address *
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
                      Phone Number *
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
                  Emergency Contact
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
                      Emergency Contact Name *
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
                      Emergency Phone *
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
                  Medical Information
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <textarea
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={3}
                      placeholder="Any medical conditions we should know about?"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={2}
                      placeholder="Any allergies?"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <textarea
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={2}
                      placeholder="Current medications?"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <textarea
                      name="specialNeeds"
                      value={formData.specialNeeds}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={2}
                      placeholder="Any special needs or accommodations?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && selectedCamp && (
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
                        <strong>{selectedCamp.name}</strong>
                        <span>{selectedCamp.duration} • Ages {selectedCamp.ageRange}</span>
                        <span>{availableWeeks.find(w => w.id === selectedWeek)?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Camper</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <User size={18} />
                      </div>
                      <div>
                        <strong>{formData.camperFirstName} {formData.camperLastName}</strong>
                        <span>Age {formData.camperAge} • {formData.camperGender}</span>
                        <span>Skill Level: {formData.skillLevel}</span>
                        <span>T-Shirt: {formData.tshirtSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Parent/Guardian</h3>
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
                    <h3>Emergency Contact</h3>
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
                    <span>Total</span>
                    <strong>${selectedCamp.price}</strong>
                  </div>
                </div>

                <div className={styles.terms}>
                  <p>
                    By proceeding to payment, you agree to our camp policies including our cancellation policy 
                    and medical release forms. Full terms and conditions will be sent via email.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && selectedCamp && (
            <div className={styles.step}>
              <h2 className={styles.title}>Payment Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <CreditCard size={20} />
                  </div>
                  Card Details
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
                      Card Number *
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
                        Expiry (MM/YY) *
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
                        CVV *
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
                      Billing ZIP Code *
                    </label>
                    {errors.billingZip && <span className={styles.errorMessage}>{errors.billingZip}</span>}
                  </div>
                </div>

                <div className={styles.securityNotice}>
                  <Lock size={16} />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>

              <div className={styles.total}>
                <div className={styles.totalMain}>
                  <span>Total Due Today</span>
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
              Back
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Complete Registration - $${selectedCamp?.price}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterCamps;