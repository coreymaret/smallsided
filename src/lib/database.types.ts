// This file is auto-generated from your Supabase schema
// Do not edit manually - regenerate with: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          booking_type: 'field_rental' | 'pickup' | 'birthday' | 'camp' | 'training'
          customer_name: string
          customer_email: string
          customer_phone: string
          booking_date: string
          start_time: string | null
          end_time: string | null
          field_id: string | null
          participants: number | null
          total_amount: number
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          metadata: Json
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_type: 'field_rental' | 'pickup' | 'birthday' | 'camp' | 'training'
          customer_name: string
          customer_email: string
          customer_phone: string
          booking_date: string
          start_time?: string | null
          end_time?: string | null
          field_id?: string | null
          participants?: number | null
          total_amount: number
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          metadata?: Json
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_type?: 'field_rental' | 'pickup' | 'birthday' | 'camp' | 'training'
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          booking_date?: string
          start_time?: string | null
          end_time?: string | null
          field_id?: string | null
          participants?: number | null
          total_amount?: number
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          metadata?: Json
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          season: string
          description: string | null
          age_division: string
          skill_level: string | null
          game_format: string
          start_date: string
          end_date: string
          registration_deadline: string
          max_teams: number
          current_teams: number
          registration_fee: number
          status: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
          rules_url: string | null
          venue_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          season: string
          description?: string | null
          age_division: string
          skill_level?: string | null
          game_format: string
          start_date: string
          end_date: string
          registration_deadline: string
          max_teams?: number
          current_teams?: number
          registration_fee: number
          status?: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
          rules_url?: string | null
          venue_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          season?: string
          description?: string | null
          age_division?: string
          skill_level?: string | null
          game_format?: string
          start_date?: string
          end_date?: string
          registration_deadline?: string
          max_teams?: number
          current_teams?: number
          registration_fee?: number
          status?: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
          rules_url?: string | null
          venue_info?: Json
          created_at?: string
          updated_at?: string
        }
      }
      league_registrations: {
        Row: {
          id: string
          league_id: string
          team_name: string
          team_experience: string | null
          captain_name: string
          captain_email: string
          captain_phone: string
          age_division: string
          skill_level: string
          players: Json
          player_count: number
          total_amount: number
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_payment_intent_id: string | null
          waiver_signed: boolean
          waiver_signed_at: string | null
          hear_about_us: string | null
          additional_notes: string | null
          team_created: boolean
          team_id: string | null
          registration_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          team_name: string
          team_experience?: string | null
          captain_name: string
          captain_email: string
          captain_phone: string
          age_division: string
          skill_level: string
          players?: Json
          total_amount: number
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_payment_intent_id?: string | null
          waiver_signed?: boolean
          waiver_signed_at?: string | null
          hear_about_us?: string | null
          additional_notes?: string | null
          team_created?: boolean
          team_id?: string | null
          registration_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          team_name?: string
          team_experience?: string | null
          captain_name?: string
          captain_email?: string
          captain_phone?: string
          age_division?: string
          skill_level?: string
          players?: Json
          total_amount?: number
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_payment_intent_id?: string | null
          waiver_signed?: boolean
          waiver_signed_at?: string | null
          hear_about_us?: string | null
          additional_notes?: string | null
          team_created?: boolean
          team_id?: string | null
          registration_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          league_id: string
          registration_id: string | null
          team_name: string
          team_logo_url: string | null
          captain_name: string
          captain_email: string
          captain_phone: string
          players: Json
          games_played: number
          wins: number
          draws: number
          losses: number
          goals_for: number
          goals_against: number
          points: number
          goal_difference: number
          win_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          registration_id?: string | null
          team_name: string
          team_logo_url?: string | null
          captain_name: string
          captain_email: string
          captain_phone: string
          players?: Json
          games_played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          registration_id?: string | null
          team_name?: string
          team_logo_url?: string | null
          captain_name?: string
          captain_email?: string
          captain_phone?: string
          players?: Json
          games_played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          league_id: string
          home_team_id: string
          away_team_id: string
          match_week: number | null
          scheduled_date: string
          scheduled_time: string
          field: string | null
          home_score: number | null
          away_score: number | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
          referee: string | null
          notes: string | null
          highlights: Json
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          home_team_id: string
          away_team_id: string
          match_week?: number | null
          scheduled_date: string
          scheduled_time: string
          field?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
          referee?: string | null
          notes?: string | null
          highlights?: Json
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          home_team_id?: string
          away_team_id?: string
          match_week?: number | null
          scheduled_date?: string
          scheduled_time?: string
          field?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
          referee?: string | null
          notes?: string | null
          highlights?: Json
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: 'super_admin' | 'admin' | 'staff'
          full_name: string
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'super_admin' | 'admin' | 'staff'
          full_name: string
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'super_admin' | 'admin' | 'staff'
          full_name?: string
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          admin_user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      league_standings: {
        Row: {
          id: string
          league_id: string
          team_name: string
          league_name: string
          season: string
          games_played: number
          wins: number
          draws: number
          losses: number
          goals_for: number
          goals_against: number
          goal_difference: number
          points: number
          position: number
        }
      }
      upcoming_matches: {
        Row: {
          id: string
          league_id: string
          league_name: string
          season: string
          home_team_id: string
          away_team_id: string
          home_team_name: string
          away_team_name: string
          scheduled_date: string
          scheduled_time: string
          field: string | null
          status: string
        }
      }
      recent_results: {
        Row: {
          id: string
          league_id: string
          league_name: string
          season: string
          home_team_id: string
          away_team_id: string
          home_team_name: string
          away_team_name: string
          home_score: number
          away_score: number
          scheduled_date: string
          completed_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
