import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CalendarDays, Clock, Users, MapPin, ChevronRight, Check, Pointer, CreditCard, Lock } from '../../../../components/Icons/Icons';
import styles from './RegisterFieldRental.module.scss';
import { api } from '../../../../services/api';

// Shared hooks for validation and formatting
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';

const RegisterFieldRental: React.FC = () => {
  const { t } = useTranslation();

  // Use shared validation and formatting hooks
  const validation = useValidation();
  const formatters = useFormFormatters();
  
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [timeSlotsPage, setTimeSlotsPage] = useState(0);
  const SLOTS_PER_PAGE = 6;
  
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
    }, 400);
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

  const validateStep4Fields = (): boolean => {
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

  const fields = [
    { id: 'field-1', name: t('register.fieldRental.fields.field1'), size: '40x60', capacity: '5v5', surface: t('register.fieldRental.fields.surface') },
    { id: 'field-2', name: t('register.fieldRental.fields.field2'), size: '50x80', capacity: '7v7', surface: t('register.fieldRental.fields.surface') },
    { id: 'field-3', name: t('register.fieldRental.fields.field3'), size: '60x100', capacity: '9v9', surface: t('register.fieldRental.fields.surface') }
  ];

  const generateTimeSlots = () => {
    const slots: Array<{
      id: string;
      time: string;
      hourValue: number;
      price: number;
      available: boolean;
    }> = [];
    
    for (let hour = 8; hour <= 20; hour++) {
      const isPeakHour = hour >= 17 && hour <= 20;
      const price = isPeakHour ? 150 : 100;
      const isAvailable = Math.random() > 0.3;
      
      slots.push({
        id: `slot-${hour}`,
        time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
        hourValue: hour,
        price,
        available: isAvailable
      });
    }
    
    return slots;
  };

  const allTimeSlots = generateTimeSlots();
  const availableTimeSlots = allTimeSlots.filter(slot => slot.available);
  const paginatedTimeSlots = availableTimeSlots.slice(
    timeSlotsPage * SLOTS_PER_PAGE,
    (timeSlotsPage + 1) * SLOTS_PER_PAGE
  );
  const totalPages = Math.ceil(availableTimeSlots.length / SLOTS_PER_PAGE);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  const months = [
    { value: '1', label: t('register.months.january') },
    { value: '2', label: t('register.months.february') },
    { value: '3', label: t('register.months.march') },
    { value: '4', label: t('register.months.april') },
    { value: '5', label: t('register.months.may') },
    { value: '6', label: t('register.months.june') },
    { value: '7', label: t('register.months.july') },
    { value: '8', label: t('register.months.august') },
    { value: '9', label: t('register.months.september') },
    { value: '10', label: t('register.months.october') },
    { value: '11', label: t('register.months.november') },
    { value: '12', label: t('register.months.december') },
  ];

  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const getAvailableDays = () => {
    if (!formData.month) return [];
    
    const selectedYear = formData.year ? parseInt(formData.year) : currentYear;
    const totalDays = getDaysInMonth(formData.month, String(selectedYear));
    const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
    
    const selectedMonth = parseInt(formData.month);
    
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return allDays.filter(day => day >= currentDay);
    }
    
    return allDays;
  };

  const handleFieldSelect = (fieldId: string) => {
    setFormData({ ...formData, field: formData.field === fieldId ? '' : fieldId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (validationErrors[name as keyof typeof validationErrors]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name as keyof typeof validationErrors];
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

  const handleTimeSlotSelect = (slotId: string) => {
    setFormData({ ...formData, timeSlot: formData.timeSlot === slotId ? '' : slotId });
  };

  const canProceed = (): boolean => {
    switch(step) {
      case 1:
        return formData.field !== '';
      case 2:
        return formData.month !== '' && formData.day !== '' && formData.year !== '' && formData.timeSlot !== '';
      case 3:
        return formData.name !== '' && formData.email !== '' && formData.phone !== '';
      case 4:
        return formData.cardNumber !== '' && formData.cardExpiry !== '' && formData.cardCVV !== '' && formData.billingZip !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && !validateStep3Fields()) {
      return;
    }
    
    if (step === 4 && !validateStep4Fields()) {
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
    if (!validateStep4Fields()) return;

    setIsProcessing(true);

    try {
      const selectedField = fields.find(f => f.id === formData.field);
      const selectedSlot = allTimeSlots.find(s => s.id === formData.timeSlot);
      
      // @ts-ignore - API method may not exist yet
      await api.bookFieldRental({
        field: selectedField,
        date: `${formData.month}/${formData.day}/${formData.year}`,
        timeSlot: selectedSlot,
        duration: formData.duration,
        players: formData.players,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
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
      
      setStep(1);
      setCompletedSteps(new Set());
      setMaxStepReached(1);
    } catch (error) {
      console.error('Booking failed:', error);
      alert(t('register.fieldRental.errors.bookingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedField = () => fields.find(f => f.id === formData.field);
  const getSelectedTimeSlot = () => allTimeSlots.find(s => s.id === formData.timeSlot);
  
  const getFormattedDate = () => {
    if (!formData.month || !formData.day || !formData.year) return '';
    const monthLabel = months.find(m => m.value === formData.month)?.label;
    return `${monthLabel} ${formData.day}, ${formData.year}`;
  };

  const calculateTotal = () => {
    const slot = getSelectedTimeSlot();
    return slot ? slot.price * formData.duration : 0;
  };

  const getProgressPercentage = () => {
    return ((step - 1) / 3) * 100;
  };

  return (
    <div className={styles.booking}>
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
                <h2 className={styles.bannerTitle}>{t('register.fieldRental.success.title')}</h2>
                <p className={styles.bannerSubtitle}>{t('register.fieldRental.success.subtitle')}</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <MapPin size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.fieldRental.success.field')}</span>
                    <span className={styles.detailValue}>{getSelectedField()?.name}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.fieldRental.success.date')}</span>
                    <span className={styles.detailValue}>{getFormattedDate()}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Clock size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.fieldRental.success.time')}</span>
                    <span className={styles.detailValue}>{getSelectedTimeSlot()?.time}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.emailNotice}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4l6 4 6-4M2 4v8h12V4M2 4h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{t('register.fieldRental.success.emailNotice', { email: formData.email })}</span>
            </div>
          </div>
        </>
      )}

      <div className={styles.container}>
        {/* Progress Bar */}
        <div className={styles.progress}>
          <div className={styles.progressSteps}>
            {[1, 2, 3, 4].map((s) => (
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
                  {s === 1 && t('register.fieldRental.steps.selectField')}
                  {s === 2 && t('register.fieldRental.steps.dateTime')}
                  {s === 3 && t('register.fieldRental.steps.yourInfo')}
                  {s === 4 && t('register.fieldRental.steps.payment')}
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
          {/* Step 1: Select Field */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.selectField')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <MapPin size={20} />
                  </div>
                  {t('register.fieldRental.fields.availableFields')}
                </h3>
                <div className={styles.fields}>
                  {fields.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => handleFieldSelect(field.id)}
                      className={`${styles.fieldCard} ${formData.field === field.id ? styles.selected : ''}`}
                    >
                      <div className={styles.fieldHeader}>
                        <div className={styles.fieldIconWrapper}>
                          <MapPin size={24} />
                        </div>
                        <h3 className={styles.fieldName}>{field.name}</h3>
                      </div>
                      <p className={styles.fieldSurface}>{field.surface} {t('register.fieldRental.fields.surfaceLabel')}</p>
                      <ul className={styles.fieldDetails}>
                        <li>
                          <MapPin size={14} color="#15141a" />
                          {t('register.fieldRental.fields.size')}: {field.size}
                        </li>
                        <li>
                          <Users size={14} color="#15141a" />
                          {t('register.fieldRental.fields.capacity')}: {field.capacity}
                        </li>
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.dateTime')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Calendar size={20} />
                  </div>
                  {t('register.fieldRental.date.chooseDate')}
                </h3>
                
                <div className={styles.dateDropdowns}>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className={styles.dropdown}
                  >
                    <option value="">{t('register.months.selectMonth')}</option>
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
                    <option value="">{t('register.months.day')}</option>
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
                    <option value="">{t('register.months.year')}</option>
                    <option value={String(currentYear)}>{currentYear}</option>
                    <option value={String(currentYear + 1)}>{currentYear + 1}</option>
                  </select>
                </div>
              </div>

              {formData.month && formData.day && formData.year && (
                <>
                  <div className={styles.section}>
                    <div className={styles.durationSelector}>
                      <label>{t('register.fieldRental.date.duration')}</label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className={styles.durationDropdown}
                      >
                        {[1, 2, 3, 4].map(hours => (
                          <option key={hours} value={hours}>
                            {hours} {hours === 1 ? t('register.fieldRental.date.hour') : t('register.fieldRental.date.hours')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <div className={styles.iconCircle}>
                        <Clock size={20} />
                      </div>
                      {t('register.fieldRental.date.availableSlots')}
                    </h3>
                    
                    <div className={styles.timeSlots}>
                      {paginatedTimeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleTimeSlotSelect(slot.id)}
                          className={`${styles.timeSlot} ${formData.timeSlot === slot.id ? styles.selected : ''}`}
                        >
                          <span className={styles.timeSlotTime}>{slot.time}</span>
                          <span className={styles.timeSlotPrice}>${slot.price}/hr</span>
                        </button>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <>
                        <div className={styles.pagination}>
                          <svg 
                            width={totalPages * 20} 
                            height={20}
                            style={{ overflow: 'visible' }}
                          >
                            {Array.from({ length: totalPages }).map((_, index) => {
                              return (
                                <circle
                                  key={`dot-${index}`}
                                  cx={index * 20 + 10}
                                  cy={10}
                                  r={4}
                                  fill="#d3d3d3"
                                  opacity={0.6}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setTimeSlotsPage(index)}
                                />
                              );
                            })}
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
                            {t('register.pagination.previous')}
                          </button>
                          <button
                            className={styles.paginationButton}
                            onClick={() => setTimeSlotsPage(Math.min(totalPages - 1, timeSlotsPage + 1))}
                            disabled={timeSlotsPage === totalPages - 1}
                          >
                            {t('register.pagination.next')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.yourInfo')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Pointer size={20} />
                  </div>
                  {t('register.contact.contactDetails')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder=" "
                    />
                    <label className={`${styles.floatingLabel} ${formData.name ? styles.active : ''}`}>
                      {t('register.contact.fullName')} *
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
                      {t('register.contact.email')} *
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
                      {t('register.contact.phone')} *
                    </label>
                    {validationErrors.phone && (
                      <span className={styles.errorMessage}>{validationErrors.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.inputGroup}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {t('register.fieldRental.contact.expectedPlayers')}
                  </label>
                  <input
                    type="number"
                    name="players"
                    value={formData.players}
                    onChange={handleInputChange}
                    className={styles.input}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.payment')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <CreditCard size={20} />
                  </div>
                  {t('register.payment.completeBooking')}
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
                      {t('register.payment.cardNumber')} *
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
                        {t('register.payment.expiry')} *
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
                        {t('register.payment.cvv')} *
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
                      {t('register.payment.billingZip')} *
                    </label>
                    {validationErrors.billingZip && (
                      <span className={styles.errorMessage}>{validationErrors.billingZip}</span>
                    )}
                  </div>

                  <div className={styles.securityNotice}>
                    <Lock size={16} />
                    <span>{t('register.payment.securityNotice')}</span>
                  </div>
                </div>

                <div className={styles.total}>
                  <div className={styles.totalRow}>
                    <span>{t('register.fieldRental.payment.rentalLabel', { duration: formData.duration })}</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <div className={styles.totalMain}>
                    <span>{t('register.payment.total')}</span>
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
              {t('register.nav.back')}
            </button>
          )}
          
          {step < 4 ? (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {t('register.nav.continue')}
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? t('register.nav.processing') : t('register.nav.confirmBooking')}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterFieldRental;