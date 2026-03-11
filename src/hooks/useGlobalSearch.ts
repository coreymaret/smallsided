// src/hooks/useGlobalSearch.ts
// Searches all 6 service tables simultaneously for a given query.
// Normalizes results into a unified shape for display in the command palette.

import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export type ServiceType = 'field_rental' | 'pickup' | 'birthday' | 'camp' | 'training' | 'league';

export interface SearchResult {
  id: string;
  service: ServiceType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: string;
  amount: number;
  // Raw record for passing to the drawer if needed later
  raw: Record<string, any>;
}

// Normalize text for accent-insensitive comparison
// e.g. "Ramírez" matches "Ramirez"
const normalize = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const matchesQuery = (value: string | null | undefined, query: string): boolean => {
  if (!value) return false;
  return normalize(value).includes(normalize(query));
};

export const useGlobalSearch = () => {
  const [results, setResults] = useState<Record<ServiceType, SearchResult[]>>({
    field_rental: [],
    pickup: [],
    birthday: [],
    camp: [],
    training: [],
    league: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (rawQuery: string) => {
    const q = rawQuery.trim();
    setQuery(rawQuery);

    if (q.length < 2) {
      setResults({ field_rental: [], pickup: [], birthday: [], camp: [], training: [], league: [] });
      setIsSearching(false);
      return;
    }

    // Debounce — wait 250ms after last keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);

      // Build Supabase ilike filter for name/email/phone
      const likeQ = `%${q}%`;

      const [bookingsRes, trainingRes, leaguesRes] = await Promise.all([
        // bookings table covers: field_rental, pickup, birthday, camp
        supabase
          .from('bookings')
          .select('id, booking_type, customer_name, customer_email, customer_phone, booking_date, booking_status, payment_status, total_amount, metadata, start_time')
          .or(`customer_name.ilike.${likeQ},customer_email.ilike.${likeQ},customer_phone.ilike.${likeQ}`)
          .in('booking_type', ['field_rental', 'pickup', 'birthday', 'camp'])
          .limit(30),

        // training_registrations
        supabase
          .from('training_registrations')
          .select('id, player_name, parent_name, parent_email, parent_phone, status, total_amount, created_at')
          .or(`player_name.ilike.${likeQ},parent_name.ilike.${likeQ},parent_email.ilike.${likeQ},parent_phone.ilike.${likeQ}`)
          .limit(20),

        // league_registrations
        supabase
          .from('league_registrations')
          .select('id, team_name, captain_name, captain_email, captain_phone, payment_status, total_amount, registration_date, created_at')
          .or(`team_name.ilike.${likeQ},captain_name.ilike.${likeQ},captain_email.ilike.${likeQ},captain_phone.ilike.${likeQ}`)
          .limit(20),
      ]);

      const newResults: Record<ServiceType, SearchResult[]> = {
        field_rental: [],
        pickup: [],
        birthday: [],
        camp: [],
        training: [],
        league: [],
      };

      // Map bookings
      if (bookingsRes.data) {
        bookingsRes.data.forEach((b: any) => {
          const service = b.booking_type as ServiceType;
          newResults[service].push({
            id: b.id,
            service,
            customerName: b.customer_name,
            customerEmail: b.customer_email,
            customerPhone: b.customer_phone,
            date: b.booking_date,
            status: b.booking_status ?? b.payment_status ?? 'pending',
            amount: b.total_amount,
            raw: b,
          });
        });
      }

      // Map training
      if (trainingRes.data) {
        trainingRes.data.forEach((t: any) => {
          newResults.training.push({
            id: t.id,
            service: 'training',
            customerName: t.parent_name,
            customerEmail: t.parent_email,
            customerPhone: t.parent_phone,
            date: t.created_at?.split('T')[0] ?? '',
            status: t.status ?? 'pending',
            amount: t.total_amount,
            raw: t,
          });
        });
      }

      // Map leagues
      if (leaguesRes.data) {
        leaguesRes.data.forEach((l: any) => {
          newResults.league.push({
            id: l.id,
            service: 'league',
            customerName: l.captain_name,
            customerEmail: l.captain_email,
            customerPhone: l.captain_phone,
            date: l.registration_date ?? l.created_at?.split('T')[0] ?? '',
            status: l.payment_status ?? 'pending',
            amount: l.total_amount,
            raw: { ...l, team_name: l.team_name },
          });
        });
      }

      setResults(newResults);
      setIsSearching(false);
    }, 250);
  }, []);

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  const clear = useCallback(() => {
    setQuery('');
    setResults({ field_rental: [], pickup: [], birthday: [], camp: [], training: [], league: [] });
  }, []);

  return { query, results, totalResults, isSearching, search, clear };
};
