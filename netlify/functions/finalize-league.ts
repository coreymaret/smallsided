import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Simple round-robin schedule generator
function generateRoundRobin(teams: any[]): any[] {
  const matches: any[] = [];
  const n = teams.length;
  
  // Ensure even number of teams (add bye if needed)
  const teamsList = [...teams];
  if (n % 2 !== 0) {
    teamsList.push(null); // Bye week
  }

  const totalTeams = teamsList.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (totalTeams - 1);
      const away = (totalTeams - 1 - match + round) % (totalTeams - 1);

      // Last team stays in place
      const homeTeam = match === 0 ? teamsList[totalTeams - 1] : teamsList[home];
      const awayTeam = teamsList[away];

      // Skip if either team is a bye
      if (homeTeam && awayTeam) {
        matches.push({
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          match_week: round + 1,
        });
      }
    }
  }

  return matches;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { leagueId } = JSON.parse(event.body || '{}');

    if (!leagueId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'League ID is required' }),
      };
    }

    // Get league info
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (leagueError || !league) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'League not found' }),
      };
    }

    // Get all paid registrations for this league that haven't been converted to teams
    const { data: registrations, error: regError } = await supabase
      .from('league_registrations')
      .select('*')
      .eq('league_id', leagueId)
      .eq('payment_status', 'paid')
      .eq('team_created', false);

    if (regError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch registrations' }),
      };
    }

    if (!registrations || registrations.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No registrations to process' }),
      };
    }

    // Create teams from registrations
    const teamsToInsert = registrations.map(reg => ({
      league_id: leagueId,
      registration_id: reg.id,
      team_name: reg.team_name,
      captain_name: reg.captain_name,
      captain_email: reg.captain_email,
      captain_phone: reg.captain_phone,
      players: reg.players,
    }));

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .insert(teamsToInsert)
      .select();

    if (teamsError) {
      console.error('Error creating teams:', teamsError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to create teams',
          details: teamsError.message
        }),
      };
    }

    // Update registrations to mark teams as created
    const registrationIds = registrations.map(r => r.id);
    await supabase
      .from('league_registrations')
      .update({ team_created: true })
      .in('id', registrationIds);

    // Generate match schedule using round-robin
    const schedule = generateRoundRobin(teams);

    // Calculate dates for each match week
    const startDate = new Date(league.start_date);
    const matchesWithDates = schedule.map((match, index) => {
      const weekNumber = match.match_week - 1;
      const matchDate = new Date(startDate);
      matchDate.setDate(matchDate.getDate() + (weekNumber * 7)); // One week between matches

      return {
        ...match,
        league_id: leagueId,
        scheduled_date: matchDate.toISOString().split('T')[0],
        scheduled_time: '19:00:00', // Default to 7 PM
        field: 'Field 1', // Default field
        status: 'scheduled',
      };
    });

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .insert(matchesWithDates)
      .select();

    if (matchesError) {
      console.error('Error creating matches:', matchesError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Teams created but failed to generate schedule',
          details: matchesError.message
        }),
      };
    }

    // Update league status to active
    await supabase
      .from('leagues')
      .update({ status: 'active' })
      .eq('id', leagueId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `League finalized with ${teams.length} teams and ${matches.length} matches`,
        teams,
        matches,
      }),
    };
  } catch (error) {
    console.error('Error finalizing league:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
