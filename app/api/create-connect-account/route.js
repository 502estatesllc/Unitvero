import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);

    const body = await request.json();

    const account = await stripe.accounts.create({
      country: 'US',
      email: body.email || undefined,

      controller: {
        fees: {
          payer: 'application'
        },
        losses: {
          payments: 'application'
        },
        requirement_collection: 'application',
        stripe_dashboard: {
          type: 'none'
        }
      },

      capabilities: {
        card_payments: {
          requested: true
        },
        transfers: {
          requested: true
        }
      }
    });

    return NextResponse.json({
      accountId: account.id
    });
  } catch (error) {
    console.error('Create Stripe account error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Could not create Stripe account.'
      },
      { status: 500 }
    );
  }
}
