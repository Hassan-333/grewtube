import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const planMapping: Record<string, { product_id: string; price_id: string; amount: number }> = {
  free: {
    product_id: 'prod_QpVanITngpLECk',
    price_id: 'price_1PxqZ9HKrMJi6qxuIoBYT92l',
    amount: 0,
  },
  pro: {
    product_id: 'prod_QpVbKBbB8lDz1j',
    price_id: 'price_1PxqZxHKrMJi6qxuM0gNM697',
    amount: 10000,
  },
};

export async function POST(request: Request) {
  // Stripe is optional for local development.
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payments aren't configured on this server." }, { status: 503 });
  }
  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  try {
    const { planType } = await request.json();

    if (!(planType in planMapping)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Send the user back to whatever host the app is running on.
    const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: planMapping[planType].price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard`,
      cancel_url: `${baseUrl}/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating payment session:', error);
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
