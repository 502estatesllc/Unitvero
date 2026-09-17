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
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Stripe account ID is required.' },
        { status: 400 }
      );
    }

    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: {
          enabled: true,
          features: {
            external_account_collection: true,
            disable_stripe_user_authentication: true
          }
        }
      }
    });

    return NextResponse.json({
      clientSecret: accountSession.client_secret
    });
  } catch (error) {
    console.error('Create account session error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Could not start payout setup.'
      },
      { status: 500 }
    );
  }
}
