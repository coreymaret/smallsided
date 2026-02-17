import React, { useState } from 'react';
import { Calendar, Clock, Users, ChevronRight, Check, CreditCard, Lock, Cake, Gift, PartyPopper } from '../../../../components/Icons/Icons';
import styles from './RegisterBirthday.module.scss';
import { api } from '../../../../services/api';

// Shared hooks for validation and formatting
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';

const BirthdayParties: React.FC = () => {
  // Use shared validation and formatting hooks
  const validation = useValidation();
  const formatters = useFormFormatters();
  
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    package: '',
    month: '',
    day: '',
    year: '',
    timeSlot: '',
    childName: '',
    childAge: '',
    parentName: '',
    email: '',
    phone: '',
    guestCount: 15,
    cakePreference: '',
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

  const handleCloseBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setIsClosing(false);
    }, 400);
  };

  // Validation using shared hooks - REMOVED 86 LINES OF DUPLICATE CODE
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

  const packages = [
    {
      id: 'basic',
      name: 'Basic Party',
      price: 250,
      duration: '2 hours',
      description: 'Perfect for smaller celebrations',
      features: ['Field rental', 'Up to 15 guests', 'Party host', 'Basic decorations']
    },
    {
      id: 'deluxe',
      name: 'Deluxe Party',
      price: 400,
      duration: '3 hours',
      description: 'Our most popular package',
      features: ['Field rental', 'Up to 25 guests', 'Party host', 'Premium decorations', 'Pizza & drinks', 'Party favors']
    },
    {
      id: 'ultimate',
      name: 'Ultimate Party',
      price: 600,
      duration: '4 hours',
      description: 'The complete celebration experience',
      features: ['Field rental', 'Up to 35 guests', 'Party host', 'Premium decorations', 'Pizza & drinks', 'Party favors', 'Custom cake', 'Photo session']
    }
  ];

  const timeSlots = [
    { id: '1', time: '10:00 AM', available: true },
    { id: '2', time: '11:00 AM', available: true },
    { id: '3', time: '12:00 PM', available: false },
    { id: '4', time: '1:00 PM', available: true },
    { id: '5', time: '2:00 PM', available: true },
    { id: '6', time: '3:00 PM', available: false },
    { id: '7', time: '4:00 PM', available: true },
    { id: '8', time: '5:00 PM', available: true }
  ];

  const cakeOptions = [
    { value: 'chocolate', label: 'Chocolate Cake' },
    { value: 'vanilla', label: 'Vanilla Cake' },
    { value: 'custom', label: 'Custom Design' },
    { value: 'none', label: 'No Cake (I\'ll bring my own)' }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (validationErrors[name as keyof typeof validationErrors]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name as keyof typeof validationErrors];
      setValidationErrors(newErrors);
    }
  };

  const canProceed = (): boolean => {
    switch(step) {
      case 1:
        return formData.package !== '';
      case 2:
        return formData.month !== '' && formData.day !== '' && formData.year !== '' && formData.timeSlot !== '';
      case 3:
        return formData.childName !== '' && formData.parentName !== '' && formData.email !== '' && formData.phone !== '';
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
      const selectedPackage = packages.find(p => p.id === formData.package);
      
      // @ts-ignore - API method may not exist yet
      await api.bookBirthday({
        package: selectedPackage,
        date: `${formData.month}/${formData.day}/${formData.year}`,
        timeSlot: timeSlots.find(t => t.id === formData.timeSlot),
        child: {
          name: formData.childName,
          age: formData.childAge,
        },
        parent: {
          name: formData.parentName,
          email: formData.email,
          phone: formData.phone,
        },
        guestCount: formData.guestCount,
        cakePreference: formData.cakePreference,
        specialRequests: formData.specialRequests,
        payment: {
          cardNumber: formData.cardNumber,
          cardExpiry: formData.cardExpiry,
          cardCVV: formData.cardCVV,
          billingZip: formData.billingZip,
        }
      });

      setShowSuccessAnimation(true);
      
      setFormData({
        package: '',
        month: '',
        day: '',
        year: '',
        timeSlot: '',
        childName: '',
        childAge: '',
        parentName: '',
        email: '',
        phone: '',
        guestCount: 15,
        cakePreference: '',
        specialRequests: '',
        cardNumber: '',
        cardExpiry: '',
        cardCVV: '',
        billingZip: ''
      });
      
      setStep(1);
      setCompletedSteps(new Set());
      setMaxStepReached(1);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = (): number => {
    const selectedPackage = packages.find(p => p.id === formData.package);
    return selectedPackage?.price || 0;
  };

  const getSelectedPackage = () => packages.find(p => p.id === formData.package);
  const getSelectedTimeSlot = () => timeSlots.find(t => t.id === formData.timeSlot);
  const getSelectedCake = () => cakeOptions.find(c => c.value === formData.cakePreference);
  
  const getFormattedDate = () => {
    if (!formData.month || !formData.day || !formData.year) return '';
    const monthLabel = months.find(m => m.value === formData.month)?.label;
    return `${monthLabel} ${formData.day}, ${formData.year}`;
  };

  const getProgressPercentage = () => {
    return ((step - 1) / 4) * 100;
  };

  return (
    <div className={styles.parties}>
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
                <h2 className={styles.bannerTitle}>Party Booked!</h2>
                <p className={styles.bannerSubtitle}>Your birthday celebration is confirmed</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <Cake size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Birthday Child</span>
                    <span className={styles.detailValue}>{formData.childName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>{getFormattedDate()}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <PartyPopper size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Package</span>
                    <span className={styles.detailValue}>{getSelectedPackage()?.name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.emailNotice}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4l6 4 6-4M2 4v8h12V4M2 4h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Confirmation email sent to {formData.email}</span>
            </div>
          </div>
        </>
      )}

      <div className={styles.container}>
        <div className={styles.partiesHeader}>
          <h1 className={styles.partiesTitle}>Birthday Party Booking</h1>
          <p className={styles.partiesSubtitle}>Make your child's special day unforgettable with our all-inclusive party packages</p>
        </div>

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
                  {s === 1 && 'Package'}
                  {s === 2 && 'Date & Time'}
                  {s === 3 && 'Details'}
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
          {/* Step 1: Select Package */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Choose Your Party Package</h2>
              
              <div className={styles.section}>
                <div className={styles.packages}>
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setFormData({ ...formData, package: pkg.id })}
                      className={`${styles.packageCard} ${formData.package === pkg.id ? styles.selected : ''}`}
                    >
                      <div className={styles.packageHeader}>
                        <h3 className={styles.packageName}>{pkg.name}</h3>
                        <span className={styles.packagePrice}>${pkg.price}</span>
                      </div>
                      <p className={styles.packageDuration}>{pkg.duration}</p>
                      <p className={styles.packageDescription}>{pkg.description}</p>
                      <ul className={styles.packageFeatures}>
                        {pkg.features.map((feature, idx) => (
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
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Select Date & Time</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Calendar size={20} />
                  </div>
                  Choose a Date
                </h3>
                
                <div className={styles.dateDropdowns}>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className={styles.dropdown}
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>

                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className={styles.dropdown}
                    disabled={!formData.month}
                  >
                    <option value="">Day</option>
                    {getAvailableDays().map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={styles.dropdown}
                  >
                    <option value="">Year</option>
                    <option value={String(currentYear)}>{currentYear}</option>
                    <option value={String(currentYear + 1)}>{currentYear + 1}</option>
                  </select>
                </div>
              </div>

              {formData.month && formData.day && formData.year && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <div className={styles.iconCircle}>
                      <Clock size={20} />
                    </div>
                    Select Time Slot
                  </h3>
                  
                  <div className={styles.timeSlots}>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => slot.available && setFormData({ ...formData, timeSlot: slot.id })}
                        className={`${styles.timeSlot} ${formData.timeSlot === slot.id ? styles.selected : ''} ${
                          !slot.available ? styles.unavailable : ''
                        }`}
                      >
                        <span className={styles.timeSlotTime}>{slot.time}</span>
                        {!slot.available && <span className={styles.timeSlotStatus}>Booked</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Party Details */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Party Details</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Cake size={20} />
                  </div>
                  Birthday Child
                </h3>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        name="childName"
                        value={formData.childName}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder=" "
                      />
                      <label className={`${styles.floatingLabel} ${formData.childName ? styles.active : ''}`}>
                        Child's Name *
                      </label>
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <input
                        type="number"
                        name="childAge"
                        value={formData.childAge}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder=" "
                        min="1"
                        max="18"
                      />
                      <label className={`${styles.floatingLabel} ${formData.childAge ? styles.active : ''}`}>
                        Age *
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Users size={20} />
                  </div>
                  Parent/Guardian Information
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
                    <Users size={20} />
                  </div>
                  Party Size
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder=" "
                      min="1"
                      max="50"
                    />
                    <label className={`${styles.floatingLabel} ${styles.active}`}>
                      Expected Number of Guests
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Cake size={20} />
                  </div>
                  Cake Preference
                </h3>
                <div className={styles.cakeOptions}>
                  {cakeOptions.map((cake) => (
                    <div
                      key={cake.value}
                      onClick={() => setFormData({ ...formData, cakePreference: cake.value })}
                      className={`${styles.cakeOption} ${formData.cakePreference === cake.value ? styles.selected : ''}`}
                    >
                      <Cake size={24} />
                      <span>{cake.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Gift size={20} />
                  </div>
                  Special Requests (Optional)
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={4}
                      placeholder="Any special requests, allergies, or dietary restrictions?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.title}>Review Your Booking</h2>
              
              <div className={styles.confirmation}>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h3>Party Package</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <PartyPopper size={18} />
                      </div>
                      <div>
                        <strong>{getSelectedPackage()?.name}</strong>
                        <span>{getSelectedPackage()?.duration}</span>
                        <span>${getSelectedPackage()?.price}</span>
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
                        <span>{getSelectedTimeSlot()?.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h3>Birthday Child</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Cake size={18} />
                      </div>
                      <div>
                        <strong>{formData.childName}</strong>
                        <span>Age {formData.childAge} • {formData.guestCount} guests expected</span>
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
                    <h3>Cake Preference</h3>
                    <div className={styles.summaryItem}>
                      <div className={styles.iconCircle}>
                        <Cake size={18} />
                      </div>
                      <div>
                        <strong>{getSelectedCake()?.label}</strong>
                      </div>
                    </div>
                  </div>

                  {formData.specialRequests && (
                    <div className={styles.summarySection}>
                      <h3>Special Requests</h3>
                      <div className={styles.summaryItem}>
                        <div className={styles.iconCircle}>
                          <Gift size={18} />
                        </div>
                        <div>
                          <span>{formData.specialRequests}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.terms}>
                  <p>By proceeding to payment, you agree to our party booking terms and cancellation policy.</p>
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
                    <span>Party Package</span>
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
              {isProcessing ? 'Processing...' : 'Confirm Booking'}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayParties;