import Link from 'next/link';

export default function SupportPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f4ef', color: '#101212', padding: '40px 18px 80px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 24px 70px rgba(0,0,0,.08)', border: '1px solid #e8e3d7', overflow: 'hidden' }}>
        <header style={{ background: '#0b0d0e', color: '#f7f5ee', padding: '28px 28px 22px' }}>
          <Link href="/" style={{ color: '#f4c84f', textDecoration: 'none', fontWeight: 800, letterSpacing: '.08em' }}>UNITVERO</Link>
          <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(2rem, 3vw, 3rem)', letterSpacing: '-0.06em' }}>Support</h1>
        </header>

        <div style={{ padding: '28px 28px 40px', display: 'grid', gap: 22, lineHeight: 1.7 }}>
          <p>Need help with your Unitvero account? Use the categories below to find the right support path.</p>

          <section style={{ display: 'grid', gap: 12 }}>
            <h2>Common help categories</h2>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>Account access:</strong> sign-in issues, password resets, invitation acceptance, account lockouts, and role access.</li>
              <li><strong>Payments:</strong> rent payment issues, payout setup, Stripe onboarding, failed charges, and payment history questions.</li>
              <li><strong>Maintenance:</strong> submitting repair requests, upload issues, expense records, and receipt questions.</li>
              <li><strong>Privacy / delete account:</strong> account data review, privacy questions, or deletion requests.</li>
            </ul>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Contact support at <strong>support@unitvero.app</strong> or use your configured support channel if a different address is provided in your production environment.</p>
            <p style={{ color: '#5d6878' }}>If no final support email is configured yet, use this placeholder and replace it with the production support address before launch.</p>
          </section>

          <section>
            <h2>Need help faster?</h2>
            <p>Include your account email, the page you were viewing, the issue you expected, and any screenshots or error messages to help us review it quickly.</p>
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1px solid #ece6d8', paddingTop: 18, color: '#5d6878' }}>
            <Link href="/privacy" style={{ color: '#0f9f8f', textDecoration: 'none', fontWeight: 700 }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#0f9f8f', textDecoration: 'none', fontWeight: 700 }}>Terms</Link>
            <Link href="/" style={{ color: '#0f9f8f', textDecoration: 'none', fontWeight: 700 }}>Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
