import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    const data = JSON.parse(event.body || '{}');

    // Validate required fields
    const requiredFields = [
      'league_id',
      'team_name',
      'captain_name',
      'captain_email',
      'captain_phone',
      'age_division',
      'skill_level',
      'players',
      'total_amount',
      'stripe_payment_intent_id',
      'waiver_signed',
    ];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Check if league exists and has space
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', data.league_id)
      .single();

    if (leagueError || !league) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'League not found' }),
      };
    }

    if (league.current_teams >= league.max_teams) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'League is full' }),
      };
    }

    // Check if team name is already taken in this league
    const { data: existingTeam } = await supabase
      .from('league_registrations')
      .select('id')
      .eq('league_id', data.league_id)
      .eq('team_name', data.team_name)
      .eq('payment_status', 'paid')
      .single();

    if (existingTeam) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Team name already taken for this league' }),
      };
    }

    // Insert registration
    const { data: registration, error } = await supabase
      .from('league_registrations')
      .insert({
        league_id: data.league_id,
        team_name: data.team_name,
        team_experience: data.team_experience || null,
        captain_name: data.captain_name,
        captain_email: data.captain_email,
        captain_phone: data.captain_phone,
        age_division: data.age_division,
        skill_level: data.skill_level,
        players: data.players,
        total_amount: data.total_amount,
        payment_status: 'paid',
        stripe_payment_intent_id: data.stripe_payment_intent_id,
        waiver_signed: data.waiver_signed,
        hear_about_us: data.hear_about_us || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to create registration', 
          details: error.message 
        }),
      };
    }

    // TODO: Send confirmation email to captain
    // TODO: Send notification to admin

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        registration,
      }),
    };
  } catch (error) {
    console.error('Error creating league registration:', error);
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
