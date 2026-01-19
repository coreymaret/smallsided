import React, { useState } from 'react';
import { Calendar, Users, Clock, MapPin, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PickupReservation.module.scss';

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

// Generate mock games with dynamic dates
const generateMockGames = (): PickupGame[] => {
  const today = new Date();
  const games: PickupGame[] = [];
  
  // Generate games for the next 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const gameDate = new Date(today);
    gameDate.setDate(today.getDate() + dayOffset);
    const dateString = gameDate.toISOString().split('T')[0];
    
    // Add 2-3 games per day with varying times and formats
    if (dayOffset % 2 === 0) {
      // 7v7 Evening game
      games.push({
        id: `game-${dayOffset}-1`,
        date: dateString,
        time: '6:00 PM - 7:30 PM',
        location: 'Central Sports Complex',
        format: '7v7',
        spotsTotal: 14,
        spotsAvailable: Math.floor(Math.random() * 8) + 3, // 3-10 spots available
        skillLevel: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        pricePerPlayer: 15
      });
    }
    
    if (dayOffset % 3 === 0) {
      // 5v5 Late evening game
      games.push({
        id: `game-${dayOffset}-2`,
        date: dateString,
        time: '7:30 PM - 9:00 PM',
        location: dayOffset % 2 === 0 ? 'Central Sports Complex' : 'Riverside Fields',
        format: '5v5',
        spotsTotal: 10,
        spotsAvailable: Math.floor(Math.random() * 6) + 2, // 2-7 spots available
        skillLevel: ['Intermediate', 'Advanced', 'All Levels'][Math.floor(Math.random() * 3)],
        pricePerPlayer: 18
      });
    }
    
    // Weekend morning games
    if (gameDate.getDay() === 6 || gameDate.getDay() === 0) {
      games.push({
        id: `game-${dayOffset}-3`,
        date: dateString,
        time: '10:00 AM - 11:30 AM',
        location: 'Riverside Fields',
        format: '7v7',
        spotsTotal: 14,
        spotsAvailable: Math.floor(Math.random() * 10) + 4, // 4-13 spots available
        skillLevel: 'All Levels',
        pricePerPlayer: 15
      });
    }
  }
  
  return games;
};

const MOCK_GAMES: PickupGame[] = generateMockGames();

const PickupReservation: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [filterSkillLevel, setFilterSkillLevel] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<PickupGame | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'contact' | 'payment'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    spots: 1,
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
    
    // Adjust to get Monday as start of week (0 = Sunday, 1 = Monday, etc.)
    // If it's Sunday (0), go back 6 days to get to Monday
    // Otherwise, go back (currentDay - 1) days to get to Monday
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
        setErrors(prev => ({ ...prev, phone: undefined }));
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
      setErrors(prev => ({ ...prev, phone: undefined }));
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
      setErrors(prev => ({ ...prev, cardNumber: undefined }));
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
        setErrors(prev => ({ ...prev, cardExpiry: undefined }));
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
      setErrors(prev => ({ ...prev, cardExpiry: undefined }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'cardCVV' && validateCVV(value)) {
      setErrors(prev => ({ ...prev, cardCVV: undefined }));
    }
    
    if (name === 'billingZip' && validateZipCode(value)) {
      setErrors(prev => ({ ...prev, billingZip: undefined }));
    }
  };

  const handleBooking = (game: PickupGame) => {
    setSelectedGame(game);
    setBookingStep('details');
    setErrors({});
    setFormData({ name: '', email: '', phone: '', spots: 1, cardNumber: '', cardExpiry: '', cardCVV: '', billingZip: '' });
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

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate contact information
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!validateCardExpiry(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Invalid expiry date (MM/YY)';
    }

    if (!validateCVV(formData.cardCVV)) {
      newErrors.cardCVV = 'CVV must be 3 digits';
    }

    if (!validateZipCode(formData.billingZip)) {
      newErrors.billingZip = 'ZIP code must be 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Booking:', { game: selectedGame, ...formData });
      
      // Store confirmed game and show success animation
      setConfirmedGame(selectedGame);
      setShowSuccessAnimation(true);
      setSelectedGame(null);
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
      {/* Success Banner */}
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
                    <div key={game.id} className={styles.gameCard}>
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
                      <button 
                        className={styles.bookBtn}
                        onClick={() => handleBooking(game)}
                        disabled={game.spotsAvailable === 0}
                      >
                        {game.spotsAvailable === 0 ? 'Full' : 'Reserve'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedGame && (
        <div className={styles.bookingModal} onClick={() => setSelectedGame(null)}>
          <div className={styles.bookingContent} onClick={(e) => e.stopPropagation()}>
            {bookingStep === 'details' ? (
              <>
                <h2>Game Details</h2>
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
                      <Users size={20} />
                      <span>{selectedGame.spotsAvailable} spots available</span>
                    </div>
                    <div className={styles.priceHighlight}>
                      ${selectedGame.pricePerPlayer} per player
                    </div>
                  </div>
                </div>
                <div className={styles.bookingActions}>
                  <button className={styles.btnSecondary} onClick={() => setSelectedGame(null)}>
                    Cancel
                  </button>
                  <button className={styles.btnPrimary} onClick={() => setBookingStep('contact')}>
                    Continue to Booking
                  </button>
                </div>
              </>
            ) : bookingStep === 'contact' ? (
              <>
                <h2>Your Information</h2>
                <div className={styles.bookingDetailsWrapper}>
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
                </div>
                <div className={styles.bookingActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setBookingStep('details')}>
                    Back
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnPrimary} 
                    onClick={() => {
                      if (validateForm()) {
                        setBookingStep('payment');
                      }
                    }}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Payment Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.bookingDetailsWrapper}>
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
                      <span>Total:</span>
                      <span className={styles.totalPrice}>${selectedGame.pricePerPlayer * formData.spots}</span>
                    </div>
                  </div>
                  <div className={styles.bookingActions}>
                    <button type="button" className={styles.btnSecondary} onClick={() => setBookingStep('contact')}>
                      Back
                    </button>
                    <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupReservation;