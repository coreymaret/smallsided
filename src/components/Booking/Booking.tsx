import React, { useState } from 'react';
import { Calendar, CalendarDays, Clock, Users, MapPin, ChevronRight, Check, CreditCard, Lock, Pointer } from 'lucide-react';
import styles from './Booking.module.scss';

const Booking: React.FC = () => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  
  const [formData, setFormData] = useState({
    field: '',
    month: '',
    day: '',
    year: '',
    timeSlot: '',
    duration: 1,
    players: 10,
    name: '',
    email: '',
    phone: '',
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
    }, 400); // Match the animation duration
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

  const validateStep3Fields = (): boolean => {
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

  const [timeSlotsPage, setTimeSlotsPage] = useState(0);
  const SLOTS_PER_PAGE = 6;

  const fields = [
    { id: 'field-1', name: 'Field 1', size: '40x60', capacity: '5v5', surface: 'Turf' },
    { id: 'field-2', name: 'Field 2', size: '50x80', capacity: '7v7', surface: 'Turf' },
    { id: 'field-3', name: 'Field 3', size: '60x100', capacity: '9v9', surface: 'Turf' }
  ];

  const generateTimeSlots = () => {
    const slots: Array<{
      id: string;
      time: string;
      hourValue: number;
      minuteValue: number;
      available: boolean;
      price: number;
    }> = [];
    const times = ['11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', 
                   '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', 
                   '10:00', '10:30', '11:00'];
    
    times.forEach((time, index) => {
      let period = 'PM';
      let hourValue = 12;
      
      // Handle 11:00 AM and 11:30 AM (first two slots)
      if (index === 0) {
        period = 'AM';
        hourValue = 11;
      } else if (index === 1) {
        period = 'AM';
        hourValue = 11;
      } else if (index === 2) {
        // 12:00 PM
        hourValue = 12;
      } else if (index < 24) {
        // Rest of PM times
        hourValue = Math.floor((index - 2) / 2) + 12;
      } else {
        // Last slot (11:00 PM)
        hourValue = 23;
      }
      
      slots.push({
        id: String(index + 1),
        time: `${time} ${period}`,
        hourValue: hourValue,
        minuteValue: index % 2 === 0 ? 0 : 30,
        available: ![3, 7].includes(index),
        price: index < 10 ? 80 : (index < 18 ? 100 : 120)
      });
    });
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getAvailableTimeSlots = () => {
    const cutoffHour = 23;
    
    return timeSlots.filter(slot => {
      const durationMinutes = formData.duration * 60;
      const startMinutes = slot.hourValue * 60 + slot.minuteValue;
      const endMinutes = startMinutes + durationMinutes;
      const endHour = Math.floor(endMinutes / 60);
      
      return endHour <= cutoffHour;
    });
  };

  const getPaginatedTimeSlots = () => {
    const availableSlots = getAvailableTimeSlots();
    const startIndex = timeSlotsPage * SLOTS_PER_PAGE;
    const endIndex = startIndex + SLOTS_PER_PAGE;
    return availableSlots.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const availableSlots = getAvailableTimeSlots();
    return Math.ceil(availableSlots.length / SLOTS_PER_PAGE);
  };

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

  // Generate days array, filtering out past dates if it's the current month/year
  const getAvailableDays = () => {
    const totalDays = getDaysInMonth(formData.month, formData.year || String(currentYear));
    const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
    
    // If current month and year, filter out past dates
    const selectedYear = parseInt(formData.year) || currentYear;
    const selectedMonth = parseInt(formData.month);
    
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      // Only show dates from today onwards
      return allDays.filter(day => day >= currentDay);
    }
    
    // For future months, show all days
    return allDays;
  };

  const days = getAvailableDays();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const isDateValid = () => {
    if (!formData.month || !formData.day || !formData.year) return false;
    
    const selectedDate = new Date(parseInt(formData.year), parseInt(formData.month) - 1, parseInt(formData.day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today;
  };

  const handleFieldSelect = (fieldId: string) => {
    setFormData({ ...formData, field: formData.field === fieldId ? '' : fieldId });
  };

  const handleDateChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'month' || field === 'year') {
      const selectedYear = parseInt(field === 'year' ? value : formData.year || String(currentYear));
      const selectedMonth = parseInt(field === 'month' ? value : formData.month);
      const selectedDay = parseInt(formData.day);
      
      // Check if month exceeds days in month
      const daysInMonth = getDaysInMonth(
        field === 'month' ? value : formData.month,
        field === 'year' ? value : (formData.year || String(currentYear))
      );
      if (selectedDay > daysInMonth) {
        newFormData.day = String(daysInMonth);
      }
      
      // If switching to current month/year, check if selected day is in the past
      if (selectedYear === currentYear && selectedMonth === currentMonth) {
        if (selectedDay < currentDay) {
          newFormData.day = ''; // Clear day selection if it's in the past
        }
      }
    }
    
    setFormData(newFormData);
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setFormData({ ...formData, timeSlot: formData.timeSlot === slotId ? '' : slotId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation errors when fields become valid
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
    
    // If user is deleting (new value is shorter), allow it
    if (newValue.length < oldValue.length) {
      // Just strip formatting and let them delete
      let digitsOnly = newValue.replace(/\D/g, '');
      
      // Format the remaining digits
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
      
      // Clear validation error if phone is now valid
      if (validatePhone(formatted)) {
        setValidationErrors(prev => ({ ...prev, phone: undefined }));
      }
      return;
    }
    
    // Otherwise, normal input - strip non-digits and format
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
    
    // Clear validation error if phone is now valid
    if (validatePhone(formatted)) {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
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

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.field !== '' && isDateValid();
      case 2:
        return formData.timeSlot !== '';
      case 3:
        return formData.name !== '' && formData.email !== '' && formData.phone !== '';
      default:
        return false;
    }
  };

  const calculateTotal = () => {
    const slot = timeSlots.find(s => s.id === formData.timeSlot);
    if (!slot) return 0;
    return slot.price * formData.duration;
  };

  const handleNext = () => {
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate Step 3 (Contact Information)
    if (step === 3 && !validateStep3Fields()) {
      return; // Don't proceed if validation fails
    }
    
    // Validate Step 4 (Payment Information)
    if (step === 4 && !validateStep4Fields()) {
      return; // Don't proceed if validation fails
    }
    
    if (canProceed() && step < 4) {
      setCompletedSteps(prev => new Set([...prev, step]));
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
      
      // Scroll to top of booking container with slight delay for render
      setTimeout(() => {
        const container = document.getElementById('booking-container');
        if (container) {
          const yOffset = -20; // 20px above the container
          const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      
      // Scroll to top of booking container with slight delay for render
      setTimeout(() => {
        const container = document.getElementById('booking-container');
        if (container) {
          const yOffset = -20; // 20px above the container
          const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep <= maxStepReached) {
      setStep(clickedStep);
      
      // Scroll to top of booking container with slight delay for render
      setTimeout(() => {
        const container = document.getElementById('booking-container');
        if (container) {
          const yOffset = -20; // 20px above the container
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
    
    // Show success animation
    setShowSuccessAnimation(true);
    
    console.log('Booking submitted:', formData, 'Total:', calculateTotal());
  };

  const getSelectedField = () => fields.find(f => f.id === formData.field);
  const getSelectedTimeSlot = () => timeSlots.find(s => s.id === formData.timeSlot);

  const getFormattedDate = () => {
    if (!formData.month || !formData.day || !formData.year) return '';
    const monthName = months.find(m => m.value === formData.month)?.label;
    return `${monthName} ${formData.day}, ${formData.year}`;
  };

  return (
    <div className={styles.booking}>
      {/* Success Banner - Option 4 with Close */}
      {showSuccessAnimation && (
        <>
          {/* Backdrop overlay - click to close */}
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
                <h3 className={styles.bannerTitle}>Booking Confirmed!</h3>
                <p className={styles.bannerSubtitle}>Your field reservation has been successfully processed</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Field</span>
                    <span className={styles.detailValue}>{getSelectedField()?.name}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>{getFormattedDate()}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Time</span>
                    <span className={styles.detailValue}>{getSelectedTimeSlot()?.time}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Duration</span>
                    <span className={styles.detailValue}>{formData.duration} hour{formData.duration > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Players</span>
                    <span className={styles.detailValue}>{formData.players}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
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

      <div className={styles.bookingHeader}>
        <h2 className={styles.bookingTitle}>Book Your Field</h2>
        <p className={styles.bookingSubtitle}>Reserve your time slot in just a few simple steps</p>
      </div>
      <div className={styles.container} id="booking-container">
        {/* Progress Bar */}
        <div className={styles.progress}>
          <div className={styles.progressSteps}>
            {[1, 2, 3, 4].map((s) => {
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
                    {s === 1 && 'Field & Date'}
                    {s === 2 && 'Time'}
                    {s === 3 && 'Details'}
                    {s === 4 && 'Confirm'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <div className={styles.content}>
          {/* Step 1: Field & Date Selection */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Select Field & Date</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Pointer size={20} />
                  </div>
                  Choose Your Field
                </h3>
                <div className={styles.fields}>
                  {fields.map((field) => {
                    const isSelected = formData.field === field.id;
                    return (
                      <button
                        key={field.id}
                        className={`${styles.fieldCard} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleFieldSelect(field.id)}
                      >
                        <div className={styles.fieldHeader}>
                          <div className={styles.fieldIconWrapper}>
                            <MapPin size={28} />
                          </div>
                          <h4 className={styles.fieldName}>{field.name}</h4>
                        </div>
                        <p className={styles.fieldSurface}>{field.surface} Surface</p>
                        <ul className={styles.fieldDetails}>
                          <li>
                            <Check size={16} />
                            {field.size} yards
                          </li>
                          <li>
                            <Check size={16} />
                            {field.capacity} capacity
                          </li>
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <CalendarDays size={22} />
                  </div>
                  Select Date
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
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Choose Time Slot</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Clock size={20} />
                  </div>
                  Available Times for {getFormattedDate()}
                </h3>
                
                <div className={styles.durationSelector}>
                  <label>Duration:</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => {
                      setFormData({ ...formData, duration: parseInt(e.target.value), timeSlot: '' });
                      setTimeSlotsPage(0); // Reset to first page when duration changes
                    }}
                    className={styles.durationDropdown}
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                  </select>
                </div>

                <div 
                  className={styles.timeSlots}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const startX = touch.clientX;
                    const handleTouchMove = (e: TouchEvent) => {
                      const touch = e.touches[0];
                      const diff = startX - touch.clientX;
                      if (Math.abs(diff) > 50) {
                        if (diff > 0 && timeSlotsPage < getTotalPages() - 1) {
                          setTimeSlotsPage(timeSlotsPage + 1);
                        } else if (diff < 0 && timeSlotsPage > 0) {
                          setTimeSlotsPage(timeSlotsPage - 1);
                        }
                        document.removeEventListener('touchmove', handleTouchMove);
                      }
                    };
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('touchend', () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                    }, { once: true });
                  }}
                >
                  {getPaginatedTimeSlots().map((slot) => {
                    const isSelected = formData.timeSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        className={`${styles.timeSlot} ${isSelected ? styles.selected : ''} ${!slot.available ? styles.unavailable : ''}`}
                        onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                        disabled={!slot.available}
                      >
                        <span className={styles.timeSlotTime}>{slot.time}</span>
                        <span className={styles.timeSlotPrice}>${slot.price}/hr</span>
                        {!slot.available && <span className={styles.timeSlotStatus}>Booked</span>}
                      </button>
                    );
                  })}
                </div>

                {getTotalPages() > 1 && (
                  <>
                    <div className={styles.pagination}>
                      <svg 
                        width={getTotalPages() * 20} 
                        height={20}
                        style={{ overflow: 'visible' }}
                      >
                        {/* Render static background dots */}
                        {Array.from({ length: getTotalPages() }).map((_, index) => {
                          return (
                            <circle
                              key={`dot-${index}`}
                              cx={index * 20 + 10}
                              cy={10}
                              r={4}
                              fill="#d3d3d3"
                              opacity={0.6}
                              style={{
                                cursor: 'pointer'
                              }}
                              onClick={() => setTimeSlotsPage(index)}
                            />
                          );
                        })}
                        
                        {/* Animated liquid blob that moves between dots */}
                        <circle
                          cx={timeSlotsPage * 20 + 10}
                          cy={10}
                          r={5}
                          fill="#98ED66"
                          opacity={1}
                          style={{
                            transition: 'cx 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)',
                            pointerEvents: 'none'
                          }}
                        />
                      </svg>
                    </div>
                    <div className={styles.paginationControls}>
                      <button
                        className={styles.paginationButton}
                        onClick={() => setTimeSlotsPage(Math.max(0, timeSlotsPage - 1))}
                        disabled={timeSlotsPage === 0}
                      >
                        Previous
                      </button>
                      <button
                        className={styles.paginationButton}
                        onClick={() => setTimeSlotsPage(Math.min(getTotalPages() - 1, timeSlotsPage + 1))}
                        disabled={timeSlotsPage === getTotalPages() - 1}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Your Information</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Users size={20} />
                  </div>
                  Contact Details
                </h3>
                
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.name ? styles.active : ''}`}>
                      Full Name *
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
                      name="players"
                      value={formData.players}
                      onChange={handleInputChange}
                      placeholder="Number of Players"
                      min="2"
                      max="22"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${styles.active}`}>
                      Number of Players
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Confirm Your Booking</h2>
              
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>Field Details</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <strong>{getSelectedField()?.name}</strong>
                        <span>{getSelectedField()?.size} yards • {getSelectedField()?.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Date & Time</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <strong>{getFormattedDate()}</strong>
                        <span>{getSelectedTimeSlot()?.time} • {formData.duration} hour{formData.duration > 1 ? 's' : ''}</span>
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
                        <strong>{formData.name}</strong>
                        <span>{formData.email}</span>
                        <span>{formData.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.payment}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}>
                      <CreditCard size={20} />
                    </div>
                    Payment Information
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
                </div>

                <div className={styles.total}>
                  <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <div className={styles.totalMain}>
                    <span>Total Amount</span>
                    <strong>${calculateTotal()}</strong>
                  </div>
                </div>

                <div className={styles.terms}>
                  <p>By confirming this booking, you agree to our cancellation policy. Cancellations made less than 24 hours before the scheduled time are non-refundable.</p>
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
          
          {step < 4 ? (
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
              Confirm Booking
              <Check size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;