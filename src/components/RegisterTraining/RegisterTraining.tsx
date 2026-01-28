import React, { useState } from 'react';
import { Users, Calendar, ChevronRight, Check, CreditCard, Lock, Trophy, Target, Zap } from 'lucide-react';
import styles from './RegisterTraining.module.scss';
import { api } from '../../services/api';

interface RegisterTrainingProps {
  preSelectedType?: string;
  onClose?: () => void;
}

const RegisterTraining: React.FC<RegisterTrainingProps> = ({ preSelectedType, onClose }) => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  
  const [formData, setFormData] = useState({
    trainingType: preSelectedType || '',
    sessionCount: 1,
    month: '',
    day: '',
    year: '',
    timeSlot: '',
    playerName: '',
    playerAge: '',
    parentName: '',
    email: '',
    phone: '',
    skillLevel: '',
    focusArea: '',
    specialRequests: '',
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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const trainingTypes = [
    {
      id: 'individual',
      name: 'Individual Training',
      pricePerSession: 60,
      duration: '60 minutes',
      description: 'One-on-one focused training',
      features: ['Personalized coaching', 'Custom drills', 'Video analysis', 'Progress tracking']
    },
    {
      id: 'small-group',
      name: 'Small Group (2-4 players)',
      pricePerSession: 40,
      duration: '90 minutes',
      description: 'Train with friends, save money',
      features: ['Small group focus', 'Competitive drills', 'Team building', 'Shared coaching']
    },
    {
      id: 'position-specific',
      name: 'Position-Specific',
      pricePerSession: 75,
      duration: '60 minutes',
      description: 'Specialized training by position',
      features: ['Expert position coach', 'Advanced techniques', 'Game situations', 'Mental preparation']
    },
    {
      id: 'goalkeeper',
      name: 'Goalkeeper Training',
      pricePerSession: 70,
      duration: '60 minutes',
      description: 'Specialized goalkeeper coaching',
      features: ['Shot stopping', 'Distribution', 'Positioning', 'Command of box']
    }
  ];

  const sessionPackages = [
    { value: 1, label: '1 Session', discount: 0 },
    { value: 4, label: '4 Sessions', discount: 0.05 },
    { value: 8, label: '8 Sessions', discount: 0.10 },
    { value: 12, label: '12 Sessions', discount: 0.15 }
  ];

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const getAvailableDays = () => {
    const totalDays = getDaysInMonth(formData.month, formData.year || String(currentYear));
    const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
    
    const selectedYear = parseInt(formData.year) || currentYear;
    const selectedMonth = parseInt(formData.month);
    
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return allDays.filter(day => day >= currentDay);
    }
    
    return allDays;
  };

  const days = getAvailableDays();
  const years = Array.from({ length: 2 }, (_, i) => currentYear + i);

  const timeSlots = [
    { id: '1', time: '8:00 AM', available: true },
    { id: '2', time: '9:00 AM', available: true },
    { id: '3', time: '10:00 AM', available: true },
    { id: '4', time: '11:00 AM', available: false },
    { id: '5', time: '12:00 PM', available: true },
    { id: '6', time: '1:00 PM', available: true },
    { id: '7', time: '2:00 PM', available: false },
    { id: '8', time: '3:00 PM', available: true },
    { id: '9', time: '4:00 PM', available: true },
    { id: '10', time: '5:00 PM', available: true },
    { id: '11', time: '6:00 PM', available: true },
    { id: '12', time: '7:00 PM', available: true }
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to soccer or learning basics' },
    { value: 'intermediate', label: 'Intermediate', description: 'Has fundamental skills, plays regularly' },
    { value: 'advanced', label: 'Advanced', description: 'Competitive player with strong skills' },
    { value: 'elite', label: 'Elite', description: 'Club/travel team level' }
  ];

  const focusAreas = [
    { value: 'technical', label: 'Technical Skills', description: 'Ball control, dribbling, passing' },
    { value: 'tactical', label: 'Tactical Awareness', description: 'Game understanding, positioning' },
    { value: 'physical', label: 'Physical Fitness', description: 'Speed, agility, conditioning' },
    { value: 'mental', label: 'Mental Game', description: 'Confidence, decision making' }
  ];

  const isDateValid = () => {
    if (!formData.month || !formData.day || !formData.year) return false;
    
    const selectedDate = new Date(parseInt(formData.year), parseInt(formData.month) - 1, parseInt(formData.day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today;
  };

  const handleTrainingTypeSelect = (typeId: string) => {
    setFormData({ ...formData, trainingType: formData.trainingType === typeId ? '' : typeId });
  };

  const handleDateChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'month' || field === 'year') {
      const selectedYear = parseInt(field === 'year' ? value : formData.year || String(currentYear));
      const selectedMonth = parseInt(field === 'month' ? value : formData.month);
      const selectedDay = parseInt(formData.day);
      
      const daysInMonth = getDaysInMonth(
        field === 'month' ? value : formData.month,
        field === 'year' ? value : (formData.year || String(currentYear))
      );
      if (selectedDay > daysInMonth) {
        newFormData.day = String(daysInMonth);
      }
      
      if (selectedYear === currentYear && selectedMonth === currentMonth) {
        if (selectedDay < currentDay) {
          newFormData.day = '';
        }
      }
    }
    
    setFormData(newFormData);
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setFormData({ ...formData, timeSlot: formData.timeSlot === slotId ? '' : slotId });
  };

  const handleSkillLevelSelect = (level: string) => {
    setFormData({ ...formData, skillLevel: formData.skillLevel === level ? '' : level });
  };

  const handleFocusAreaSelect = (area: string) => {
    setFormData({ ...formData, focusArea: formData.focusArea === area ? '' : area });
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
        return formData.trainingType !== '' && formData.sessionCount > 0 && isDateValid() && formData.timeSlot !== '';
      case 2:
        return formData.playerName !== '' && formData.playerAge !== '' && 
               formData.parentName !== '' && formData.email !== '' && formData.phone !== '';
      case 3:
        return formData.skillLevel !== '' && formData.focusArea !== '';
      case 4:
        return true;
      case 5:
        return formData.cardNumber !== '' && formData.cardExpiry !== '' && 
               formData.cardCVV !== '' && formData.billingZip !== '';
      default:
        return false;
    }
  };

  const calculateTotal = () => {
    const training = trainingTypes.find(t => t.id === formData.trainingType);
    if (!training) return 0;
    
    const pkg = sessionPackages.find(p => p.value === formData.sessionCount);
    const discount = pkg?.discount || 0;
    
    const subtotal = training.pricePerSession * formData.sessionCount;
    return subtotal * (1 - discount);
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
        const container = document.getElementById('training-container');
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
        const container = document.getElementById('training-container');
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
        const container = document.getElementById('training-container');
        if (container) {
          const yOffset = -20;
          const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep4Fields()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const mockPaymentIntent = {
        id: 'pi_' + Date.now(),
        status: 'succeeded'
      };
      
      const selectedTraining = trainingTypes.find(t => t.id === formData.trainingType);
      const selectedTimeSlot = timeSlots.find(s => s.id === formData.timeSlot);
      
      const bookingData: any = {
        booking_type: 'training' as const,
        customer_name: formData.parentName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        booking_date: `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`,
        start_time: selectedTimeSlot?.time || '',
        participants: 1,
        total_amount: calculateTotal(),
        stripe_payment_intent_id: mockPaymentIntent.id,
        metadata: {
          training_type: selectedTraining?.name,
          duration: selectedTraining?.duration,
          session_count: formData.sessionCount,
          player_name: formData.playerName,
          player_age: formData.playerAge,
          skill_level: formData.skillLevel,
          focus_area: focusAreas.find(f => f.value === formData.focusArea)?.label
        }
      };
      
      // Only include special_requests if user actually entered something
      if (formData.specialRequests && formData.specialRequests.trim()) {
        bookingData.special_requests = formData.specialRequests;
      }
      
      console.log('📤 Training - Sending booking data:', bookingData);
      
      const result = await api.createBooking(bookingData) as { success: boolean; booking: { id: string } };
      
      if (result.success) {
        console.log('✅ Training - Booking successful:', result);
        setShowSuccessAnimation(true);
        
        // Close modal after 3 seconds if onClose was provided
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      } else {
        throw new Error('Failed to save booking');
      }
    } catch (error) {
      console.error('❌ Training - Booking error:', error);
      alert(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedTraining = () => trainingTypes.find(t => t.id === formData.trainingType);
  const getSelectedTimeSlot = () => timeSlots.find(s => s.id === formData.timeSlot);
  const getSelectedSkillLevel = () => skillLevels.find(s => s.value === formData.skillLevel);
  const getSelectedFocusArea = () => focusAreas.find(f => f.value === formData.focusArea);

  const getFormattedDate = () => {
    if (!formData.month || !formData.day || !formData.year) return '';
    const monthName = months.find(m => m.value === formData.month)?.label;
    return `${monthName} ${formData.day}, ${formData.year}`;
  };

  const getDiscount = () => {
    const pkg = sessionPackages.find(p => p.value === formData.sessionCount);
    return pkg?.discount || 0;
  };

  return (
    <div className={styles.training}>
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
                <h3 className={styles.bannerTitle}>Training Booked!</h3>
                <p className={styles.bannerSubtitle}>Your training session has been successfully reserved</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Trophy className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Player</span>
                    <span className={styles.detailValue}>{formData.playerName} (Age {formData.playerAge})</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Target className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Training Type</span>
                    <span className={styles.detailValue}>{getSelectedTraining()?.name}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Calendar className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>First Session</span>
                    <span className={styles.detailValue}>{getFormattedDate()}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Zap className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Sessions</span>
                    <span className={styles.detailValue}>{formData.sessionCount} session{formData.sessionCount > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Users className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Focus</span>
                    <span className={styles.detailValue}>{getSelectedFocusArea()?.label}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Trophy className={styles.detailIcon} size={20} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Total Paid</span>
                    <span className={styles.detailValue}>${calculateTotal()}</span>
                  </div>
                </div>
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

      <div className={styles.trainingHeader}>
        <h2 className={styles.trainingTitle}>Book Training Sessions</h2>
        <p className={styles.trainingSubtitle}>Elevate your game with personalized coaching</p>
      </div>

      <div className={styles.container} id="training-container">
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
                    {s === 1 && 'Training'}
                    {s === 2 && 'Info'}
                    {s === 3 && 'Goals'}
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
          {/* Step 1: Training Type & Schedule */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Choose Your Training</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Select Training Type
                </h3>
                <div className={styles.trainingTypes}>
                  {trainingTypes.map((training) => {
                    const isSelected = formData.trainingType === training.id;
                    return (
                      <button
                        key={training.id}
                        className={`${styles.trainingCard} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleTrainingTypeSelect(training.id)}
                      >
                        <div className={styles.trainingHeader}>
                          <h4 className={styles.trainingName}>{training.name}</h4>
                          <div className={styles.trainingPrice}>${training.pricePerSession}/session</div>
                        </div>
                        <p className={styles.trainingDuration}>{training.duration}</p>
                        <p className={styles.trainingDescription}>{training.description}</p>
                        <ul className={styles.trainingFeatures}>
                          {training.features.map((feature, idx) => (
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

              {formData.trainingType && (
                <>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <div className={styles.iconCircle}>
                        <Zap size={20} />
                      </div>
                      Session Package
                    </h3>
                    <div className={styles.sessionPackages}>
                      {sessionPackages.map((pkg) => {
                        const isSelected = formData.sessionCount === pkg.value;
                        return (
                          <button
                            key={pkg.value}
                            className={`${styles.sessionPackage} ${isSelected ? styles.selected : ''}`}
                            onClick={() => setFormData({ ...formData, sessionCount: pkg.value })}
                          >
                            <div className={styles.packageLabel}>{pkg.label}</div>
                            {pkg.discount > 0 && (
                              <div className={styles.packageDiscount}>Save {pkg.discount * 100}%</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <div className={styles.iconCircle}>
                        <Calendar size={20} />
                      </div>
                      First Session Date
                    </h3>
                    <div className={styles.dateDropdowns}>
                      <select
                        value={formData.month}
                        onChange={(e) => handleDateChange('month', e.target.value)}
                        className={styles.dropdown}
                      >
                        <option value="">Month</option>
                        {months.map(month => {
                          const isDisabled = parseInt(month.value) < currentMonth && (!formData.year || parseInt(formData.year) === currentYear);
                          return (
                            <option key={month.value} value={month.value} disabled={isDisabled}>
                              {month.label}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        value={formData.day}
                        onChange={(e) => handleDateChange('day', e.target.value)}
                        className={styles.dropdown}
                      >
                        <option value="">Day</option>
                        {days.map(day => {
                          const isDisabled = day < currentDay && 
                                            parseInt(formData.month) === currentMonth && 
                                            (!formData.year || parseInt(formData.year) === currentYear);
                          return (
                            <option key={day} value={day} disabled={isDisabled}>
                              {day}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        value={formData.year}
                        onChange={(e) => handleDateChange('year', e.target.value)}
                        className={styles.dropdown}
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <div className={styles.iconCircle}>
                        <Target size={20} />
                      </div>
                      Preferred Time
                    </h3>
                    <div className={styles.timeSlots}>
                      {timeSlots.map((slot) => {
                        const isSelected = formData.timeSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            className={`${styles.timeSlot} ${isSelected ? styles.selected : ''} ${!slot.available ? styles.unavailable : ''}`}
                            onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                            disabled={!slot.available}
                          >
                            <span className={styles.timeSlotTime}>{slot.time}</span>
                            {!slot.available && <span className={styles.timeSlotStatus}>Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Player & Parent Info */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Player Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
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
                      placeholder="Player's Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.playerName ? styles.active : ''}`}>
                      Player's Full Name *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      name="playerAge"
                      value={formData.playerAge}
                      onChange={handleInputChange}
                      placeholder="Player's Age"
                      min="5"
                      max="18"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.playerAge ? styles.active : ''}`}>
                      Player's Age *
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
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals & Focus */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Training Goals</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  Current Skill Level
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
                    <Target size={20} />
                  </div>
                  Primary Focus Area
                </h3>
                <div className={styles.focusAreas}>
                  {focusAreas.map((area) => (
                    <button
                      key={area.value}
                      onClick={() => handleFocusAreaSelect(area.value)}
                      className={`${styles.focusArea} ${formData.focusArea === area.value ? styles.selected : ''}`}
                    >
                      <h4>{area.label}</h4>
                      <p>{area.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Zap size={20} />
                  </div>
                  Special Requests (Optional)
                </h3>
                <div className={styles.inputGroup}>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any specific goals, concerns, or requests..."
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
              <h2 className={styles.title}>Review Your Training</h2>
              
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>Training Details</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Trophy size={18} />
                      </div>
                      <div>
                        <strong>{getSelectedTraining()?.name}</strong>
                        <span>{formData.sessionCount} session{formData.sessionCount > 1 ? 's' : ''} • {getSelectedTraining()?.duration}</span>
                        {getDiscount() > 0 && (
                          <span className={styles.discount}>
                            {getDiscount() * 100}% package discount applied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>First Session</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <strong>{getFormattedDate()}</strong>
                        <span>{getSelectedTimeSlot()?.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Player Information</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Users size={18} />
                      </div>
                      <div>
                        <strong>{formData.playerName}</strong>
                        <span>Age {formData.playerAge} • {getSelectedSkillLevel()?.label} level</span>
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
                    <h3>Training Focus</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Target size={18} />
                      </div>
                      <div>
                        <strong>{getSelectedFocusArea()?.label}</strong>
                        <span>{getSelectedFocusArea()?.description}</span>
                      </div>
                    </div>
                  </div>

                  {formData.specialRequests && (
                    <div className={styles.summarySection}>
                      <h3>Special Requests</h3>
                      <div className={styles.summaryItem}>
                        <div className={styles.iconCircle}>
                          <Zap size={18} />
                        </div>
                        <div>
                          <span>{formData.specialRequests}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.terms}>
                  <p>By proceeding to payment, you agree to our training terms. Cancellations must be made at least 24 hours in advance.</p>
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
                  Complete Your Booking
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
                    <span>Subtotal ({formData.sessionCount} sessions)</span>
                    <span>${(getSelectedTraining()?.pricePerSession || 0) * formData.sessionCount}</span>
                  </div>
                  {getDiscount() > 0 && (
                    <div className={styles.totalRow}>
                      <span>Package Discount ({getDiscount() * 100}%)</span>
                      <span className={styles.discount}>-${((getSelectedTraining()?.pricePerSession || 0) * formData.sessionCount * getDiscount()).toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.totalMain}>
                    <span>Total Amount</span>
                    <strong>${calculateTotal().toFixed(2)}</strong>
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
              {isProcessing ? 'Processing...' : 'Confirm Booking'}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterTraining;