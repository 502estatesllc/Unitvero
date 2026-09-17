import Link from 'next/link';

export default function Home() {
  return (
    <main className="unitveroLanding">

      {/* NAV */}
      <nav className="landingNav">
        <Link href="/" className="landingLogo">
          unit<span>vero</span>
        </Link>

        <div className="landingNavLinks">
          <a href="#features">Features</a>
          <a href="#payments">Rent Collection</a>
          <a href="#management">Management</a>

          <Link className="landingSignIn" href="/login">
            Sign in
          </Link>

          <Link className="landingGetStarted" href="/login">
            Get started
          </Link>
        </div>
      </nav>


      {/* HERO */}
      <section className="unitveroHero">

        <div className="heroContent">
          <div className="heroBadge">
            PROPERTY MANAGEMENT, SIMPLIFIED
          </div>

          <h1>
            Manage your rentals.
            <br />
            <span>All in one place.</span>
          </h1>

          <p className="heroDescription">
            Unitvero gives landlords one simple workspace to
            manage properties, tenants, rent, leases, payments,
            maintenance and communication.
          </p>

          <div className="heroActions">
            <Link className="heroPrimary" href="/login">
              Get started →
            </Link>

            <Link className="heroSecondary" href="/dashboard">
              Preview dashboard
            </Link>
          </div>

          <div className="heroTrust">
            <span>✓ Built for landlords</span>
            <span>✓ Simple rent tracking</span>
            <span>✓ One organized workspace</span>
          </div>
        </div>


        {/* DASHBOARD PREVIEW */}
        <div className="heroDashboard">

          <div className="previewSidebar">
            <div className="previewLogo">
              unit<span>vero</span>
            </div>

            <small>WORKSPACE</small>

            <div className="previewActive">⌂ Overview</div>
            <div>▦ Properties</div>
            <div>♙ Tenants</div>
            <div>$ Rent</div>
            <div>↗ Payments</div>

            <small>MANAGEMENT</small>

            <div>▤ Leases</div>
            <div>▣ Applications</div>
            <div>✉ Messages</div>
            <div>◇ Maintenance</div>
          </div>

          <div className="previewMain">

            <div className="previewHeader">
              <div>
                <small>LANDLORD DASHBOARD</small>
                <h3>Your portfolio</h3>
              </div>

              <button>+ Add Property</button>
            </div>

            <div className="previewStats">

              <article>
                <span>Properties</span>
                <b>8</b>
                <small>12 RENTABLE UNITS</small>
              </article>

              <article>
                <span>Occupied</span>
                <b>10</b>
                <small>83% OCCUPANCY</small>
              </article>

              <article>
                <span>Monthly Rent</span>
                <b>$12,450</b>
                <small>EXPECTED</small>
              </article>

            </div>

            <div className="previewPanels">

              <article>
                <small>RENT COLLECTION</small>
                <h4>Track every payment</h4>

                <div className="fakeProgress">
                  <span></span>
                </div>

                <b className="previewAmount">$10,875 collected</b>
              </article>

              <article>
                <small>PORTFOLIO</small>
                <h4>Occupancy</h4>

                <div className="occupancyPreview">
                  <b>83%</b>
                  <span>10 of 12 units occupied</span>
                </div>
              </article>

            </div>

          </div>
        </div>

      </section>


      {/* PRODUCT INTRO */}
      <section className="landingIntro" id="features">

        <div className="sectionEyebrow">
          EVERYTHING IN ONE PLACE
        </div>

        <h2>
          Less paperwork.
          <br />
          More control over your rentals.
        </h2>

        <p>
          Unitvero brings the everyday tools landlords need
          into one organized property management workspace.
        </p>

      </section>


      {/* FEATURES */}
      <section className="landingFeatures">

        <article>
          <div className="featureIcon">▦</div>

          <small>PORTFOLIO</small>

          <h3>Property Management</h3>

          <p>
            Organize single-family and multi-unit properties,
            occupancy, tenants and monthly rent.
          </p>

          <span>Manage your portfolio →</span>
        </article>


        <article id="payments">
          <div className="featureIcon">$</div>

          <small>FINANCIALS</small>

          <h3>Rent & Payments</h3>

          <p>
            Track rent charges, payments, outstanding balances,
            collection performance and landlord payouts.
          </p>

          <span>Stay on top of rent →</span>
        </article>


        <article>
          <div className="featureIcon">♙</div>

          <small>TENANTS</small>

          <h3>Tenant Management</h3>

          <p>
            Keep tenant information, lease dates, rent amounts
            and property assignments organized.
          </p>

          <span>Keep tenants organized →</span>
        </article>


        <article>
          <div className="featureIcon">▣</div>

          <small>LEASING</small>

          <h3>Applications</h3>

          <p>
            Manage rental applications and keep the screening
            process connected to your properties.
          </p>

          <span>Manage applicants →</span>
        </article>


        <article id="management">
          <div className="featureIcon">✉</div>

          <small>COMMUNICATION</small>

          <h3>Messages & Announcements</h3>

          <p>
            Keep landlord and tenant communication organized
            alongside the property it belongs to.
          </p>

          <span>Keep communication together →</span>
        </article>


        <article>
          <div className="featureIcon">◇</div>

          <small>MAINTENANCE</small>

          <h3>Maintenance Tracking</h3>

          <p>
            Keep maintenance requests organized from the
            initial issue through completion.
          </p>

          <span>Track property issues →</span>
        </article>

      </section>


      {/* CTA */}
      <section className="landingCTA">

        <div>
          <small>SMART PROPERTY MANAGEMENT</small>

          <h2>
            Your rentals deserve
            <br />
            a better workspace.
          </h2>

          <p>
            Bring your properties, tenants, rent and daily
            management into Unitvero.
          </p>
        </div>

        <Link href="/login">
          Get started with Unitvero →
        </Link>

      </section>


      {/* FOOTER */}
      <footer className="landingFooter">

        <div>
          <b className="landingLogo">
            unit<span>vero</span>
          </b>

          <p>
            Smart property management, made simple.
          </p>
        </div>

        <div>
          <Link href="/login">Sign in</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>

        <small>
          Unitvero is operated by 502 Estates LLC.
        </small>

      </footer>

    </main>
  );
}
