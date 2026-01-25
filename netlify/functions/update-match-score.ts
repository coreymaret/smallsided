import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { matchId, homeScore, awayScore } = JSON.parse(event.body || '{}');

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Match ID, home score, and away score are required' 
        }),
      };
    }

    // Validate scores are non-negative integers
    if (homeScore < 0 || awayScore < 0 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Scores must be non-negative integers' 
        }),
      };
    }

    // Update match with scores and set status to completed
    // The database trigger will automatically update team statistics
    const { data: match, error } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed',
      })
      .eq('id', matchId)
      .select(`
        *,
        home_team:teams!home_team_id(team_name),
        away_team:teams!away_team_id(team_name)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to update match',
          details: error.message
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Match score updated and teams statistics recalculated',
        match,
      }),
    };
  } catch (error) {
    console.error('Error updating match score:', error);
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
