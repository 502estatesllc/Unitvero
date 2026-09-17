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

    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Stripe account ID is required.' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);

    const origin = request.nextUrl.origin;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard`,
      return_url: `${origin}/dashboard`,
      type: 'account_onboarding'
    });

    return NextResponse.json({
      url: accountLink.url
    });
  } catch (error) {
    console.error('Stripe account link error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Could not start Stripe onboarding.'
      },
      { status: 500 }
    );
  }
}
