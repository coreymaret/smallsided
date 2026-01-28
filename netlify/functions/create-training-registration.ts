// Netlify Function: create-training-registration
// Handles training session registrations and stores them in Supabase

import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
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
      'training_type',
      'player_name',
      'player_age',
      'parent_name',
      'parent_email',
      'parent_phone',
      'skill_level',
      'focus_areas',
      'preferred_days',
      'preferred_time',
      'stripe_payment_intent_id',
      'total_amount',
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          missing: missingFields,
        }),
      };
    }

    // Insert into training_registrations table
    const { data: registration, error } = await supabase
      .from('training_registrations')
      .insert([
        {
          training_type: data.training_type,
          player_name: data.player_name,
          player_age: data.player_age,
          parent_name: data.parent_name,
          parent_email: data.parent_email,
          parent_phone: data.parent_phone,
          skill_level: data.skill_level,
          focus_areas: data.focus_areas, // Array
          preferred_days: data.preferred_days, // Array
          preferred_time: data.preferred_time,
          additional_info: data.additional_info || null,
          stripe_payment_intent_id: data.stripe_payment_intent_id,
          total_amount: data.total_amount,
          status: 'pending', // pending, confirmed, cancelled
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }

    // TODO: Send confirmation email via SendGrid/Resend/etc.
    // await sendConfirmationEmail(registration);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        registration,
        message: 'Training registration created successfully',
      }),
    };
  } catch (error) {
    console.error('Error creating training registration:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};