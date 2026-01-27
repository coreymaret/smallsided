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

    console.log('📝 Received booking data:', JSON.stringify(data, null, 2));

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
        console.error(`❌ Missing field: ${field}`);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Build the booking object with only the fields we know exist
    const bookingData: any = {
      booking_type: data.booking_type,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      booking_date: data.booking_date,
      total_amount: data.total_amount,
      payment_status: 'paid',
      stripe_payment_intent_id: data.stripe_payment_intent_id,
    };

    // Add optional fields only if they exist in the data
    if (data.start_time) bookingData.start_time = data.start_time;
    if (data.end_time) bookingData.end_time = data.end_time;
    if (data.field_id) bookingData.field_id = data.field_id;
    if (data.participants) bookingData.participants = data.participants;
    if (data.metadata) bookingData.metadata = data.metadata;
    
    // Try to add special_requests - if column doesn't exist, it will be in metadata instead
    if (data.special_requests) {
      bookingData.special_requests = data.special_requests;
    }

    console.log('💾 Attempting to insert:', JSON.stringify(bookingData, null, 2));

    // Insert booking into database
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      
      // If error is about missing column, try without that column
      if (error.message.includes('special_requests')) {
        console.log('⚠️ special_requests column not found, retrying without it...');
        delete bookingData.special_requests;
        
        // Put special_requests in metadata instead
        if (data.special_requests) {
          bookingData.metadata = {
            ...(bookingData.metadata || {}),
            special_requests: data.special_requests
          };
        }
        
        const { data: retryBooking, error: retryError } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();
        
        if (retryError) {
          console.error('❌ Retry failed:', retryError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to create booking', 
              details: retryError.message 
            }),
          };
        }
        
        console.log('✅ Booking created (retry):', retryBooking);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            booking: retryBooking,
          }),
        };
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to create booking', 
          details: error.message 
        }),
      };
    }

    console.log('✅ Booking created successfully:', booking);

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
    console.error('💥 Error creating booking:', error);
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