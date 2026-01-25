import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
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
      'booking_type',
      'customer_name',
      'customer_email',
      'customer_phone',
      'booking_date',
      'total_amount',
      'stripe_payment_intent_id',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Insert booking into database
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        booking_type: data.booking_type,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        booking_date: data.booking_date,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        field_id: data.field_id || null,
        participants: data.participants || null,
        total_amount: data.total_amount,
        payment_status: 'paid', // Assuming payment already processed
        stripe_payment_intent_id: data.stripe_payment_intent_id,
        metadata: data.metadata || {},
        special_requests: data.special_requests || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create booking', details: error.message }),
      };
    }

    // TODO: Send confirmation email to customer
    // TODO: Send notification to admin

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        booking,
      }),
    };
  } catch (error) {
    console.error('Error creating booking:', error);
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
