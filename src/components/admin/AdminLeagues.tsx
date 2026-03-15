// src/components/admin/AdminLeagues.tsx
// Wrapper that handles navigation between season list and season detail
import { useState } from 'react';
import AdminLeagueEngine from './AdminLeagueEngine';
import AdminLeagueSeason from './AdminLeagueSeason';

interface Season {
  id: string;
  name: string;
  division: string;
  category: string;
  gender: string | null;
  season_start: string | null;
  season_end: string | null;
  max_teams: number;
  status: string;
  match_day: string | null;
  match_time: string | null;
}

const AdminLeagues = () => {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  if (selectedSeason) {
    return (
      <AdminLeagueSeason
        season={selectedSeason}
        onBack={() => setSelectedSeason(null)}
      />
    );
  }

  return (
    <AdminLeagueEngine
      onSelectSeason={setSelectedSeason}
    />
  );
};

export default AdminLeagues;
