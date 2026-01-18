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
    const times = ['12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', 
                   '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', 
                   '10:00', '10:30', '11:00'];
    
    times.forEach((time, index) => {
      slots.push({
        id: String(index + 1),
        time: `${time} PM`,
        hourValue: index === 0 ? 12 : (index < 22 ? Math.floor(index / 2) + 12 : 23),
        minuteValue: index % 2 === 0 ? 0 : 30,
        available: ![3, 7].includes(index),
        price: index < 8 ? 80 : (index < 16 ? 100 : 120)
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

  const days = Array.from({ length: getDaysInMonth(formData.month, formData.year || String(currentYear)) }, (_, i) => i + 1);
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
      const daysInMonth = getDaysInMonth(
        field === 'month' ? value : formData.month,
        field === 'year' ? value : formData.year
      );
      if (parseInt(formData.day) > daysInMonth) {
        newFormData.day = String(daysInMonth);
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
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    let formatted = value;
    if (value.length >= 3) {
      formatted = `(${value.slice(0, 3)})`;
      if (value.length > 3) {
        formatted += ` ${value.slice(3, 6)}`;
      }
      if (value.length > 6) {
        formatted += `-${value.slice(6, 10)}`;
      }
    }
    
    setFormData({ ...formData, phone: formatted });
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
    if (canProceed() && step < 4) {
      setCompletedSteps(prev => new Set([...prev, step]));
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
      
      // Scroll to top of booking container
      const container = document.getElementById('booking-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      
      // Scroll to top of booking container
      const container = document.getElementById('booking-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep <= maxStepReached) {
      setStep(clickedStep);
      
      // Scroll to top of booking container
      const container = document.getElementById('booking-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSubmit = () => {
    alert('Booking submitted! Check console for details.');
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

                <div className={styles.timeSlots}>
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
                  <div className={styles.pagination}>
                    <button
                      className={styles.paginationButton}
                      onClick={() => setTimeSlotsPage(Math.max(0, timeSlotsPage - 1))}
                      disabled={timeSlotsPage === 0}
                    >
                      Previous
                    </button>
                    <div className={styles.paginationDots}>
                      {Array.from({ length: getTotalPages() }).map((_, index) => (
                        <button
                          key={index}
                          className={`${styles.paginationDot} ${timeSlotsPage === index ? styles.active : ''}`}
                          onClick={() => setTimeSlotsPage(index)}
                        />
                      ))}
                    </div>
                    <button
                      className={styles.paginationButton}
                      onClick={() => setTimeSlotsPage(Math.min(getTotalPages() - 1, timeSlotsPage + 1))}
                      disabled={timeSlotsPage === getTotalPages() - 1}
                    >
                      Next
                    </button>
                  </div>
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
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>
                      Email Address *
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Phone Number"
                      className={styles.input}
                    />
                    <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>
                      Phone Number *
                    </label>
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
                        onChange={handleInputChange}
                        placeholder="Card Number"
                        maxLength={19}
                        className={styles.input}
                      />
                      <label className={`${styles.floatingLabel} ${formData.cardNumber ? styles.active : ''}`}>
                        Card Number *
                      </label>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.inputGroup}>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          placeholder="Expiry Date"
                          maxLength={5}
                          className={styles.input}
                        />
                        <label className={`${styles.floatingLabel} ${formData.cardExpiry ? styles.active : ''}`}>
                          Expiry (MM/YY) *
                        </label>
                      </div>

                      <div className={styles.inputGroup}>
                        <input
                          type="text"
                          name="cardCVV"
                          value={formData.cardCVV}
                          onChange={handleInputChange}
                          placeholder="CVV"
                          maxLength={4}
                          className={styles.input}
                        />
                        <label className={`${styles.floatingLabel} ${formData.cardCVV ? styles.active : ''}`}>
                          CVV *
                        </label>
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
                        className={styles.input}
                      />
                      <label className={`${styles.floatingLabel} ${formData.billingZip ? styles.active : ''}`}>
                        Billing ZIP Code *
                      </label>
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