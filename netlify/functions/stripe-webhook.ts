import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const handler: Handler = async (event) => {
  // Stripe webhooks must be POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];

  if (!sig) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No signature' }),
    };
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' }),
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(stripeEvent.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(stripeEvent.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Update bookings
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ payment_status: 'paid' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (bookingError) {
    console.error('Failed to update booking:', bookingError);
  }

  // Update league registrations
  const { error: regError } = await supabase
    .from('league_registrations')
    .update({ payment_status: 'paid' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (regError) {
    console.error('Failed to update registration:', regError);
  }

  // TODO: Send confirmation email
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  // Update bookings
  await supabase
    .from('bookings')
    .update({ payment_status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Update league registrations
  await supabase
    .from('league_registrations')
    .update({ payment_status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // TODO: Send payment failed notification
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;

  // Update bookings
  await supabase
    .from('bookings')
    .update({ payment_status: 'refunded' })
    .eq('stripe_payment_intent_id', paymentIntentId);

  // Update league registrations
  await supabase
    .from('league_registrations')
    .update({ payment_status: 'refunded' })
    .eq('stripe_payment_intent_id', paymentIntentId);

  // TODO: Send refund confirmation email
}
