import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const accountId = body?.accountId;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Stripe account ID is required.' },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard?stripe=refresh`,
      return_url: `${origin}/dashboard?stripe=return`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error('Stripe account link error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Could not start Stripe onboarding.',
      },
      { status: 500 }
    );
  }
}
