import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Calendar, Clock, Users, MapPin, ChevronRight, Check, Pointer, CreditCard, Lock } from '../../../../components/Icons/Icons';
import styles from './RegisterFieldRental.module.scss';
import { api } from '../../../../services/api';
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';
import { useSendEmail } from '../../../../hooks/useSendEmail';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Generate time slots ONCE outside component so they never re-randomize ───
const STATIC_TIME_SLOTS = (() => {
  const slots: Array<{ id: string; time: string; hourValue: number; price: number; available: boolean }> = [];
  for (let hour = 8; hour <= 20; hour++) {
    const isPeakHour = hour >= 17 && hour <= 20;
    slots.push({
      id:        `slot-${hour}`,
      time:      `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
      hourValue: hour,
      price:     isPeakHour ? 150 : 100,
      available: Math.random() > 0.3,
    });
  }
  return slots;
})();

const STRIPE_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#15141a',
      fontWeight: '400',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

// ─── Track which Stripe fields have been focused (for label animation) ────────
interface StripeFieldState {
  cardNumber: boolean;
  cardExpiry: boolean;
  cardCvc:    boolean;
}

const FormContent: React.FC<{ t: (key: string, opts?: any) => string }> = ({ t }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const validation  = useValidation();
  const formatters  = useFormFormatters();
  const { sendEmail } = useSendEmail();

  const [step, setStep]             = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isProcessing, setIsProcessing]     = useState(false);
  const [timeSlotsPage, setTimeSlotsPage]   = useState(0);
  const [cardError, setCardError]           = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isClosing, setIsClosing]           = useState(false);
  const SLOTS_PER_PAGE = 6;

  // Track Stripe field focus for floating label animation
  const [stripeFocused, setStripeFocused] = useState<StripeFieldState>({
    cardNumber: false, cardExpiry: false, cardCvc: false,
  });

  // Save booking details before form reset so success banner shows correct info
  const [successDetails, setSuccessDetails] = useState<{
    fieldName: string; date: string; time: string; email: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    field: '', month: '', day: '', year: '', timeSlot: '',
    duration: 1, players: 10, name: '', email: '', phone: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string; phone?: string;
  }>({});

  const handleCloseBanner = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setShowSuccessAnimation(false); setIsClosing(false); }, 400);
  }, []);

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

  const fields = useMemo(() => [
    { id: 'field-1', name: t('register.fieldRental.fields.field1'), size: '40x60',  capacity: '5v5', surface: t('register.fieldRental.fields.surface') },
    { id: 'field-2', name: t('register.fieldRental.fields.field2'), size: '50x80',  capacity: '7v7', surface: t('register.fieldRental.fields.surface') },
    { id: 'field-3', name: t('register.fieldRental.fields.field3'), size: '60x100', capacity: '9v9', surface: t('register.fieldRental.fields.surface') },
  ], [t]);

  const allTimeSlots       = STATIC_TIME_SLOTS;
  const availableTimeSlots = useMemo(() => allTimeSlots.filter(s => s.available), []);
  const paginatedTimeSlots = useMemo(() =>
    availableTimeSlots.slice(timeSlotsPage * SLOTS_PER_PAGE, (timeSlotsPage + 1) * SLOTS_PER_PAGE),
    [availableTimeSlots, timeSlotsPage]
  );
  const totalPages = Math.ceil(availableTimeSlots.length / SLOTS_PER_PAGE);

  const currentDate  = new Date();
  const currentYear  = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay   = currentDate.getDate();

  const months = useMemo(() => [
    { value: '1',  label: t('register.months.january')   },
    { value: '2',  label: t('register.months.february')  },
    { value: '3',  label: t('register.months.march')     },
    { value: '4',  label: t('register.months.april')     },
    { value: '5',  label: t('register.months.may')       },
    { value: '6',  label: t('register.months.june')      },
    { value: '7',  label: t('register.months.july')      },
    { value: '8',  label: t('register.months.august')    },
    { value: '9',  label: t('register.months.september') },
    { value: '10', label: t('register.months.october')   },
    { value: '11', label: t('register.months.november')  },
    { value: '12', label: t('register.months.december')  },
  ], [t]);

  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const getAvailableDays = () => {
    if (!formData.month) return [];
    const selectedYear  = formData.year ? parseInt(formData.year) : currentYear;
    const totalDays     = getDaysInMonth(formData.month, String(selectedYear));
    const allDays       = Array.from({ length: totalDays }, (_, i) => i + 1);
    const selectedMonth = parseInt(formData.month);
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return allDays.filter(day => day >= currentDay);
    }
    return allDays;
  };

  const handleFieldSelect    = (id: string) => setFormData(f => ({ ...f, field: f.field === id ? '' : id }));
  const handleTimeSlotSelect = (id: string) => setFormData(f => ({ ...f, timeSlot: f.timeSlot === id ? '' : id }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[name as keyof typeof validationErrors]; return n; });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.phone);
    setFormData(f => ({ ...f, phone: formatted }));
    if (validation.validatePhone(formatted)) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.phone; return n; });
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return formData.field !== '';
      case 2: return formData.month !== '' && formData.day !== '' && formData.year !== '' && formData.timeSlot !== '';
      case 3: return formData.name !== '' && formData.email !== '' && formData.phone !== '';
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && !validateStep3Fields()) return;
    if (!canProceed()) return;
    setCompletedSteps(prev => new Set([...prev, step]));
    const next = step + 1;
    setStep(next);
    if (next > maxStepReached) setMaxStepReached(next);
  };

  const handleBack      = () => { if (step > 1) setStep(s => s - 1); };
  const handleStepClick = (s: number) => { if (s <= maxStepReached) setStep(s); };

  const getSelectedField    = () => fields.find(f => f.id === formData.field);
  const getSelectedTimeSlot = () => allTimeSlots.find(s => s.id === formData.timeSlot);
  const getFormattedDate    = () => {
    if (!formData.month || !formData.day || !formData.year) return '';
    return `${months.find(m => m.value === formData.month)?.label} ${formData.day}, ${formData.year}`;
  };
  const calculateTotal        = () => { const slot = getSelectedTimeSlot(); return slot ? slot.price * Number(formData.duration) : 0; };
  const getProgressPercentage = () => ((step - 1) / 3) * 100;

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    const cardNumberEl = elements.getElement(CardNumberElement);
    if (!cardNumberEl) return;

    setIsProcessing(true);
    setCardError(null);

    try {
      const selectedField = getSelectedField();
      const selectedSlot  = getSelectedTimeSlot();
      const total         = calculateTotal();
      const bookingDate   = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`;

      // Save details BEFORE resetting form so success banner shows correct info
      const details = {
        fieldName: selectedField?.name ?? '',
        date:      getFormattedDate(),
        time:      selectedSlot?.time ?? '',
        email:     formData.email,
      };

      // 1. Create payment intent
      const { clientSecret } = await api.createPaymentIntent(
        total * 100,
        `Field Rental - ${selectedField?.name} - ${bookingDate}`
      );

      // 2. Confirm card payment via Stripe Elements
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberEl,
          billing_details: { name: formData.name, email: formData.email, phone: formData.phone },
        },
      });

      if (stripeError) {
        setCardError(stripeError.message ?? 'Payment failed. Please try again.');
        return;
      }
      if (paymentIntent?.status !== 'succeeded') {
        setCardError('Payment was not completed. Please try again.');
        return;
      }

      // 3. Save booking to Supabase
      await api.createBooking({
        booking_type:             'field_rental',
        customer_name:            formData.name,
        customer_email:           formData.email,
        customer_phone:           formData.phone,
        booking_date:             bookingDate,
        start_time:               selectedSlot ? `${String(selectedSlot.hourValue).padStart(2, '0')}:00` : undefined,
        end_time:                 selectedSlot ? `${String(selectedSlot.hourValue + Number(formData.duration)).padStart(2, '0')}:00` : undefined,
        field_id:                 formData.field,
        participants:             formData.players,
        total_amount:             total,
        stripe_payment_intent_id: paymentIntent.id,
        metadata: { field_name: selectedField?.name, duration: formData.duration, time_slot: selectedSlot?.time },
      });

      // 4. Send confirmation email
      await sendEmail({
        type: 'confirmation',
        booking: {
          id:            paymentIntent.id,
          customerName:  formData.name,
          customerEmail: formData.email,
          service:       'field_rental',
          bookingDate,
          startTime:     selectedSlot ? `${String(selectedSlot.hourValue).padStart(2, '0')}:00` : null,
          endTime:       selectedSlot ? `${String(selectedSlot.hourValue + Number(formData.duration)).padStart(2, '0')}:00` : null,
          fieldId:       formData.field,
          participants:  formData.players,
          totalAmount:   total,
          metadata:      { field_name: selectedField?.name },
        },
      });

      // 5. Show success with saved details, then reset form
      setSuccessDetails(details);
      setShowSuccessAnimation(true);
      setFormData({ field: '', month: '', day: '', year: '', timeSlot: '', duration: 1, players: 10, name: '', email: '', phone: '' });
      setStep(1);
      setCompletedSteps(new Set());
      setMaxStepReached(1);
      setStripeFocused({ cardNumber: false, cardExpiry: false, cardCvc: false });
      cardNumberEl.clear();

    } catch (error: any) {
      console.error('Booking failed:', error);
      setCardError(error?.message ?? t('register.fieldRental.errors.bookingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.booking}>
      {/* Success Banner */}
      {showSuccessAnimation && successDetails && (
        <>
          <div className={`${styles.bannerBackdrop} ${isClosing ? styles.backdropClosing : ''}`} onClick={handleCloseBanner} />
          <div className={`${styles.successBanner} ${isClosing ? styles.closing : ''}`}>
            <button className={styles.closeButton} onClick={handleCloseBanner}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className={styles.bannerHeader}>
              <div className={styles.bannerIcon}><Check size={32} strokeWidth={3} color="#15141a" /></div>
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
                    <span className={styles.detailValue}>{successDetails.fieldName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.fieldRental.success.date')}</span>
                    <span className={styles.detailValue}>{successDetails.date}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Clock size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.fieldRental.success.time')}</span>
                    <span className={styles.detailValue}>{successDetails.time}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.emailNotice}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4l6 4 6-4M2 4v8h12V4M2 4h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{t('register.fieldRental.success.emailNotice', { email: successDetails.email })}</span>
            </div>
          </div>
        </>
      )}

      <div className={styles.container}>
        {/* Progress Bar */}
        <div className={styles.progress}>
          <div className={styles.progressSteps}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s}
                className={`${styles.progressStep} ${s === step ? styles.active : ''} ${completedSteps.has(s) ? styles.completed : ''} ${s <= maxStepReached ? styles.clickable : ''}`}
                onClick={() => handleStepClick(s)}>
                <div className={styles.progressCircle}>{completedSteps.has(s) ? <Check size={16} /> : s}</div>
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
            <div className={styles.progressFill} style={{ width: `${getProgressPercentage()}%` }} />
          </div>
        </div>

        <div className={styles.content}>

          {/* Step 1: unchanged */}
          {step === 1 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.selectField')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><MapPin size={20} /></div>
                  {t('register.fieldRental.fields.availableFields')}
                </h3>
                <div className={styles.fields}>
                  {fields.map((field) => (
                    <button key={field.id} onClick={() => handleFieldSelect(field.id)}
                      className={`${styles.fieldCard} ${formData.field === field.id ? styles.selected : ''}`}>
                      <div className={styles.fieldHeader}>
                        <div className={styles.fieldIconWrapper}><MapPin size={24} /></div>
                        <h3 className={styles.fieldName}>{field.name}</h3>
                      </div>
                      <p className={styles.fieldSurface}>{field.surface} {t('register.fieldRental.fields.surfaceLabel')}</p>
                      <ul className={styles.fieldDetails}>
                        <li><MapPin size={14} color="#15141a" />{t('register.fieldRental.fields.size')}: {field.size}</li>
                        <li><Users size={14} color="#15141a" />{t('register.fieldRental.fields.capacity')}: {field.capacity}</li>
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: unchanged */}
          {step === 2 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.dateTime')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Calendar size={20} /></div>
                  {t('register.fieldRental.date.chooseDate')}
                </h3>
                <div className={styles.dateDropdowns}>
                  <select name="month" value={formData.month} onChange={handleInputChange} className={styles.dropdown}>
                    <option value="">{t('register.months.selectMonth')}</option>
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select name="day" value={formData.day} onChange={handleInputChange} className={styles.dropdown} disabled={!formData.month}>
                    <option value="">{t('register.months.day')}</option>
                    {getAvailableDays().map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select name="year" value={formData.year} onChange={handleInputChange} className={styles.dropdown}>
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
                      <select name="duration" value={formData.duration} onChange={handleInputChange} className={styles.durationDropdown}>
                        {[1, 2, 3, 4].map(h => <option key={h} value={h}>{h} {h === 1 ? t('register.fieldRental.date.hour') : t('register.fieldRental.date.hours')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <div className={styles.iconCircle}><Clock size={20} /></div>
                      {t('register.fieldRental.date.availableSlots')}
                    </h3>
                    <div className={styles.timeSlots}>
                      {paginatedTimeSlots.map((slot) => (
                        <button key={slot.id} onClick={() => handleTimeSlotSelect(slot.id)}
                          className={`${styles.timeSlot} ${formData.timeSlot === slot.id ? styles.selected : ''}`}>
                          <span className={styles.timeSlotTime}>{slot.time}</span>
                          <span className={styles.timeSlotPrice}>${slot.price}/hr</span>
                        </button>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <>
                        <div className={styles.pagination}>
                          <svg width={totalPages * 20} height={20} style={{ overflow: 'visible' }}>
                            {Array.from({ length: totalPages }).map((_, i) => (
                              <circle key={i} cx={i * 20 + 10} cy={10} r={4} fill="#d3d3d3" opacity={0.6} style={{ cursor: 'pointer' }} onClick={() => setTimeSlotsPage(i)} />
                            ))}
                            <circle cx={timeSlotsPage * 20 + 10} cy={10} r={5} fill="#98ED66" opacity={1} style={{ transition: 'cx 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)', pointerEvents: 'none' }} />
                          </svg>
                        </div>
                        <div className={styles.paginationControls}>
                          <button className={styles.paginationButton} onClick={() => setTimeSlotsPage(Math.max(0, timeSlotsPage - 1))} disabled={timeSlotsPage === 0}>{t('register.pagination.previous')}</button>
                          <button className={styles.paginationButton} onClick={() => setTimeSlotsPage(Math.min(totalPages - 1, timeSlotsPage + 1))} disabled={timeSlotsPage === totalPages - 1}>{t('register.pagination.next')}</button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: unchanged */}
          {step === 3 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.yourInfo')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><Pointer size={20} /></div>
                  {t('register.contact.contactDetails')}
                </h3>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={styles.input} placeholder=" " />
                    <label className={`${styles.floatingLabel} ${formData.name ? styles.active : ''}`}>{t('register.contact.fullName')} *</label>
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`} placeholder=" " />
                    <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>{t('register.contact.email')} *</label>
                    {validationErrors.email && <span className={styles.errorMessage}>{validationErrors.email}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} className={`${styles.input} ${validationErrors.phone ? styles.inputError : ''}`} placeholder=" " maxLength={14} />
                    <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>{t('register.contact.phone')} *</label>
                    {validationErrors.phone && <span className={styles.errorMessage}>{validationErrors.phone}</span>}
                  </div>
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.inputGroup}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('register.fieldRental.contact.expectedPlayers')}</label>
                  <input type="number" name="players" value={formData.players} onChange={handleInputChange} className={styles.input} min="1" max="50" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Stripe Elements with matching label animation */}
          {step === 4 && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.fieldRental.steps.payment')}</h2>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}><CreditCard size={20} /></div>
                  {t('register.payment.completeBooking')}
                </h3>
                <div className={styles.form}>

                  {/* Card Number — label animates on focus/value like other steps */}
                  <div className={styles.inputGroup}>
                    <div className={`${styles.stripeInput} ${stripeFocused.cardNumber ? styles.stripeInputFocused : ''}`}>
                      <CardNumberElement
                        options={STRIPE_STYLE}
                        onFocus={() => setStripeFocused(s => ({ ...s, cardNumber: true }))}
                        onBlur={() => setStripeFocused(s => ({ ...s, cardNumber: false }))}
                      />
                    </div>
                    <label className={`${styles.floatingLabel} ${styles.active}`} style={{ background: '#ffffff' }}>
                      {t('register.payment.cardNumber')} *
                    </label>
                  </div>

                  {/* Expiry + CVV row */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <div className={`${styles.stripeInput} ${stripeFocused.cardExpiry ? styles.stripeInputFocused : ''}`}>
                        <CardExpiryElement
                          options={STRIPE_STYLE}
                          onFocus={() => setStripeFocused(s => ({ ...s, cardExpiry: true }))}
                          onBlur={() => setStripeFocused(s => ({ ...s, cardExpiry: false }))}
                        />
                      </div>
                      <label className={`${styles.floatingLabel} ${styles.active}`} style={{ background: '#ffffff' }}>
                        {t('register.payment.expiry')} *
                      </label>
                    </div>
                    <div className={styles.inputGroup}>
                      <div className={`${styles.stripeInput} ${stripeFocused.cardCvc ? styles.stripeInputFocused : ''}`}>
                        <CardCvcElement
                          options={STRIPE_STYLE}
                          onFocus={() => setStripeFocused(s => ({ ...s, cardCvc: true }))}
                          onBlur={() => setStripeFocused(s => ({ ...s, cardCvc: false }))}
                        />
                      </div>
                      <label className={`${styles.floatingLabel} ${styles.active}`} style={{ background: '#ffffff' }}>
                        {t('register.payment.cvv')} *
                      </label>
                    </div>
                  </div>

                  {cardError && (
                    <div className={styles.errorMessage} style={{ marginBottom: '1rem' }}>
                      {cardError}
                    </div>
                  )}

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

        {/* Navigation */}
        <div className={styles.actions}>
          {step > 1 && (
            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleBack}>
              {t('register.nav.back')}
            </button>
          )}
          {step < 4 ? (
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleNext} disabled={!canProceed()}>
              {t('register.nav.continue')}<ChevronRight size={20} />
            </button>
          ) : (
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleSubmit} disabled={isProcessing || !stripe}>
              {isProcessing ? t('register.nav.processing') : t('register.nav.confirmBooking')}
              {!isProcessing && <Check size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const RegisterFieldRental: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Elements stripe={stripePromise}>
      <FormContent t={t} />
    </Elements>
  );
};

export default RegisterFieldRental;
