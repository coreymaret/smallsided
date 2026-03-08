import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  // Translates hardcoded English skill level strings from mock data
  const translateSkillLevel = (level: string): string => {
    const map: Record<string, string> = {
      'Beginner': t('register.pickup.filters.beginner'),
      'Intermediate': t('register.pickup.filters.intermediate'),
      'Advanced': t('register.pickup.filters.advanced'),
      'All Levels': t('register.pickup.filters.allLevels'),
    };
    return map[level] ?? level;
  };

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
      newErrors.name = t('register.pickup.errors.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('register.pickup.errors.nameMin');
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: typeof errors = {};

    if (!validation.validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = t('register.fieldRental.errors.invalidCard');
    }
    if (!validation.validateCardExpiry(formData.cardExpiry)) {
      newErrors.cardExpiry = t('register.fieldRental.errors.invalidExpiry');
    }
    if (!validation.validateCVV(formData.cardCVV)) {
      newErrors.cardCVV = t('register.fieldRental.errors.invalidCVV');
    }
    if (!validation.validateZipCode(formData.billingZip)) {
      newErrors.billingZip = t('register.fieldRental.errors.invalidZip');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedGame !== null;
      case 2: return true;
      case 3: return formData.name !== '' && formData.email !== '' && formData.phone !== '';
      case 4: return true;
      case 5: return formData.cardNumber !== '' && formData.cardExpiry !== '' && formData.cardCVV !== '' && formData.billingZip !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && !validateStep3()) return;
    if (step === 5 && !validateStep4()) return;
    
    if (canProceed() && step < 5) {
      setCompletedSteps(prev => new Set([...prev, step]));
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxStepReached) setMaxStepReached(nextStep);
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
    if (!validateStep4()) return;

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
      alert(t('register.fieldRental.errors.bookingFailed'));
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
                  <path d="M9 12l2 2 4-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.bannerText}>
                <h3 className={styles.bannerTitle}>{t('register.pickup.success.title')}</h3>
                <p className={styles.bannerSubtitle}>{t('register.pickup.success.subtitle')}</p>
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
                    <span className={styles.detailLabel}>{t('register.pickup.success.date')}</span>
                    <span className={styles.detailValue}>{getFormattedDate(confirmedGame.date)}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.pickup.success.time')}</span>
                    <span className={styles.detailValue}>{confirmedGame.time}</span>
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>{t('register.pickup.success.location')}</span>
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
                    <span className={styles.detailLabel}>{t('register.pickup.success.format')}</span>
                    <span className={styles.detailValue}>{confirmedGame.format} - {translateSkillLevel(confirmedGame.skillLevel)}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.emailNotice}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>{t('register.fieldRental.success.emailNotice', { email: formData.email })}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.pickupContainer}>
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
                      {s === 1 && t('register.pickup.steps.selectGame')}
                      {s === 2 && t('register.pickup.steps.details')}
                      {s === 3 && t('register.pickup.steps.yourInfo')}
                      {s === 4 && t('register.pickup.steps.confirm')}
                      {s === 5 && t('register.pickup.steps.payment')}
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
                  <label>{t('register.pickup.filters.skillLevel')}</label>
                  <select value={filterSkillLevel} onChange={(e) => setFilterSkillLevel(e.target.value)}>
                    <option value="all">{t('register.pickup.filters.allLevels')}</option>
                    <option value="beginner">{t('register.pickup.filters.beginner')}</option>
                    <option value="intermediate">{t('register.pickup.filters.intermediate')}</option>
                    <option value="advanced">{t('register.pickup.filters.advanced')}</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label>{t('register.pickup.filters.format')}</label>
                  <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)}>
                    <option value="all">{t('register.pickup.filters.allFormats')}</option>
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

              <div className={styles.scheduleVertical}>
                {weekDates.map((date, index) => {
                  const games = getGamesForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index} 
                      className={`${styles.dayRow} ${isToday ? styles.today : ''} ${index % 2 === 1 ? styles.alt : ''}`}
                    >
                      <div className={styles.dayLabel}>
                        <span className={styles.dayName}>{formatDayName(date)}</span>
                        <span className={styles.dayDate}>{formatDate(date)}</span>
                        {isToday && <span className={styles.todayBadge}>{t('register.pickup.schedule.today')}</span>}
                      </div>
                      <div className={styles.gamesRow}>
                        {games.length === 0 ? (
                          <div className={styles.noGames}>{t('register.pickup.schedule.noGames')}</div>
                        ) : (
                          games.map(game => (
                            <div 
                              key={game.id} 
                              className={`${styles.gameCard} ${selectedGame?.id === game.id ? styles.selected : ''}`}
                              onClick={() => handleGameSelect(game)}
                            >
                              <div className={styles.gameCardTop}>
                                <div className={styles.gameTime}>
                                  <Clock size={15} />
                                  {game.time}
                                </div>
                                <div className={styles.gamePrice}>${game.pricePerPlayer}/{t('register.pickup.schedule.perPlayer')}</div>
                              </div>
                              <div className={styles.gameCardMiddle}>
                                <span className={styles.formatBadge}>
                                  <Trophy size={12} />
                                  {game.format}
                                </span>
                                <span className={styles.gameSkill}>{translateSkillLevel(game.skillLevel)}</span>
                              </div>
                              <div className={styles.gameCardBottom}>
                                <div className={styles.gameInfo}>
                                  <MapPin size={14} />
                                  {game.location}
                                </div>
                                <div className={styles.gameSpots}>
                                  <Users size={14} />
                                  <span className={game.spotsAvailable <= 3 ? styles.spotsLow : ''}>
                                    {game.spotsAvailable}/{game.spotsTotal} {t('register.pickup.schedule.spots')}
                                  </span>
                                </div>
                              </div>
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
              <h2 className={styles.title}>{t('register.pickup.steps.details')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Trophy size={20} />
                  </div>
                  {t('register.pickup.details.gameInfo')}
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
                    <span>{selectedGame.format} - {translateSkillLevel(selectedGame.skillLevel)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <Users size={20} />
                    <span>{selectedGame.spotsAvailable} {t('register.pickup.details.spotsAvailable')}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <Users size={20} />
                  </div>
                  {t('register.pickup.details.selectSpots')}
                </h3>
                
                <div className={styles.formGroup}>
                  <select
                    value={formData.spots}
                    onChange={(e) => setFormData({ ...formData, spots: Number(e.target.value) })}
                    className={styles.input}
                  >
                    {Array.from({ length: Math.min(selectedGame.spotsAvailable, 4) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        {num} {num > 1 ? t('register.pickup.details.spots') : t('register.pickup.details.spot')}
                      </option>
                    ))}
                  </select>
                  <label className={`${styles.floatingLabel} ${styles.active}`}>
                    {t('register.pickup.details.numberOfSpots')}
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
              <h2 className={styles.title}>{t('register.pickup.steps.yourInfo')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <User size={20} />
                  </div>
                  {t('register.contact.contactDetails')}
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
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      placeholder={t('register.contact.fullName')}
                      className={`${styles.input} ${errors.name ? styles.error : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.name ? styles.active : ''}`}>
                      {t('register.contact.fullName')} *
                    </label>
                    {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder={t('register.contact.email')}
                      className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>
                      {t('register.contact.email')} *
                    </label>
                    {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder={t('register.contact.phone')}
                      className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>
                      {t('register.contact.phone')} *
                    </label>
                    {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && selectedGame && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.pickup.steps.confirm')}</h2>
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
                    <span>{selectedGame.format} - {translateSkillLevel(selectedGame.skillLevel)}</span>
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
                  <span>{t('register.payment.total')}:</span>
                  <span className={styles.totalPrice}>${selectedGame.pricePerPlayer * formData.spots}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && selectedGame && (
            <div className={styles.step}>
              <h2 className={styles.title}>{t('register.pickup.steps.payment')}</h2>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <div className={styles.iconCircle}>
                    <CreditCard size={20} />
                  </div>
                  {t('register.pickup.payment.cardDetails')}
                </h3>
                
                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder={t('register.payment.cardNumber')}
                      maxLength={19}
                      className={`${styles.input} ${errors.cardNumber ? styles.error : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.cardNumber ? styles.active : ''}`}>
                      {t('register.payment.cardNumber')} *
                    </label>
                    {errors.cardNumber && <span className={styles.errorMessage}>{errors.cardNumber}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleCardExpiryChange}
                        placeholder={t('register.payment.expiry')}
                        maxLength={5}
                        className={`${styles.input} ${errors.cardExpiry ? styles.error : ''}`}
                      />
                      <label className={`${styles.floatingLabel} ${formData.cardExpiry ? styles.active : ''}`}>
                        {t('register.payment.expiry')} *
                      </label>
                      {errors.cardExpiry && <span className={styles.errorMessage}>{errors.cardExpiry}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <input
                        type="text"
                        name="cardCVV"
                        value={formData.cardCVV}
                        onChange={handleInputChange}
                        placeholder={t('register.payment.cvv')}
                        maxLength={3}
                        className={`${styles.input} ${errors.cardCVV ? styles.error : ''}`}
                      />
                      <label className={`${styles.floatingLabel} ${formData.cardCVV ? styles.active : ''}`}>
                        {t('register.payment.cvv')} *
                      </label>
                      {errors.cardCVV && <span className={styles.errorMessage}>{errors.cardCVV}</span>}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="billingZip"
                      value={formData.billingZip}
                      onChange={handleInputChange}
                      placeholder={t('register.payment.billingZip')}
                      maxLength={10}
                      className={`${styles.input} ${errors.billingZip ? styles.error : ''}`}
                    />
                    <label className={`${styles.floatingLabel} ${formData.billingZip ? styles.active : ''}`}>
                      {t('register.payment.billingZip')} *
                    </label>
                    {errors.billingZip && <span className={styles.errorMessage}>{errors.billingZip}</span>}
                  </div>

                  <div className={styles.bookingSummary}>
                    <span>{t('register.payment.total')}:</span>
                    <span className={styles.totalPrice}>${selectedGame.pricePerPlayer * formData.spots}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={styles.actions}>
            {step > 1 && (
              <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleBack}>
                {t('register.nav.back')}
              </button>
            )}
            
            {step < 5 ? (
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
                disabled={isSubmitting}
              >
                {isSubmitting ? t('register.nav.processing') : t('register.nav.confirmBooking')}
                {!isSubmitting && <Check size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPickup;