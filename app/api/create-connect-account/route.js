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

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: 'You must be signed in to manage Stripe payout settings.' };
  }

  return { user };
}

export async function POST() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }

    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
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

    const stripe = new Stripe(secretKey);
    const email = user.email || undefined;

    const account = await stripe.accounts.create({
      country: 'US',
      email,
      controller: {
        fees: { payer: 'application' },
        losses: { payments: 'application' },
        requirement_collection: 'application',
        stripe_dashboard: { type: 'none' },
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const { error: saveError } = await supabase
      .from('landlord_payment_accounts')
      .upsert(
        {
          landlord_id: user.id,
          provider: 'stripe',
          stripe_account_id: account.id,
          onboarding_complete: false,
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
        },
        { onConflict: 'landlord_id' },
      );

    if (saveError) {
      throw new Error(saveError.message);
    }

    return NextResponse.json({ accountId: account.id });
  } catch (error) {
    console.error('Create Stripe account error:', error);
    return NextResponse.json({ error: error?.message || 'Could not create Stripe account.' }, { status: 500 });
  }
}
