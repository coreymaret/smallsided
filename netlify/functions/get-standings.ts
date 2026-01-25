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
    const { leagueId } = event.queryStringParameters || {};

    if (!leagueId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'League ID is required' }),
      };
    }

    // Use the league_standings view for optimized query
    const { data: standings, error } = await supabase
      .from('league_standings')
      .select('*')
      .eq('league_id', leagueId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch standings' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        standings,
      }),
    };
  } catch (error) {
    console.error('Error fetching standings:', error);
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
