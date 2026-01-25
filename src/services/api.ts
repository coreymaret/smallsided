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

class ApiService {
  private baseUrl: string;

  constructor() {
  // Use /api prefix which redirects to /.netlify/functions in netlify.toml
  this.baseUrl = '/api';
}

  // Generic fetch wrapper with error handling
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
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

  async createBooking(data: BookingData) {
    return this.fetch('/create-booking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(filters?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.fetch(`/get-bookings?${params}`);
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.fetch('/update-booking', {
      method: 'PATCH',
      body: JSON.stringify({ bookingId, status }),
    });
  }

  // ====================================
  // LEAGUE REGISTRATIONS
  // ====================================

  async createLeagueRegistration(data: LeagueRegistrationData) {
    return this.fetch('/create-league-registration', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeagueRegistrations(leagueId?: string) {
    const endpoint = leagueId 
      ? `/get-league-registrations?leagueId=${leagueId}`
      : '/get-league-registrations';
    return this.fetch(endpoint);
  }

  // ====================================
  // TEAMS & LEAGUES
  // ====================================

  async finalizeLeague(leagueId: string) {
    return this.fetch('/finalize-league', {
      method: 'POST',
      body: JSON.stringify({ leagueId }),
    });
  }

  async getTeamsByLeague(leagueId: string) {
    return this.fetch(`/get-teams?leagueId=${leagueId}`);
  }

  async getLeagueStandings(leagueId: string) {
    return this.fetch(`/get-standings?leagueId=${leagueId}`);
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
export type { BookingData, LeagueRegistrationData };
