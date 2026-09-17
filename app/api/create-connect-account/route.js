import { NextResponse } from 'next/server';

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

    const stripeResponse = await fetch(
      'https://api.stripe.com/v2/core/accounts',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_email: email,
          display_name: 'Unitvero Landlord',

          dashboard: 'express',

          identity: {
            country: 'us'
          },

          defaults: {
            currency: 'usd',
            responsibilities: {
              fees_collector: 'application',
              losses_collector: 'application'
            }
          },

          configuration: {
            merchant: {
              capabilities: {
                card_payments: {
                  requested: true
                },
                stripe_balance: {
                  payouts: {
                    requested: true
                  }
                }
              }
            }
          },

          include: [
            'configuration.merchant',
            'identity',
            'requirements'
          ]
        })
      }
    );

    const account = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('Stripe Accounts v2 error:', account);

      return NextResponse.json(
        {
          error:
            account?.error?.message ||
            'Could not create Stripe connected account.'
        },
        { status: stripeResponse.status }
      );
    }

    return NextResponse.json({
      accountId: account.id
    });
  } catch (error) {
    console.error('Stripe connected account error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Could not create Stripe connected account.'
      },
      { status: 500 }
    );
  }
}
