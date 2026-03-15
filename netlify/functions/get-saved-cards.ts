// netlify/functions/get-saved-cards.ts
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  try {
    const { email } = JSON.parse(event.body ?? '{}');
    if (!email) return { statusCode: 400, body: JSON.stringify({ error: 'Email required' }) };

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return { statusCode: 200, body: JSON.stringify({ cards: [] }) };
    }

    const customerId = customers.data[0].id;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    const cards = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand ?? 'unknown',
      last4: pm.card?.last4 ?? '0000',
      exp_month: pm.card?.exp_month ?? 0,
      exp_year:  pm.card?.exp_year  ?? 0,
    }));

    return { statusCode: 200, body: JSON.stringify({ cards }) };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
