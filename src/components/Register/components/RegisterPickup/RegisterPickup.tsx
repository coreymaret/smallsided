import React, { useState } from 'react';
import { Calendar, Users, Clock, MapPin, Trophy, ChevronLeft, ChevronRight, Check, CreditCard, Lock, User, Mail } from '../../../../components/Icons/Icons';
import styles from './RegisterPickup.module.scss';
import { api } from '../../../../services/api';
// Shared hooks for validation and formatting
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';


interface PickupGame {
  id: string;
  date: string;
  time: string;
  location: string;
  format: string;
  spotsTotal: number;
  spotsAvailable: number;
  skillLevel: string;
  pricePerPlayer: number;
}

const generateMockGames = (): PickupGame[] => {
  const today = new Date();
  const games: PickupGame[] = [];
  
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const gameDate = new Date(today);
    gameDate.setDate(today.getDate() + dayOffset);
    const dateString = gameDate.toISOString().split('T')[0];
    
    if (dayOffset % 2 === 0) {
      games.push({
        id: `game-${dayOffset}-1`,
        date: dateString,
        time: '6:00 PM - 7:30 PM',
        location: 'Central Sports Complex',
        format: '7v7',
        spotsTotal: 14,
        spotsAvailable: Math.floor(Math.random() * 8) + 3,
        skillLevel: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        pricePerPlayer: 15
      });
    }
    
    if (dayOffset % 3 === 0) {
      games.push({
        id: `game-${dayOffset}-2`,
        date: dateString,
        time: '7:30 PM - 9:00 PM',
        location: dayOffset % 2 === 0 ? 'Central Sports Complex' : 'Riverside Fields',
        format: '5v5',
        spotsTotal: 10,
        spotsAvailable: Math.floor(Math.random() * 6) + 2,
        skillLevel: ['Intermediate', 'Advanced', 'All Levels'][Math.floor(Math.random() * 3)],
        pricePerPlayer: 18
      });
    }
    
    if (gameDate.getDay() === 6 || gameDate.getDay() === 0) {
      games.push({
        id: `game-${dayOffset}-3`,
        date: dateString,
        time: '10:00 AM - 11:30 AM',
        location: 'Riverside Fields',
        format: '7v7',
        spotsTotal: 14,
        spotsAvailable: Math.floor(Math.random() * 10) + 4,
        skillLevel: 'All Levels',
        pricePerPlayer: 15
      });
    }
  }
  
  return games;
};

const MOCK_GAMES: PickupGame[] = generateMockGames();

