import Link from 'next/link';

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#edf4ff', color: '#0f172a', padding: '40px 18px 80px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 24px 70px rgba(15, 23, 42, 0.08)', border: '1px solid #dfe8f3', overflow: 'hidden' }}>
        <header style={{ background: 'linear-gradient(135deg, #0f172a, #17263f)', color: '#fff', padding: '28px 28px 22px' }}>
          <Link href="/" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 800, letterSpacing: '.08em' }}>UNITVERO</Link>
          <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(2rem, 3vw, 3rem)', letterSpacing: '-0.06em' }}>Terms of Service</h1>
        </header>

        <div style={{ padding: '28px 28px 40px', display: 'grid', gap: 22, lineHeight: 1.7 }}>
          <p>These terms describe the basic use of Unitvero as a property-management and rental workflow application. The product is provided to assist landlords and tenants in managing rental activity, documents, payments, communications, and maintenance workflows.</p>

          <section>
            <h2>1. Service use</h2>
            <p>Users are responsible for accurate account information, authorized access, and compliance with applicable local, state, and federal requirements. Unitvero is not a legal advisor and does not replace professional advice when required.</p>
          </section>

          <section>
            <h2>2. Account responsibility</h2>
            <p>Landlords, tenants, and other users must maintain secure account credentials and use only authorized access. Shared account use, unauthorized access, or misuse of data is the responsibility of the account holder.</p>
          </section>

          <section>
            <h2>3. Data and records</h2>
            <p>Unitvero may store property, tenancy, payment, maintenance, document, and communication records needed for the service. Users remain responsible for the information they submit and for any required notices, disclosures, or record retention practices in their jurisdiction.</p>
          </section>

          <section>
            <h2>4. Service providers</h2>
            <p>Unitvero may rely on third-party processors and infrastructure for authentication, storage, messaging, and payment processing where these tools are part of the product. Service integrations are subject to their respective terms and policies.</p>
          </section>

          <section>
            <h2>5. Changes</h2>
            <p>Unitvero may update product features or documentation from time to time. Continued use of the service after changes indicates acceptance of the updated terms.</p>
          </section>

          <section>
            <h2>6. Contact</h2>
            <p>For questions about the service or account access, use the support contact available on the Unitvero support page.</p>
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1px solid #ece6d8', paddingTop: 18, color: '#5d6878' }}>
            <Link href="/privacy" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Privacy</Link>
            <Link href="/support" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Support</Link>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
