import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// NOTE: the event handlers below only log. Paying for Pro does not change
// anything on the user's account yet.
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !endpointSecret) {
    return NextResponse.json({ error: "Payments aren't configured on this server." }, { status: 503 });
  }
  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Webhook Error: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed:', event.data.object.id);
      break;
    case 'invoice.paid':
      console.log('Invoice paid:', event.data.object.id);
      break;
    case 'invoice.payment_failed':
      console.log('Invoice payment failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