const RegisterPickup: React.FC = () => {
  // Use shared validation and formatting hooks
  const validation = useValidation();
  const formatters = useFormFormatters();
  
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);
  
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [filterSkillLevel, setFilterSkillLevel] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<PickupGame | null>(null);
  
  const [formData, setFormData] = useState({
    spots: 1,
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    billingZip: ''
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCVV?: string;
    billingZip?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [confirmedGame, setConfirmedGame] = useState<PickupGame | null>(null);

  const getWeekDates = (weekOffset: number): Date[] => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    startOfWeek.setDate(today.getDate() - daysToMonday + weekOffset * 7);
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getGamesForDate = (date: Date): PickupGame[] => {
    const dateString = date.toISOString().split('T')[0];
    return MOCK_GAMES.filter(game => {
      const matchesDate = game.date === dateString;
      const matchesSkill = filterSkillLevel === 'all' || game.skillLevel.toLowerCase() === filterSkillLevel.toLowerCase();
      const matchesFormat = filterFormat === 'all' || game.format === filterFormat;
      return matchesDate && matchesSkill && matchesFormat;
    });
  };

  const handleCloseBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setIsClosing(false);
    }, 400);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const digits = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digits.length === 10;
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.phone);
    setFormData({ ...formData, phone: formatted });
    
    if (validation.validatePhone(formatted)) {
      const newErrors = { ...errors };
      delete newErrors.phone;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'cardCVV' && validation.validateCVV(value)) {
      setErrors(prev => ({ ...prev, cardCVV: undefined }));
    }
    
    if (name === 'billingZip' && validation.validateZipCode(value)) {
      setErrors(prev => ({ ...prev, billingZip: undefined }));
    }
  };

  const validateStep3 = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validation.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validation.validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: typeof errors = {};

    if (!validation.validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!validation.validateCardExpiry(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Invalid expiry date (MM/YY)';
    }

    if (!validation.validateCVV(formData.cardCVV)) {
      newErrors.cardCVV = 'CVV must be 3 digits';
    }

    if (!validation.validateZipCode(formData.billingZip)) {
      newErrors.billingZip = 'ZIP code must be 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedGame !== null;
      case 2:
        return true; // Game details review
      case 3:
        return formData.name !== '' && formData.email !== '' && formData.phone !== '';
      case 4:
        return true; // Confirm step - just reviewing
      case 5:
        return formData.cardNumber !== '' && formData.cardExpiry !== '' && formData.cardCVV !== '' && formData.billingZip !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && !validateStep3()) {
      return;
    }
    
    if (step === 5 && !validateStep4()) {
      return;
    }
    
    if (canProceed() && step < 5) {
      setCompletedSteps(prev => new Set([...prev, step]));
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep <= maxStepReached) {
      setStep(clickedStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGameSelect = (game: PickupGame) => {
    setSelectedGame(game);
  };

  const handleSubmit = async () => {
    if (!validateStep4()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        gameId: selectedGame?.id || '',
        gameDate: selectedGame?.date,
        gameTime: selectedGame?.time,
        location: selectedGame?.location,
        format: selectedGame?.format,
        skillLevel: selectedGame?.skillLevel,
        spots: formData.spots,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        totalAmount: (selectedGame?.pricePerPlayer || 0) * formData.spots,
      };

      await api.createPickupBooking(bookingData);
      setConfirmedGame(selectedGame);
      setShowSuccessAnimation(true);
      
      setTimeout(() => {
        setStep(1);
        setSelectedGame(null);
        setCompletedSteps(new Set());
        setMaxStepReached(1);
        setFormData({
          spots: 1,
          name: '',
          email: '',
          phone: '',
          cardNumber: '',
          cardExpiry: '',
          cardCVV: '',
          billingZip: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Booking error:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const weekDates = getWeekDates(selectedWeek);
  const weekStart = formatDate(weekDates[0]);
  const weekEnd = formatDate(weekDates[6]);

  return (
    <div className={styles.pickupReservation}>
      <div className={styles.pickupContainer}>
      {showSuccessAnimation && confirmedGame && (
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
                <h3 className={styles.bannerTitle}>Reservation Confirmed!</h3>
                <p className={styles.bannerSubtitle}>Your spot has been successfully reserved</p>
              </div>
            </div>
            
            <div className={styles.bannerDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>{getFormattedDate(confirmedGame.date)}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Time</span>
                    <span className={styles.detailValue}>{confirmedGame.time}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Location</span>
                    <span className={styles.detailValue}>{confirmedGame.location}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Format</span>
                    <span className={styles.detailValue}>{confirmedGame.format} - {confirmedGame.skillLevel}</span>
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

      <div className={styles.header}>
        <h1>Pickup Games</h1>
        <p>Join friendly matches at your skill level. Drop in for a game whenever you're free!</p>
      </div>

      <div className={styles.contentCard}>
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
                  {s === 1 && 'Select Game'}
                  {s === 2 && 'Details'}
                  {s === 3 && 'Your Info'}
                  {s === 4 && 'Confirm'}
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

      {/* Step 1: Select Game */}
      {step === 1 && (
        <div className={styles.step}>
          <div className={styles.filtersSection}>
            <div className={styles.filterGroup}>
              <label>Skill Level</label>
              <select value={filterSkillLevel} onChange={(e) => setFilterSkillLevel(e.target.value)}>
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Format</label>
              <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)}>
                <option value="all">All Formats</option>
                <option value="5v5">5v5</option>
                <option value="7v7">7v7</option>
              </select>
            </div>
          </div>

          <div className={styles.weekNavigation}>
            <button 
              className={styles.weekNavBtn}
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              disabled={selectedWeek === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <span className={styles.weekRange}>{weekStart} - {weekEnd}</span>
            <button 
              className={styles.weekNavBtn}
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              disabled={selectedWeek >= 3}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.scheduleGrid}>
            {weekDates.map((date, index) => {
              const games = getGamesForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className={`${styles.dayColumn} ${isToday ? styles.today : ''}`}>
                  <div className={styles.dayHeader}>
                    <span className={styles.dayName}>{formatDayName(date)}</span>
                    <span className={styles.dayDate}>{formatDate(date)}</span>
                  </div>
                  <div className={styles.gamesList}>
                    {games.length === 0 ? (
                      <div className={styles.noGames}>No games scheduled</div>
                    ) : (
                      games.map(game => (
                        <div 
                          key={game.id} 
                          className={`${styles.gameCard} ${selectedGame?.id === game.id ? styles.selected : ''}`}
                          onClick={() => handleGameSelect(game)}
                        >
                          <div className={styles.gameInfo}>
                            <Clock size={16} />
                            {game.time}
                          </div>
                          <div className={styles.gameInfo}>
                            <Trophy size={16} />
                            {game.format}
                          </div>
                          <div className={styles.gameInfo}>
                            <MapPin size={16} />
                            {game.location}
                          </div>
                          <div className={styles.gameSkill}>{game.skillLevel}</div>
                          <div className={styles.gameInfo}>
                            <Users size={16} />
                            <span className={game.spotsAvailable <= 3 ? styles.spotsLow : ''}>
                              {game.spotsAvailable}/{game.spotsTotal} spots
                            </span>
                          </div>
                          <div className={styles.gamePrice}>${game.pricePerPlayer}/player</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Game Details */}
      {step === 2 && selectedGame && (
        <div className={styles.step}>
          <h2 className={styles.title}>Game Details</h2>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <div className={styles.iconCircle}>
                <Trophy size={20} />
              </div>
              Game Information
            </h3>
            
            <div className={styles.gameDetails}>
              <div className={styles.detailRow}>
                <Calendar size={20} />
                <span>{new Date(selectedGame.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className={styles.detailRow}>
                <Clock size={20} />
                <span>{selectedGame.time}</span>
              </div>
              <div className={styles.detailRow}>
                <MapPin size={20} />
                <span>{selectedGame.location}</span>
              </div>
              <div className={styles.detailRow}>
                <Trophy size={20} />
                <span>{selectedGame.format} - {selectedGame.skillLevel}</span>
              </div>
              <div className={styles.detailRow}>
                <Users size={20} />
                <span>{selectedGame.spotsAvailable} spots available</span>
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <div className={styles.iconCircle}>
                <Users size={20} />
              </div>
              Select Spots
            </h3>
            
            <div className={styles.formGroup}>
              <select
                value={formData.spots}
                onChange={(e) => setFormData({ ...formData, spots: Number(e.target.value) })}
                className={styles.input}
              >
                {Array.from({ length: Math.min(selectedGame.spotsAvailable, 4) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} spot{num > 1 ? 's' : ''}</option>
                ))}
              </select>
              <label className={`${styles.floatingLabel} ${styles.active}`}>
                Number of Spots
              </label>
            </div>

            <div className={styles.priceHighlight}>
              ${selectedGame.pricePerPlayer * formData.spots}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Your Info */}
      {step === 3 && (
        <div className={styles.step}>
          <h2 className={styles.title}>Your Information</h2>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <div className={styles.iconCircle}>
                <User size={20} />
              </div>
              Contact Details
            </h3>
            
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined });
                    }
                  }}
                  placeholder="Full Name"
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                />
                <label className={`${styles.floatingLabel} ${formData.name ? styles.active : ''}`}>
                  Full Name *
                </label>
                {errors.name && (
                  <span className={styles.errorMessage}>{errors.name}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  placeholder="Email Address"
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                />
                <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>
                  Email Address *
                </label>
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Phone Number"
                  className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                />
                <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>
                  Phone Number *
                </label>
                {errors.phone && (
                  <span className={styles.errorMessage}>{errors.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && selectedGame && (
        <div className={styles.step}>
          <h2 className={styles.title}>Confirm Your Booking</h2>
          <div className={styles.bookingDetailsWrapper}>
            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <Calendar size={20} />
                <span>{new Date(selectedGame.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className={styles.detailRow}>
                <Clock size={20} />
                <span>{selectedGame.time}</span>
              </div>
              <div className={styles.detailRow}>
                <MapPin size={20} />
                <span>{selectedGame.location}</span>
              </div>
              <div className={styles.detailRow}>
                <Trophy size={20} />
                <span>{selectedGame.format} - {selectedGame.skillLevel}</span>
              </div>
              <div className={styles.detailRow}>
                <User size={20} />
                <span>{formData.name}</span>
              </div>
              <div className={styles.detailRow}>
                <Mail size={20} />
                <span>{formData.email}</span>
              </div>
            </div>
            <div className={styles.bookingSummary}>
              <span>Total:</span>
              <span className={styles.totalPrice}>${selectedGame.pricePerPlayer * formData.spots}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Payment */}
      {step === 5 && selectedGame && (
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
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="Card Number"
                  maxLength={19}
                  className={`${styles.input} ${errors.cardNumber ? styles.error : ''}`}
                />
                <label className={`${styles.floatingLabel} ${formData.cardNumber ? styles.active : ''}`}>
                  Card Number *
                </label>
                {errors.cardNumber && (
                  <span className={styles.errorMessage}>{errors.cardNumber}</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleCardExpiryChange}
                    placeholder="Expiry Date"
                    maxLength={5}
                    className={`${styles.input} ${errors.cardExpiry ? styles.error : ''}`}
                  />
                  <label className={`${styles.floatingLabel} ${formData.cardExpiry ? styles.active : ''}`}>
                    Expiry (MM/YY) *
                  </label>
                  {errors.cardExpiry && (
                    <span className={styles.errorMessage}>{errors.cardExpiry}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="cardCVV"
                    value={formData.cardCVV}
                    onChange={handleInputChange}
                    placeholder="CVV"
                    maxLength={3}
                    className={`${styles.input} ${errors.cardCVV ? styles.error : ''}`}
                  />
                  <label className={`${styles.floatingLabel} ${formData.cardCVV ? styles.active : ''}`}>
                    CVV *
                  </label>
                  {errors.cardCVV && (
                    <span className={styles.errorMessage}>{errors.cardCVV}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="billingZip"
                  value={formData.billingZip}
                  onChange={handleInputChange}
                  placeholder="Billing ZIP Code"
                  maxLength={10}
                  className={`${styles.input} ${errors.billingZip ? styles.error : ''}`}
                />
                <label className={`${styles.floatingLabel} ${formData.billingZip ? styles.active : ''}`}>
                  Billing ZIP Code *
                </label>
                {errors.billingZip && (
                  <span className={styles.errorMessage}>{errors.billingZip}</span>
                )}
              </div>

              <div className={styles.bookingSummary}>
                <span>Total Amount:</span>
                <span className={styles.totalPrice}>${selectedGame.pricePerPlayer * formData.spots}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Navigation Buttons */}
      <div className={styles.actionsCard}>
      <div className={styles.bookingActions}>
        {step > 1 && (
          <button className={styles.btnSecondary} onClick={handleBack}>
            Back
          </button>
        )}
        
        {step < 5 ? (
          <button
            className={styles.btnPrimary}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue
          </button>
        ) : (
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        )}
      </div>
      </div>
      </div>
    </div>
  );
};

export default RegisterPickup;