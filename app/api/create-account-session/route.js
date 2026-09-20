import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: 'You must be signed in to manage Stripe payout settings.',
    };
  }

  return { user };
}

export async function POST(request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 },
      );
    }

    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Stripe account ID is required.' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      },
    );

    const { data: accountRecord, error: accountError } = await supabase
      .from('landlord_payment_accounts')
      .select('id, landlord_id, stripe_account_id')
      .eq('landlord_id', user.id)
      .eq('stripe_account_id', accountId)
      .maybeSingle();

    if (accountError) {
      throw new Error(accountError.message);
    }

    if (!accountRecord) {
      return NextResponse.json(
        { error: 'This Stripe account is not linked to your account.' },
        { status: 403 },
      );
    }

    const stripe = new Stripe(secretKey);

    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: {
          enabled: true,
          features: {
            external_account_collection: true,
            disable_stripe_user_authentication: true,
          },
        },
      },
    });

    return NextResponse.json({
      clientSecret: accountSession.client_secret,
    });
  } catch (error) {
    console.error('Create account session error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Could not start payout setup.',
      },
      { status: 500 },
    );
  }
}
