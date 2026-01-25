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
    // Parse query parameters
    const params = event.queryStringParameters || {};
    const { type, status, startDate, endDate, limit = '100' } = params;

    // Build query
    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // Apply filters
    if (type) {
      query = query.eq('booking_type', type);
    }

    if (status) {
      query = query.eq('payment_status', status);
    }

    if (startDate) {
      query = query.gte('booking_date', startDate);
    }

    if (endDate) {
      query = query.lte('booking_date', endDate);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch bookings' }),
      };
    }

    // Calculate summary stats
    const stats = {
      total: bookings.length,
      byType: bookings.reduce((acc, b) => {
        acc[b.booking_type] = (acc[b.booking_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: bookings.reduce((acc, b) => {
        acc[b.payment_status] = (acc[b.payment_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalRevenue: bookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        bookings,
        stats,
      }),
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
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
