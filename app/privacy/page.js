import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f4ef', color: '#101212', padding: '40px 18px 80px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 24px 70px rgba(0,0,0,.08)', border: '1px solid #e8e3d7', overflow: 'hidden' }}>
        <header style={{ background: '#0b0d0e', color: '#f7f5ee', padding: '28px 28px 22px' }}>
          <Link href="/" style={{ color: '#f4c84f', textDecoration: 'none', fontWeight: 800, letterSpacing: '.08em' }}>UNITVERO</Link>
          <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(2rem, 3vw, 3rem)', letterSpacing: '-0.06em' }}>Privacy Policy</h1>
        </header>

        <div style={{ padding: '28px 28px 40px', display: 'grid', gap: 22, lineHeight: 1.7 }}>
          <p>This Privacy Policy describes how Unitvero handles information in the course of providing property management, rent, messaging, maintenance, document, and account services.</p>

          <section>
            <h2>1. Information we handle</h2>
            <p>We may process account information, landlord and tenant profile data, property and unit details, lease and tenancy records, payment and payout data, maintenance requests and expenses, maintenance documents and receipts, messaging content, and document signatures necessary to operate the product.</p>
          </section>

          <section>
            <h2>2. Service providers</h2>
            <p>Where used, Unitvero may share data with third-party service providers for authentication, storage, payment processing, and Stripe Connect onboarding. We only use providers that are necessary to provide the service and comply with applicable requirements.</p>
          </section>

          <section>
            <h2>3. Data categories</h2>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Account and profile data</li>
              <li>Property, unit, tenancy, and lease records</li>
              <li>Tenant and landlord payment information</li>
              <li>Maintenance requests, expenses, and receipts</li>
              <li>Documents, signatures, and messaging history</li>
              <li>Security and audit information related to account access</li>
            </ul>
          </section>

          <section>
            <h2>4. How we use data</h2>
            <p>We use data to provide access to accounts and properties, coordinate rent and payment workflows, manage maintenance and document tasks, support communications, maintain security, and meet basic operational and legal obligations associated with the service.</p>
          </section>

          <section>
            <h2>5. Retention and access</h2>
            <p>We retain information as long as needed to operate the product, meet legal or business obligations, resolve disputes, or support account activity. Access is limited to authorized landlord, tenant, or support workflows appropriate to the data involved.</p>
          </section>

          <section>
            <h2>6. Your choices</h2>
            <p>If you need to update account details, request account/data deletion, or review support options, contact the support contact listed in the Unitvero support page. The app may also provide in-product settings for privacy and account access where relevant.</p>
          </section>

          <section>
            <h2>7. Contact</h2>
            <p>For privacy questions, please use the contact information on the Unitvero support page or the appropriate support channel configured for the product.</p>
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1px solid #ece6d8', paddingTop: 18, color: '#5d6878' }}>
            <Link href="/terms" style={{ color: '#0f9f8f', textDecoration: 'none', fontWeight: 700 }}>Terms</Link>
            <Link href="/support" style={{ color: '#0f9f8f', textDecoration: 'none', fontWeight: 700 }}>Support</Link>
            <Link href="/" style={{ color: '#0f9f8f', textDecoration: 'none', fontWeight: 700 }}>Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
