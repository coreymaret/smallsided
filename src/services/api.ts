// API Service Layer for Small Sided Soccer
// Handles all communication with Netlify Functions and Supabase

interface BookingData {
  booking_type: 'field_rental' | 'pickup' | 'birthday' | 'camp' | 'training';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  start_time?: string;
  end_time?: string;
  field_id?: string;
  participants?: number;
  total_amount: number;
  stripe_payment_intent_id: string;
  metadata?: Record<string, unknown>;
  special_requests?: string;
}

interface LeagueRegistrationData {
  league_id: string;
  team_name: string;
  team_experience?: string;
  captain_name: string;
  captain_email: string;
  captain_phone: string;
  age_division: string;
  skill_level: string;
  players: Array<{
    name: string;
    age?: number;
    position?: string;
    experience?: string;
  }>;
  total_amount: number;
  stripe_payment_intent_id: string;
  waiver_signed: boolean;
  hear_about_us?: string;
  additional_notes?: string;
}

interface TrainingRegistrationData {
  training_type: string;
  player_name: string;
  player_age: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  skill_level: string;
  focus_areas: string[];
  preferred_schedule: string[];
  total_amount: number;
  stripe_payment_intent_id: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relation: string;
  };
  medical_info?: string;
}

// ===== NEW INTERFACES FOR PICKUP AND FIELD RENTAL =====
interface PickupBookingData {
  gameId: string;
  gameDate?: string;
  gameTime?: string;
  location?: string;
  format?: string;
  skillLevel?: string;
  spots: number;
  name: string;
  email: string;
  phone: string;
  totalAmount: number;
}

interface FieldRentalBookingData {
  fieldId: string;
  fieldName: string | undefined;
  bookingDate: string;
  timeSlot: string | undefined;
  duration: number;
  players: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/.netlify/functions';
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ====================================
  // BOOKINGS
  // ====================================

  async createBooking(bookingData: BookingData) {
    return this.fetch('/create-booking', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(filters?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return this.fetch(`/get-bookings?${params}`);
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.fetch('/update-booking-status', {
      method: 'PATCH',
      body: JSON.stringify({ bookingId, status }),
    });
  }

  async cancelBooking(bookingId: string, reason?: string) {
    return this.fetch('/cancel-booking', {
      method: 'POST',
      body: JSON.stringify({ bookingId, reason }),
    });
  }

  // ====================================
  // LEAGUE REGISTRATIONS
  // ====================================

  async createLeagueRegistration(registrationData: LeagueRegistrationData) {
    return this.fetch('/create-league-registration', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async getLeagueRegistrations(leagueId?: string) {
    const params = leagueId ? `?leagueId=${leagueId}` : '';
    return this.fetch(`/get-league-registrations${params}`);
  }

  async updateRegistrationStatus(
    registrationId: string,
    status: 'pending' | 'approved' | 'rejected'
  ) {
    return this.fetch('/update-registration-status', {
      method: 'PATCH',
      body: JSON.stringify({ registrationId, status }),
    });
  }

  // ====================================
  // TRAINING REGISTRATIONS
  // ====================================

  async createTrainingRegistration(registrationData: TrainingRegistrationData) {
    return this.fetch('/create-training-registration', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async getTrainingRegistrations(filters?: {
    trainingType?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.trainingType) params.append('trainingType', filters.trainingType);
    if (filters?.status) params.append('status', filters.status);
    
    return this.fetch(`/get-training-registrations?${params}`);
  }

  // ====================================
  // PAYMENTS
  // ====================================

  async createPaymentIntent(amount: number, description: string) {
    return this.fetch('/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.fetch('/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async processRefund(paymentIntentId: string, amount?: number, reason?: string) {
    return this.fetch('/process-refund', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, amount, reason }),
    });
  }

  // ====================================
  // MATCHES
  // ====================================

  async getMatches(leagueId?: string, status?: string) {
    const params = new URLSearchParams();
    if (leagueId) params.append('leagueId', leagueId);
    if (status) params.append('status', status);
    
    return this.fetch(`/get-matches?${params}`);
  }

  async updateMatchScore(
    matchId: string,
    homeScore: number,
    awayScore: number
  ) {
    return this.fetch('/update-match-score', {
      method: 'PATCH',
      body: JSON.stringify({ matchId, homeScore, awayScore }),
    });
  }

  async completeMatch(matchId: string) {
    return this.fetch('/complete-match', {
      method: 'POST',
      body: JSON.stringify({ matchId }),
    });
  }

  // ====================================
  // PICKUP BOOKINGS
  // ====================================

  async createPickupBooking(data: PickupBookingData) {
    try {
      // Process payment first
      const paymentResponse = await this.fetch('/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: data.totalAmount * 100, // Convert to cents
          description: `Pickup Game - ${data.format} - ${data.gameDate}`,
        }),
      });

      const { clientSecret, paymentIntentId } = paymentResponse;

      // Create booking in Supabase
      const bookingResponse = await this.fetch('/create-booking', {
        method: 'POST',
        body: JSON.stringify({
          booking_type: 'pickup',
          game_id: data.gameId,
          game_date: data.gameDate,
          game_time: data.gameTime,
          location: data.location,
          format: data.format,
          skill_level: data.skillLevel,
          spots_reserved: data.spots,
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone,
          total_amount: data.totalAmount,
          payment_status: 'completed',
          stripe_payment_intent_id: paymentIntentId,
        }),
      });

      return { success: true, booking: bookingResponse, clientSecret };
    } catch (error) {
      console.error('Pickup booking error:', error);
      throw error;
    }
  }

  // ====================================
  // FIELD RENTAL BOOKINGS
  // ====================================

  async createFieldRentalBooking(data: FieldRentalBookingData) {
    try {
      // Process payment first
      const paymentResponse = await this.fetch('/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: data.totalAmount * 100, // Convert to cents
          description: `Field Rental - ${data.fieldName} - ${data.bookingDate}`,
        }),
      });

      const { clientSecret, paymentIntentId } = paymentResponse;

      // Create booking in Supabase
      const bookingResponse = await this.fetch('/create-booking', {
        method: 'POST',
        body: JSON.stringify({
          booking_type: 'field_rental',
          field_id: data.fieldId,
          field_name: data.fieldName,
          booking_date: data.bookingDate,
          time_slot: data.timeSlot,
          duration_hours: data.duration,
          number_of_players: data.players,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          total_amount: data.totalAmount,
          payment_status: 'completed',
          stripe_payment_intent_id: paymentIntentId,
        }),
      });

      return { success: true, booking: bookingResponse, clientSecret };
    } catch (error) {
      console.error('Field rental booking error:', error);
      throw error;
    }
  }

  // ====================================
  // STRIPE WEBHOOK (Internal use only)
  // ====================================

  // This is called by Stripe webhooks, not by the frontend
  // Included here for completeness
  async handleStripeWebhook(signature: string, body: string) {
    return this.fetch('/stripe-webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body,
    });
  }
}

// Export singleton instance
export const api = new ApiService();

// Export types for use in components
export type { 
  BookingData, 
  LeagueRegistrationData, 
  TrainingRegistrationData,
  PickupBookingData,
  FieldRentalBookingData 
};
