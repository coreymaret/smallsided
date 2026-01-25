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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const { leagueId, status, upcoming } = params;

    let query = supabase
      .from('matches')
      .select(`
        *,
        league:leagues(name, season),
        home_team:teams!home_team_id(id, team_name),
        away_team:teams!away_team_id(id, team_name)
      `)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (leagueId) {
      query = query.eq('league_id', leagueId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query = query
        .gte('scheduled_date', today)
        .in('status', ['scheduled', 'in_progress']);
    }

    const { data: matches, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch matches' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        matches,
      }),
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
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
