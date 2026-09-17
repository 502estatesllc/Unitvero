'use client';

import { useState } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider
} from '@stripe/react-connect-js';

export default function StripeOnboarding({
  accountId,
  onExit
}) {
  const [stripeConnectInstance] = useState(() => {
    return loadConnectAndInitialize({
      publishableKey:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

      fetchClientSecret: async () => {
        const response = await fetch(
          '/api/create-account-session',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              accountId
            })
          }
        );

        const data = await response.json();

        if (!response.ok || !data.clientSecret) {
          throw new Error(
            data.error ||
              'Could not start payout setup.'
          );
        }

        return data.clientSecret;
      },

      appearance: {
        overlays: 'dialog',
        variables: {
          colorPrimary: '#0f9f8f',
          colorBackground: '#ffffff',
          colorText: '#0b1727',
          borderRadius: '10px',
          fontFamily: 'Manrope, sans-serif'
        }
      }
    });
  });

  return (
    <ConnectComponentsProvider
      connectInstance={stripeConnectInstance}
    >
      <ConnectAccountOnboarding
        onExit={() => {
          if (onExit) {
            onExit();
          }
        }}
      />
    </ConnectComponentsProvider>
  );
}
