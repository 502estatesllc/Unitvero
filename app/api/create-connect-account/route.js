import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      metadata: {
        platform: 'Unitvero',
      },
    });

    return NextResponse.json({
      accountId: account.id,
    });
  } catch (error) {
    console.error('Stripe connected account error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Could not create Stripe connected account.',
      },
      { status: 500 }
    );
  }
}
